document.addEventListener("DOMContentLoaded", () => {

  // 🔐 로그인 체크 (여기서만!)
  if (!sessionStorage.getItem("auth")) {
    location.href = "login.html";
    return;
  }

  const list = document.getElementById("post-list");
  const subMenu = document.getElementById("sub-menu");

  const params = new URLSearchParams(location.search);
  const category = params.get("cat");
  const sub = params.get("sub");

  // =========================
  // 📸 Photos
  // =========================
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
          item.onclick = () => {
            location.href =
              `viewer.html?img=${encodeURIComponent(img.src)}&from=photos`;
          };
          list.appendChild(item);
        };
      });
    }
    return;
  }

  // =========================
  // 📝 Posts
  // =========================
  fetch("posts/index.json")
    .then(r => {
      if (!r.ok) throw new Error("index.json 못 불러옴");
      return r.json();
    })
    .then(originalPosts => {

      if (!Array.isArray(originalPosts) || originalPosts.length === 0) {
        list.innerHTML = "글이 없습니다.";
        return;
      }

      // ✅ file 있는 글만 사용 (중요)
      let posts = originalPosts.filter(p => p.file);

      if (category) {
        posts = posts.filter(p => p.category === category);
      }

      // =========================
      // 서브메뉴 (Diary)
      // =========================
      if (category === "diary") {
        const subs = [...new Set(
          originalPosts
            .filter(p => p.category === "diary" && p.sub)
            .map(p => p.sub)
        )];

        if (subs.length) {
          let html =
            `<a href="index.html?cat=diary"${!sub ? ' class="active"' : ''}>전체</a>`;

          subs.forEach(s => {
            html +=
              `<a href="index.html?cat=diary&sub=${encodeURIComponent(s)}"${
                sub === s ? ' class="active"' : ''
              }>${s}</a>`;
          });

          subMenu.innerHTML = html;
        }
      }

      if (sub) {
        posts = posts.filter(p => p.sub === sub);
      }

      posts.sort((a, b) => new Date(b.date) - new Date(a.date));

      list.innerHTML = "";

      posts.forEach(p => {
        const item = document.createElement("div");
        item.className = "post-item";
        item.innerHTML = `
          <h3>${p.title}</h3>
          <span class="date">${p.date}</span>
          <p>${p.excerpt || "내용 보기"}</p>
        `;

        item.onclick = () => {
          location.href =
            `viewer.html?post=${encodeURIComponent(p.file)}&from=home`;
        };

        list.appendChild(item);
      });
    })
    .catch(err => {
      console.error(err);
      list.innerHTML = "글을 불러오지 못했습니다.";
    });
});
