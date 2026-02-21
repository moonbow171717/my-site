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
      // 데이터가 비어있지 않은지 확인
      const validPosts = originalPosts.filter(p => p && p.title && p.date);
      let posts = [...validPosts];

      // 사이드바 메뉴 그리기 (Diary 모드일 때)
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
          menuHtml += `<div style="margin-top:10px;">
            <a href="index.html?cat=diary&parent=${encodeURIComponent(m.name)}"${isParentActive ? ' class="active"' : ''} style="font-weight:bold; color:#aaa;"># ${m.name}</a>`;
          
          m.subs.forEach(s => {
            const isSubActive = (subParam === s);
            menuHtml += `<a href="index.html?cat=diary&parent=${encodeURIComponent(m.name)}&sub=${encodeURIComponent(s)}"${isSubActive ? ' class="active"' : ''} style="padding-left:15px; font-size:0.9em;">ㄴ ${s}</a>`;
          });
          menuHtml += `</div>`;
        });
        subMenu.innerHTML = menuHtml;
      } else {
        subMenu.innerHTML = `<a href="index.html" class="active">최신글 목록</a>`;
      }

      // 🔍 핵심 필터링 로직 수정
      // 1. 카테고리 필터 (diary, photos 등)
      if (category) {
        posts = posts.filter(p => p.category === category);
      }
      
      // 2. 상위 메뉴 필터 (글, 냐람 등) - sub가 선택되지 않았을 때만 작동
      if (parentParam && !subParam) {
        posts = posts.filter(p => p.parent === parentParam);
      }
      
      // 3. 하위 메뉴 필터 (일상, 연애 포기 각서 등)
      if (subParam) {
        posts = posts.filter(p => p.sub === subParam);
      }

      // 결과가 없을 때 처리
      if (posts.length === 0) {
        list.innerHTML = `<div style="padding:20px; color:#666;">해당 카테고리에 등록된 글이 없습니다.</div>`;
        return;
      }

      posts.sort((a, b) => new Date(b.date) - new Date(a.date));
      list.innerHTML = "";

      posts.forEach(p => {
        const item = document.createElement("div");
        item.className = "post-item";
        item.innerHTML = `<h3>${p.title}</h3><span class="date">${p.date}</span><p>${p.excerpt || "내용 보기"}</p>`;

        item.onclick = () => {
          let fromPath = "index.html";
          if (category === "diary") {
            fromPath += `?cat=diary`;
            if (p.parent) fromPath += `&parent=${encodeURIComponent(p.parent)}`;
            if (p.sub) fromPath += `&sub=${encodeURIComponent(p.sub)}`;
          } else if (category === "photos") {
            fromPath += `?cat=photos`;
          }
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
