document.addEventListener("DOMContentLoaded", () => {

  const list = document.getElementById("post-list");
  const subMenu = document.getElementById("sub-menu");

  const params = new URLSearchParams(location.search);
  const category = params.get("cat");
  const sub = params.get("sub");

  // 📸 Photos
  if (category === "photos") {
    list.className = "photo-grid";
    const formats = ["jpg","jpeg","png","webp","gif"];
    for (let i = 1; i <= 300; i++) {
      formats.forEach(ext => {
        const img = new Image();
        img.src = `photos/${i}.${ext}`;
        img.onload = () => {
          const item = document.createElement("div");
          item.className = "photo-card";
          item.innerHTML = `<img src="${img.src}">`;
          item.onclick = () =>
            location.href = `viewer.html?img=${encodeURIComponent(img.src)}&from=photos`;
          list.appendChild(item);
        };
      });
    }
    return;
  }

  // 📝 POSTS
  fetch("posts/index.json")
    .then(r => r.json())
    .then(originalPosts => {

      let posts = [...originalPosts];
      if (category) posts = posts.filter(p => p.category === category);

      if (category === "diary") {
        const subs = [...new Set(originalPosts.filter(p => p.sub).map(p => p.sub))];
        if (subs.length) {
          subMenu.innerHTML =
            `<a href="index.html?cat=diary">전체</a>` +
            subs.map(s =>
              `<a href="index.html?cat=diary&sub=${encodeURIComponent(s)}">${s}</a>`
            ).join("");
        }
      }

      if (sub) posts = posts.filter(p => p.sub === sub);
      posts.sort((a,b) => new Date(b.date) - new Date(a.date));

      list.innerHTML = "";
      posts.forEach(p => {
        const item = document.createElement("div");
        item.className = "post-item";
        item.innerHTML = `
          <h3>${p.title}</h3>
          <span class="date">${p.date}</span>
          <p>${p.excerpt || "내용 보기"}</p>
        `;
        item.onclick = () =>
          location.href = `viewer.html?post=posts/${p.date}.json&from=home`;
        list.appendChild(item);
      });
    })
    .catch(() => {
      list.innerHTML = "글을 불러오지 못했습니다.";
    });
});
