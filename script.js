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

  // 📝 Posts 로직
  fetch("posts/index.json?v=" + new Date().getTime())
    .then(r => r.json())
    .then(originalPosts => {
      const validPosts = originalPosts.filter(p => p && p.title && p.date);
      
      // 1. [중요] 메뉴 자동 생성 (Diary일 때)
      if (category === "diary") {
        const diaryPosts = validPosts.filter(p => p.category === "diary");
        const menuMap = new Map();

        // index.json을 훑어서 parent와 sub 관계를 정리합니다.
        diaryPosts.forEach(p => {
          const pName = p.parent || "미분류";
          if (!menuMap.has(pName)) menuMap.set(pName, new Set());
          if (p.sub) menuMap.get(pName).add(p.sub);
        });

        let menuHtml = `<a href="index.html?cat=diary"${!parentParam && !subParam ? ' class="active"' : ''}>전체 기록</a>`;
        
        // 정리된 데이터를 바탕으로 메뉴를 그립니다.
        menuMap.forEach((subs, pName) => {
          const isParentActive = (parentParam === pName && !subParam);
          menuHtml += `<div style="margin-top:12px;">
            <a href="index.html?cat=diary&parent=${encodeURIComponent(pName)}"${isParentActive ? ' class="active"' : ''} style="font-weight:bold; color:#fff; display:block; margin-bottom:5px;"># ${pName}</a>`;
          
          subs.forEach(sName => {
            const isSubActive = (subParam === sName);
            menuHtml += `<a href="index.html?cat=diary&parent=${encodeURIComponent(pName)}&sub=${encodeURIComponent(sName)}"${isSubActive ? ' class="active"' : ''} style="padding-left:15px; font-size:0.9em; display:block; margin-bottom:4px; color:#aaa;">ㄴ ${sName}</a>`;
          });
          menuHtml += `</div>`;
        });
        subMenu.innerHTML = menuHtml;
      } else {
        subMenu.innerHTML = `<a href="index.html" class="active">최신글 목록</a>`;
      }

      // 2. [중요] 필터링 로직 (상위 메뉴 클릭 시 하위 포함)
      let posts = [...validPosts];
      if (category) posts = posts.filter(p => p.category === category);
      
      if (subParam) {
        // 하위 메뉴(ㄴ 일상) 클릭 시
        posts = posts.filter(p => p.sub === subParam);
      } else if (parentParam) {
        // 상위 메뉴(# 글) 클릭 시: 해당 parent인 것 다 보여줌
        posts = posts.filter(p => p.parent === parentParam);
      }

      // 3. 리스트 출력
      posts.sort((a, b) => new Date(b.date) - new Date(a.date));
      list.innerHTML = "";

      if (posts.length === 0) {
        list.innerHTML = `<div style="text-align:center; padding:100px 20px; color:#666;">해당 카테고리에 등록된 글이 없습니다.</div>`;
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
    .catch(() => {
      list.innerHTML = "글을 불러오지 못했습니다.";
    });
});
