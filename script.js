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

  // 📝 Posts 로직 (다이어리 3단계 및 뒤로가기 완벽 대응)
  fetch("posts/index.json?v=" + new Date().getTime())
    .then(r => r.json())
    .then(originalPosts => {
      const validPosts = originalPosts.filter(p => p && p.title && p.date);
      let posts = [...validPosts];

      if (category === "diary") {
        // 모든 sub 경로 수집 및 대분류 추출
        const allPaths = [...new Set(validPosts.filter(p => p.sub).map(p => p.sub.trim()))];
        const mainMenus = [];
        allPaths.forEach(path => {
          const main = path.split('/')[0].trim();
          if (!mainMenus.includes(main)) mainMenus.push(main);
        });

        let menuHtml = `<a href="index.html?cat=diary"${!subParam ? ' class="active"' : ''}>전체 기록</a>`;

        mainMenus.forEach(main => {
          const isMainActive = subParam && subParam.split('/')[0].trim() === main;
          menuHtml += `<a href="index.html?cat=diary&sub=${encodeURIComponent(main)}"${isMainActive ? ' class="active"' : ''}>${main}</a>`;
          
          // 3단계 소분류: 대분류가 활성화되었을 때만 노출
          if (isMainActive) {
            const children = allPaths
              .filter(path => path.includes('/') && path.startsWith(main + '/'))
              .map(path => path.split('/')[1].trim());

            [...new Set(children)].forEach(child => {
              const fullPath = `${main}/${child}`;
              menuHtml += `<a href="index.html?cat=diary&sub=${encodeURIComponent(fullPath)}"${subParam === fullPath ? ' class="active"' : ''} style="padding-left:25px; font-size:13px; opacity:0.8; border:none;">└ ${child}</a>`;
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
        posts = posts.filter(p => p.sub && (p.sub === subParam || p.sub.startsWith(subParam + '/')));
      }

      posts.sort((a, b) => new Date(b.date) - new Date(a.date));
      list.innerHTML = "";

      posts.forEach(p => {
        const item = document.createElement("div");
        item.className = "post-item";
        item.innerHTML = `<h3>${p.title}</h3><span class="date">${p.date}</span><p>${p.excerpt || "내용 보기"}</p>`;
        
        item.onclick = () => {
          // ↩️ 뒤로가기 경로 설정 (가장 중요!)
          // Home -> Home, Diary 전체 -> diary-all, Diary 특정 카테고리 -> diary-특정명
          let fromValue = "home";
          if (category === "diary") {
            fromValue = subParam ? `diary-${subParam}` : "diary-all";
          }
          
          let fileName = p.file || p.date;
          if (!fileName.toString().endsWith('.json')) fileName += '.json';
          location.href = `viewer.html?post=posts/${fileName}&from=${encodeURIComponent(fromValue)}`;
        };
        list.appendChild(item);
      });
    });
});
