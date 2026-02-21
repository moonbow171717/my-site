document.addEventListener("DOMContentLoaded", () => {
  const list = document.getElementById("post-list");
  const subMenu = document.getElementById("sub-menu");
  const menuBtn = document.getElementById("menuBtn");
  const sidebar = document.getElementById("sidebar");

  if (menuBtn) {
    menuBtn.onclick = () => { sidebar.classList.toggle("open"); };
  }

  const params = new URLSearchParams(location.search);
  // [수정] 로그인 후 파라미터가 없어도 기본적으로 'diary'를 보여주도록 설정
  const category = params.get("cat") || "diary"; 
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

  // 데이터 로드 시 타임스탬프를 붙여 캐시 문제를 방지합니다.
  fetch("posts/index.json?v=" + new Date().getTime())
    .then(r => r.json())
    .then(originalPosts => {
      const validPosts = originalPosts.filter(p => p && p.title && p.date);
      
      // 1. 다이어리 메뉴판 그리기
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
            <a href="index.html?cat=diary&parent=${encodeURIComponent(m.name)}"${isParentActive ? ' class="active"' : ''} style="font-weight:bold; color:#aaa; display:block; margin-bottom:5px;"># ${m.name}</a>`;
          
          m.subs.forEach(s => {
            const isSubActive = (subParam === s);
            menuHtml += `<a href="index.html?cat=diary&parent=${encodeURIComponent(m.name)}&sub=${encodeURIComponent(s)}"${isSubActive ? ' class="active"' : ''} style="padding-left:15px; font-size:0.9em; display:block; margin-bottom:3px;">ㄴ ${s}</a>`;
          });
          menuHtml += `</div>`;
        });
        subMenu.innerHTML = menuHtml;
      }

      // 2. 필터링 로직 (상위 메뉴 클릭 시 하위 포함)
      let posts = [...validPosts];
      
      // 카테고리 필터 (기본 diary)
      posts = posts.filter(p => p.category === category);
      
      if (subParam) {
        // ㄴ 하위 메뉴 클릭 시: 해당 sub 글만
        posts = posts.filter(p => p.sub === subParam);
      } else if (parentParam) {
        // # 상위 메뉴 클릭 시: 해당 parent 모든 글 (이게 핵심!)
        posts = posts.filter(p => p.parent === parentParam);
      }

      // 3. 리스트 출력
      posts.sort((a, b) => new Date(b.date) - new Date(a.date));
      list.innerHTML = "";

      if (posts.length === 0) {
        list.innerHTML = `<div style="padding:50px; text-align:center; color:#666;">등록된 글이 없습니다.</div>`;
        return;
      }

      posts.forEach(p => {
        const item = document.createElement("div");
        item.className = "post-item";
        item.innerHTML = `<h3>${p.title}</h3><span class="date">${p.date}</span><p>${p.excerpt || "내용 보기"}</p>`;

        item.onclick = () => {
          let fromPath = `index.html?cat=${category}`;
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
      list.innerHTML = "데이터를 불러오는 데 실패했습니다.";
    });
});
