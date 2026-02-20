document.addEventListener("DOMContentLoaded", function () {

  const list = document.getElementById("post-list");
  const subMenu = document.getElementById("sub-menu");

  const params = new URLSearchParams(location.search);
  const category = params.get("cat");
  const sub = params.get("sub");

  if (category === "photos") {
    list.className = "photo-grid";
    list.innerHTML = "";

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

  fetch("posts/_list.json")
    .then(r => r.json())
    .then(files =>
      Promise.all(
        files.map(f =>
          fetch(`posts/${f}`).then(r => r.ok ? r.json() : null).catch(() => null)
        )
      )
    )
    .then(all => {
      const originalPosts = all.filter(Boolean);
      if (!originalPosts.length) {
        list.innerHTML = "글이 없습니다.";
        return;
      }

      let posts = [...originalPosts];
      if (category) posts = posts.filter(p => p.category === category);

      if (category === "diary") {
        const subs = [];
        originalPosts.forEach(p => {
          if (p.category === "diary" && p.sub && !subs.includes(p.sub)) {
            subs.push(p.sub);
          }
        });

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
