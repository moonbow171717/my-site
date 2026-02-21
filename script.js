document.addEventListener("DOMContentLoaded", () => {
  const list = document.getElementById("post-list");
  const subMenu = document.getElementById("sub-menu");
  const menuBtn = document.getElementById("menuBtn");
  const sidebar = document.getElementById("sidebar");

  // ☰ 버튼 클릭 기능 연결
  if (menuBtn) {
    menuBtn.onclick = () => {
      sidebar.classList.toggle("open");
    };
  }

  const params = new URLSearchParams(location.search);
  const category = params.get("cat");
  const sub = params.get("sub");

  // =========================
  // 📸 Photos 로직
  // =========================
  if (category === "photos") {
    // 사진첩일 때도 사이드바 메뉴에 글자를 넣어줍니다.
    subMenu.innerHTML = `<a href="index.html?cat=photos" class="active">모든 사진</a><a href="index.html">홈으로</a>`;
    
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

  // =========================
  // 📝 Posts 로직
  // =========================
  fetch("posts/index.json?v=" + new Date().getTime()) // 캐시 방지 추가
    .then(r => r.json())
    .then(originalPosts => {
      const validPosts = originalPosts.filter(p => p && p.title && p.date);
      let posts = [...validPosts];

      // 사이드바 메뉴 구성 (Diary 카테고리일 때 특히 중요)
      if (category === "diary") {
        const subs = [...new Set(validPosts.filter(p => p.sub).map(p => p.sub))];
        if (subs.length) {
          subMenu.innerHTML =
            `<a href="index.html?cat=diary"${!sub ? ' class="active"' : ''}>전체 기록</a>` +
            subs.map(s =>
              `<a href="index.html?cat=diary&sub=${encodeURIComponent(s)}"${
                sub === s ? ' class="active"' : ''
              }>${s}</a>`
            ).join("");
        } else {
          subMenu.innerHTML = `<a href="index.html?cat=diary" class="active">전체 기록</a>`;
        }
      } else {
        // 홈 화면 등 다른 곳에서도 사이드바가 비지 않게 채워줌
        subMenu.innerHTML = `<a href="index.html" class="active">최신글 목록</a>`;
      }

      if (category) posts = posts.filter(p => p.category === category);
      if (sub) posts = posts.filter(p => p.sub === sub);

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
          let from = category === "diary" ? (sub ? `diary-${sub}` : "diary-all") : "home";
          let fileName = p.file || p.date;
          if (!fileName.toString().endsWith('.json')) {
            fileName += '.json';
          }
          location.href = `viewer.html?post=posts/${fileName}&from=${encodeURIComponent(from)}`;
        };
        list.appendChild(item);
      });
    })
    .catch(() => {
      list.innerHTML = "글을 불러오지 못했습니다.";
    });
});
