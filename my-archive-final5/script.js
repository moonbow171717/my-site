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

    for (let i = 1; i <= 200; i++) {
      formats.forEach(ext => {

        const img = new Image();
        img.src = `photos/${i}.${ext}`;

        img.onload = function () {

          const item = document.createElement("div");
          item.className = "photo-card";

          item.innerHTML = `<img src="${img.src}" />`;

          item.onclick = function () {
            location.href = `viewer.html?img=${encodeURIComponent(img.src)}&from=photos`;
          };

          list.appendChild(item);
        };

      });
    }

    return;
  }

  // =========================
  // 📝 POSTS
  // =========================

  fetch("posts/index.json")
    .then(res => res.json())
    .then(originalPosts => {

      let posts = [...originalPosts];

      // 카테고리 필터
      if (category) {
        posts = posts.filter(p => p.category === category);
      }

      // -------------------------
      // 📂 Diary 서브메뉴 생성
      // -------------------------
      if (category === "diary") {

        const subs = [];

        originalPosts.forEach(p => {
          if (p.category === "diary" && p.sub && !subs.includes(p.sub)) {
            subs.push(p.sub);
          }
        });

        if (subs.length > 0) {

          let html = '<div class="sub-links">';
          html += `<a href="index.html?cat=diary"${!sub ? ' class="active"' : ''}>전체</a>`;

          subs.forEach(s => {
            html += `<a href="index.html?cat=diary&sub=${encodeURIComponent(s)}"${
              sub === s ? ' class="active"' : ''
            }>${s}</a>`;
          });

          html += '</div>';
          subMenu.innerHTML = html;
        }
      }

      // 서브 필터
      if (sub) {
        posts = posts.filter(p => p.sub === sub);
      }

      // 🔥 날짜 최신순 정렬
      posts.sort((a, b) => b.date.localeCompare(a.date));

      list.innerHTML = "";

      // 목록 출력
      posts.forEach(post => {

        const item = document.createElement("div");
        item.className = "post-item";

        item.innerHTML = `
          <h3>${post.title}</h3>
          <span class="date">${post.date}</span>
          <p>${post.excerpt || ""}</p>
        `;

        item.onclick = function () {

          let from = "home";

          if (category === "diary") {
            from = sub ? `diary-${sub}` : "diary-all";
          }

          location.href = `viewer.html?post=posts/${post.file}&from=${encodeURIComponent(from)}`;
        };

        list.appendChild(item);
      });

    })
    .catch(() => {
      list.innerHTML = "글을 불러오지 못했습니다.";
    });

});