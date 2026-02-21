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
      
      // 1. 자동 메뉴 생성 로직 (Diary일 때)
      if (category === "diary") {
        const diaryPosts = validPosts.filter(p => p.category === "diary");
        
        // 데이터에서 parent와 sub 관계를 자동으로 추출합니다.
        const menuData = {};
        diaryPosts.forEach(p => {
          const pName = p.parent || "기타";
          if (!menuData[pName]) menuData[pName] = new Set();
          if (p.sub) menuData[pName].add(p.sub);
        });

        let menuHtml = `<a href="index.html?cat=diary"${!parentParam && !subParam ? ' class="active"' : ''}>전체 기록</a>`;
        
        // 추출된 데이터를 바탕으로 메뉴 HTML 생성
        Object.keys(menuData).forEach(pName => {
          const isParentActive = (parentParam === pName && !subParam);
          menuHtml += `<div style="margin-top:10px;">
            <a href="index.html?cat=diary&parent=${encodeURIComponent(pName)}"${isParentActive ? ' class="active"' : ''} style="font-weight:bold; color:#aaa; display:block; margin-bottom:5px;"># ${pName}</a>`;
          
          menuData[pName].forEach(sName => {
            const isSubActive = (subParam === sName);
            menuHtml += `<a href="index.html?cat=diary&parent=${encodeURIComponent(pName)}&sub=${encodeURIComponent(sName)}"${isSubActive ? ' class="active"' : ''} style="padding-left:15px; font-size:0.9em; display:block; margin-bottom:3px;">ㄴ ${sName}</a>`;
          });
          menuHtml += `</div>`;
        });
        subMenu.innerHTML = menuHtml;
      } else {
        subMenu.innerHTML = `<a href="index.html" class="active">최신글 목록</a>`;
      }

      // 2. 필터링 로직
      let posts = [...validPosts];
      if (category) posts = posts.filter(p => p.category === category);
      
      if (subParam) {
        posts = posts.filter(p => p.sub === subParam);
      } else if (parentParam) {
        posts = posts.filter(p => p.parent === parentParam);
      }

      // 3. 결과 출력
      posts.sort((a, b) => new Date(b.date) - new Date(a.date));
      list.innerHTML = "";

      if (posts.length === 0) {
        list.innerHTML = `<div style="text-align:center; padding:50px; color:#666;">해당 카테고리에 등록된 글이 없습니다.</div>`;
        return;
      }

      posts.forEach(p => {
        const item = document.createElement("div");
        item.className = "post-item";
        item.innerHTML = `<h3>${p.title}</h3><span class="date">${p.date}</span><p>${p.excerpt || "내용 보기"}</p>`;

        item.onclick = () => {
          let fromPath = `index.html?cat=${category || 'diary'}`;
          if (parentParam) fromPath += `&parent=${encodeURIComponent(parentParam)}`;
          if (subParam) fromPath += `&sub=${encodeURIComponent(subParam)}`;

          let fileName = p.file || p.date;
          if (!fileName.toString().endsWith('.json')) fileName += '.json';
          location.href = `viewer.html?post=posts/${fileName}&from=${encodeURIComponent(fromPath)}`;
        };
        list.appendChild(item);
      });
    })
    .catch((err) => {
      console.error(err);
      list.innerHTML = "글을 불러오는 중 오류가 발생했습니다.";
    });
});
