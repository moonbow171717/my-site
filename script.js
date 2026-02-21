document.addEventListener("DOMContentLoaded", () => {
  const list = document.getElementById("post-list");
  const subMenu = document.getElementById("sub-menu");
  const menuBtn = document.getElementById("menuBtn");
  const sidebar = document.getElementById("sidebar");

  if (menuBtn) {
    menuBtn.onclick = () => sidebar.classList.toggle("open");
  }

  const params = new URLSearchParams(location.search);
  const category = params.get("cat") || "";
  const subParam = params.get("sub") || "";

  // 📸 Photos 로직 (생략 없이 유지)
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

  // 📝 Posts 로직
  fetch("posts/index.json?v=" + new Date().getTime())
    .then(r => r.json())
    .then(originalPosts => {
      // 1. 유효한 데이터만 필터링
      const validPosts = (originalPosts || []).filter(p => p && p.title && p.date);

      // 2. 메뉴 생성 (Diary 카테고리일 때)
      if (category === "diary") {
        const mainMenus = [];
        validPosts.forEach(p => {
          const m = (p.sub || "미분류").split('/')[0];
          if (!mainMenus.includes(m)) mainMenus.push(m);
        });

        let menuHtml = `<a href="index.html?cat=diary"${!subParam ? ' class="active"' : ''}>전체 기록</a>`;

        mainMenus.forEach(main => {
          const isActive = subParam && subParam.split('/')[0] === main;
          menuHtml += `<a href="index.html?cat=diary&sub=${encodeURIComponent(main)}"${isActive ? ' class="active"' : ''}>${main}</a>`;
          
          // 3단계 하위 메뉴 생성 (대분류 클릭 시)
          if (isActive) {
            const seriesList = [...new Set(validPosts
              .filter(p => p.sub && p.sub.startsWith(main + '/') && p.sub !== main)
              .map(p => p.sub))];

            seriesList.forEach(fullPath => {
              const subName = fullPath.split('/')[1];
              menuHtml += `<a href="index.html?cat=diary&sub=${encodeURIComponent(fullPath)}"${subParam === fullPath ? ' class="active"' : ''} style="padding-left:25px; font-size:13px; opacity:0.8; border:none;">└ ${subName}</a>`;
            });
          }
        });
        subMenu.innerHTML = menuHtml;
      } else {
        subMenu.innerHTML = `<a href="index.html" class="active">최신글 목록</a>`;
      }

      // 3. 필터링 및 출력
      let filtered = [...validPosts];
      if (category) filtered = filtered.filter(p => p.category === category);
      if (subParam) {
        // "글"을 누르면 "글/..."로 시작하는 모든 포스트 포함
        filtered = filtered.filter(p => p.sub === subParam || (p.sub && p.sub.startsWith(subParam + '/')));
      }

      filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
      list.innerHTML = "";

      if (filtered.length === 0) {
        list.innerHTML = "<div style='padding:50px; text-align:center;'>표시할 글이 없습니다.</div>";
      } else {
        filtered.forEach(p => {
          const item = document.createElement("div");
          item.className = "post-item";
          item.innerHTML = `<h3>${p.title}</h3><span class="date">${p.date}</span><p>${p.excerpt || "내용 보기"}</p>`;
          item.onclick = () => {
            let from = category === "diary" ? (subParam ? `diary-${subParam}` : "diary-all") : "home";
            let fileName = p.file || p.date;
            if (!fileName.toString().endsWith('.json')) fileName += '.json';
            location.href = `viewer.html?post=posts/${fileName}&from=${encodeURIComponent(from)}`;
          };
          list.appendChild(item);
        });
      }
    })
    .catch(e => {
      console.error(e);
      list.innerHTML = "데이터 로딩 실패";
    });
});
