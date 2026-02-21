document.addEventListener("DOMContentLoaded", () => {
  const list = document.getElementById("post-list");
  const subMenu = document.getElementById("sub-menu");
  const menuBtn = document.getElementById("menuBtn");
  const sidebar = document.getElementById("sidebar");

  if (menuBtn) {
    menuBtn.onclick = () => sidebar.classList.toggle("open");
  }

  const params = new URLSearchParams(location.search);
  const category = params.get("cat");
  const subParam = params.get("sub");

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

  fetch("posts/index.json?v=" + new Date().getTime())
    .then(r => r.json())
    .then(originalPosts => {
      const validPosts = originalPosts.filter(p => p && p.title && p.date);
      let posts = [...validPosts];

      if (category === "diary") {
        // [자동화 핵심] 데이터에서 모든 sub를 가져와서 메뉴 구조 파악
        const allSubPaths = [...new Set(validPosts.filter(p => p.sub).map(p => p.sub))];
        
        let menuHtml = `<a href="index.html?cat=diary"${!subParam ? ' class="active"' : ''}>전체 기록</a>`;
        
        // 대분류(1단계) 메뉴들만 먼저 추출
        const mainMenus = [...new Set(allSubPaths.map(s => s.split('/')[0].trim()))];

        mainMenus.forEach(main => {
          const isMainActive = subParam && subParam.split('/')[0].trim() === main;
          menuHtml += `<a href="index.html?cat=diary&sub=${encodeURIComponent(main)}"${isMainActive ? ' class="active"' : ''}>${main}</a>`;
          
          // 만약 대분류가 클릭된 상태라면, 그 아래의 소분류(2단계)들을 보여줌
          if (isMainActive) {
            const subItems = allSubPaths
              .filter(s => s.includes('/') && s.startsWith(main))
              .map(s => s.split('/')[1].trim());

            [...new Set(subItems)].forEach(subName => {
              const fullSubPath = `${main}/${subName}`;
              const isSubActive = subParam === fullSubPath;
              menuHtml += `<a href="index.html?cat=diary&sub=${encodeURIComponent(fullSubPath)}"${isSubActive ? ' class="active"' : ''} style="padding-left:20px; font-size:13px; opacity:0.8; border:none;">└ ${subName}</a>`;
            });
          }
        });
        subMenu.innerHTML = menuHtml;
      } else {
        subMenu.innerHTML = `<a href="index.html" class="active">최신글 목록</a>`;
      }

      // 필터링 처리
      if (category) posts = posts.filter(p => p.category === category);
      if (subParam) {
        // 대분류를 눌렀을 때는 그 하위의 모든 글을 보여주고, 소분류를 눌렀을 때는 딱 그 글만 보여줌
        posts = posts.filter(p => p.sub === subParam || (p.sub && p.sub.startsWith(subParam + '/')));
      }

      posts.sort((a, b) => new Date(b.date) - new Date(a.date));
      list.innerHTML = "";
      posts.forEach(p => {
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
    });
});
