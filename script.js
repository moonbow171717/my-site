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
  const subParam = params.get("sub") ? decodeURIComponent(params.get("sub")).trim() : "";

  // 📸 Photos 로직
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

  // 📝 Posts 로직 (자동 메뉴 생성)
  fetch("posts/index.json?v=" + new Date().getTime())
    .then(r => r.json())
    .then(originalPosts => {
      const validPosts = (originalPosts || []).filter(p => p && p.title && p.date);
      let posts = [...validPosts];

      if (category === "diary") {
        // [자동화] 데이터에서 모든 sub 경로 수집
        const allPaths = [...new Set(validPosts.filter(p => p.sub).map(p => p.sub.trim()))];
        
        let menuHtml = `<a href="index.html?cat=diary"${!subParam ? ' class="active"' : ''}>전체 기록</a>`;
        
        // 1단계(대분류) 메뉴 추출
        const mainMenus = [];
        allPaths.forEach(path => {
          const main = path.split('/')[0].trim();
          if (!mainMenus.includes(main)) mainMenus.push(main);
        });

        mainMenus.forEach(main => {
          // 현재 대분류가 활성화되었는지 확인 (subParam이 "글"이거나 "글/시리즈"일 때)
          const isMainActive = subParam === main || subParam.startsWith(main + '/');
          menuHtml += `<a href="index.html?cat=diary&sub=${encodeURIComponent(main)}"${isMainActive ? ' class="active"' : ''}>${main}</a>`;
          
          // 2단계(소분류) 메뉴 생성: 대분류가 클릭되었을 때만 노출
          if (isMainActive) {
            const children = allPaths
              .filter(path => path.includes('/') && path.startsWith(main + '/'))
              .map(path => path.split('/')[1].trim());

            [...new Set(children)].forEach(child => {
              const fullPath = `${main}/${child}`;
              const isChildActive = subParam === fullPath;
              menuHtml += `<a href="index.html?cat=diary&sub=${encodeURIComponent(fullPath)}"${isChildActive ? ' class="active"' : ''} style="padding-left:25px; font-size:0.9em; opacity:0.8; border:none;">└ ${child}</a>`;
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
        // 대분류 클릭 시 하위 모든 글 포함, 소분류 클릭 시 해당 글만
        posts = posts.filter(p => {
          if (!p.sub) return false;
          const postSub = p.sub.trim();
          return postSub === subParam || postSub.startsWith(subParam + '/');
        });
      }

      posts.sort((a, b) => new Date(b.date) - new Date(a.date));
      list.innerHTML = "";
      
      if (posts.length === 0) {
        list.innerHTML = "<div style='text-align:center; padding:50px;'>작성된 글이 없습니다.</div>";
      }

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
