document.addEventListener("DOMContentLoaded", function () {

  const list = document.getElementById("post-list");
  const subMenu = document.getElementById("sub-menu");

  const params = new URLSearchParams(location.search);
  const category = params.get("cat");
  const sub = params.get("sub");

  // =========================
  // 📸 PHOTOS
  // =========================
  if (category === "photos") {

    list.className = "photo-grid";
    list.innerHTML = "";

    const formats = ["jpg","jpeg","png","webp","gif"];

    for (let i = 1; i <= 300; i++) {
      formats.forEach(ext => {

        const img = new Image();
        img.src = `photos/${i}.${ext}`;

        img.onload = function () {

          const item = document.createElement("div");
          item.className = "photo-card";
          item.innerHTML = `<img src="${img.src}">`;

          item.onclick = () => {
            location.href = `viewer.html?img=${encodeURIComponent(img.src)}&from=photos`;
          };

          list.appendChild(item);
        };
      });
    }
    return;
  }

  // =========================
  // 📝 POSTS (Cloudflare 안정판)
  // =========================

  fetch("posts/_list.json")
    .then(res => res.json())
    .then(files => {

      if (!files.length) {
        list.innerHTML = "글이 없습니다.";
        return;
      }

      return Promise.all(
        files.map(f => fetch(`posts/${f}`).then(r => r.json()))
      );
    })
    .then(originalPosts => {

      let posts = [...originalPosts];

      if (category) {
        posts = posts.filter(p => p.category === category);
      }

      // 서브메뉴
      if (category === "diary") {

        const subs = [];

        originalPosts.forEach(p => {
          if (p.category === "diary" && p.sub && !subs.includes(p.sub)) {
            subs.push(p.sub);
          }
        });

        if (subs.length) {
          let html = `<div class="sub-links">`;
          html += `<a href="index.html?cat=diary"${!sub ? ' class="active"' : ''}>전체</a>`;

          subs.forEach(s => {
            html += `<a href="index.html?cat=diary&sub=${encodeURIComponent(s)}"${
              sub === s ? ' class="active"' : ''
            }>${s}</a>`;
          });

          html += `</div>`;
          subMenu.innerHTML = html;
        }
      }

      if (sub) {
        posts = posts.filter(p => p.sub === sub);
      }

      posts.sort((a, b) => new Date(b.date) - new Date(a.date));

      list.innerHTML = "";

      posts.forEach(post => {

        const item = document.createElement("div");
        item.className = "post-item";

        item.innerHTML = `
          <h3>${post.title}</h3>
          <span class="date">${post.date}</span>
          <p>${post.excerpt || "내용 보기"}</p>
        `;

        item.onclick = () => {
          let from = "home";
          if (category === "diary") {
            from = sub ? `diary-${sub}` : "diary-all";
          }
          location.href =
            `viewer.html?post=posts/${post.date}.json&from=${encodeURIComponent(from)}`;
        };

        list.appendChild(item);
      });

    })
    .catch(() => {
      list.innerHTML = "글을 불러오지 못했습니다.";
    });

});
