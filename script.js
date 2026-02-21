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
      let posts = [...validPosts];

      // 1. 메뉴 생성 (기호 완전 삭제!)
      if (category === "diary") {
        const menuStructure = [
          { name: "글", subs: ["일상", "카페"] },
          { name: "냐람", subs: ["연애 포기 각서", "홈스윗홈"] },
          { name: "냐쥬", subs: [] },
          { name: "끄적끄적", subs: ["잡담"] }
        ];

        let menuHtml = `<a href="index.html?cat=diary"${!parentParam && !subParam ? ' class="active"' : ''}>전체 기록</a>`;
        menuStructure.forEach(m => {
          const isParentActive = (parentParam === m.name && !subParam);
          // 깔끔하게 이름만 노출
          menuHtml += `<div style="margin-top:12px;">
            <a href="index.html?cat=diary&parent=${encodeURIComponent(m.name)}"${isParentActive ? ' class="active"' : ''} style="font-weight:bold; color:#fff; display:block; margin-bottom:5px;">${m.name}</a>`;
          m.subs.forEach(s => {
            const isSubActive = (subParam === s);
            // 기호 없이 들여쓰기만 유지
            menuHtml += `<a href="index.html?cat=diary&parent=${encodeURIComponent(m.name)}&sub=${encodeURIComponent(s)}"${isSubActive ? ' class="active"' : ''} style="padding-left:15px; font-size:0.9em; display:block; margin-bottom:4px; color:#aaa;">${s}</a>`;
          });
          menuHtml += `</div>`;
        });
        subMenu.innerHTML = menuHtml;
      } else {
        subMenu.innerHTML = `<a href="index.html" class="active">최신글 목록</a>`;
      }

      // 2. 정밀 필터링 로직
      // (1) 카테고리가 있으면 먼저 diary 글만 남김
      if (category) {
        posts = posts.filter(p => p.category === category);
      }
      
      // (2) 상세 필터링
      if (subParam) {
        // 하위 메뉴 클릭 시 (예: 홈스윗홈)
        posts = posts.filter(p => String(p.sub || "").trim() === subParam.trim());
      } else if (parentParam) {
        // 상위 메뉴 클릭 시 (예: 냐람) -> parent가 정확히 '냐람'인 것만!
        posts = posts.filter(p => String(p.parent || "").trim() === parentParam.trim());
      }

      // 3. 리스트 출력
      posts.sort((a, b) => new Date(b.date) - new Date(a.date));
      list.innerHTML = "";

      if (posts.length === 0) {
        list.innerHTML = `<div style="padding:20px; color:#666; text-align:center;">해당 카테고리에 등록된 글이 없습니다.</div>`;
        return;
      }

      posts.forEach(p => {
        const item = document.createElement("div");
        item.className = "post-item";
        item.innerHTML = `<h3>${p.title}</h3><span class="date">${p.date}</span><p>${p.excerpt || "내용 보기"}</p>`;
        item.onclick = () => {
          let fromPath = "index.html";
          if (category) fromPath += `?cat=${category}`;
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
      list.innerHTML = "데이터를 가져오는 중 오류가 발생했습니다.";
    });
});
