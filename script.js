document.addEventListener("DOMContentLoaded", () => {
  const list = document.getElementById("post-list");
  const subMenu = document.getElementById("sub-menu");
  const menuBtn = document.getElementById("menuBtn");
  const sidebar = document.getElementById("sidebar");

  if (menuBtn) {
    menuBtn.onclick = () => { sidebar.classList.toggle("open"); };
  }

  const params = new URLSearchParams(location.search);
  const category = params.get("cat");
  const parentParam = params.get("parent");
  const subParam = params.get("sub");

  // 📸 Photos 모드
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

  // 📝 Posts 모드
  fetch("posts/index.json?v=" + new Date().getTime())
    .then(r => r.json())
    .then(originalPosts => {
      const validPosts = originalPosts.filter(p => p && p.title && p.date);
      
      // 1. [자동 메뉴 생성] 데이터 기반으로 메뉴판 짜기
      if (category === "diary") {
        const diaryPosts = validPosts.filter(p => p.category === "diary");
        const menuData = {}; // { "냐람": ["홈스윗홈", "연애 포기 각서"], "글": ["일상", "카페"] }

        diaryPosts.forEach(p => {
          const pName = p.parent || "미분류";
          if (!menuData[pName]) menuData[pName] = new Set();
          if (p.sub) menuData[pName].add(p.sub);
        });

        let menuHtml = `<a href="index.html?cat=diary"${!parentParam && !subParam ? ' class="active"' : ''}>전체 기록</a>`;
        
        // 데이터에서 뽑아낸 parent들로 메뉴 만들기
        Object.keys(menuData).forEach(pName => {
          const isParentActive = (parentParam === pName && !subParam);
          menuHtml += `<div style="margin-top:12px;">
            <a href="index.html?cat=diary&parent=${encodeURIComponent(pName)}"${isParentActive ? ' class="active"' : ''} style="font-weight:bold; color:#fff; display:block; margin-bottom:5px;"># ${pName}</a>`;
          
          menuData[pName].forEach(sName => {
            const isSubActive = (subParam === sName);
            menuHtml += `<a href="index.html?cat=diary&parent=${encodeURIComponent(pName)}&sub=${encodeURIComponent(sName)}"${isSubActive ? ' class="active"' : ''} style="padding-left:15px; font-size:0.95em; display:block; margin-bottom:4px; color:#aaa;">ㄴ ${sName}</a>`;
          });
          menuHtml += `</div>`;
        });
        subMenu.innerHTML = menuHtml;
      } else {
        subMenu.innerHTML = `<a href="index.html" class="active">최신글 목록</a>`;
      }

      // 2. [필터링 로직] 글자만 같으면 무조건 보여주기
      let posts = [...validPosts];
      if (category) posts = posts.filter(p => p.category === category);
      
      if (subParam) {
        // ㄴ 하위 메뉴 클릭 시: 해당 sub 글만
        posts = posts.filter(p => p.sub === subParam);
      } else if (parentParam) {
        // # 상위 메뉴 클릭 시: 해당 parent 모든 글
        posts = posts.filter(p => p.parent === parentParam);
      }

      // 3. 리스트 출력
      posts.sort((a, b) => new Date(b.date) - new Date(a.date));
      list.innerHTML = "";

      if (posts.length ===
