document.addEventListener("DOMContentLoaded", () => {
  const list = document.getElementById("post-list");
  const subMenu = document.getElementById("sub-menu");
  const menuBtn = document.getElementById("menuBtn");
  const sidebar = document.getElementById("sidebar");

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
          item.onclick = () => location.href = `viewer.html?img=${encodeURIComponent(img.src)}&from=photos`;
          list.appendChild(item);
        };
      });
    }
    return;
  }

  // =========================
  // 📝 Posts 로직
  // =========================
  fetch("posts/index.json?v=" + new Date().getTime())
    .then(r => r.json())
    .then(originalPosts => {
      const validPosts = originalPosts.filter(p => p && p.title && p.date);
      let posts = [...validPosts];

      if (category === "diary") {
        // 데이터에서 대분류 메뉴(글, 일상 등)만 먼저 추출 (등장 순서 유지)
        const mainMenus = [];
        validPosts.forEach(p => {
          if (p.sub) {
            const main = p.sub.split('/')[0];
            if (!mainMenus.includes(main)) mainMenus.push(main);
          }
        });

        let menuHtml = `<a href="index.html?cat=diary"${!sub ? ' class="active"' : ''}>전체 기록</a>`;

        mainMenus.forEach(main => {
          // 현재 선택된 메뉴가 이 대분류이거나, 이 대분류의 하위 항목인지 확인
          const isActive = sub && sub.split('/')[0] === main;
          menuHtml += `<a href="index.html?cat=diary&sub=${encodeURIComponent(main)}"${isActive ? ' class="active"' : ''}>${main}</a>`;

          // 대분류를 눌렀을 때만 하위 시리즈(└ 연애 포기 각서 등) 노출
          if (isActive) {
            const seriesList = [...new Set(validPosts
              .filter(p => p.sub && p.sub.startsWith(main + '/') && p.sub !== main)
              .map(p => p.sub))];

            seriesList.forEach(fullSub => {
              const seriesName = fullSub.split('/')[1];
              const isSeriesActive = sub === fullSub;
              menuHtml += `<a href="index.html?cat=diary&sub=${encodeURIComponent(fullSub)}"${isSeriesActive ? ' class="active"' : ''} style="padding-left: 25px; font-size: 0.9em; opacity: 0.8; border-bottom: none;">└ ${seriesName}</a>`;
            });
          }
        });
        subMenu.innerHTML = menuHtml;
      } else {
        subMenu.innerHTML = `<a href="index.html" class="active">최신글 목록</a>`;
      }

      // 필터링 로직: "글" 선택 시 "글/연애포기각서" 등 모든 하위글 포함
      if (category) posts = posts.filter(p => p.category === category);
      if (sub) {
        posts = posts.filter(p => p.sub === sub || (p.sub && p.sub.startsWith(sub + '/')));
      }

      posts.sort((a, b) => new Date(b.date) - new Date(a.date));
      list.innerHTML = "";

      posts.forEach(p => {
        const item = document.createElement("div");
        item.className = "post-item";
        item.innerHTML = `<h3>${p.title}</h3><span class="date">${p.date}</span><p>${p.excerpt || "내용 보기"}</p>`;
        item.onclick = () => {
          let from = category === "diary" ? (sub ? `diary-${sub}` : "diary-all") : "home";
          let fileName = p.file || p.date;
          if (!fileName.toString().endsWith('.json')) fileName += '.json';
          location.href = `viewer.html?post=posts/${fileName}&from=${encodeURIComponent(from)}`;
        };
        list.appendChild(item);
      });
    })
    .catch(() => {
      list.innerHTML = "글을 불러오지 못했습니다.";
    });
});
