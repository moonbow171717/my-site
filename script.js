document.addEventListener("DOMContentLoaded", () => {
  const list = document.getElementById("post-list");
  const subMenu = document.getElementById("sub-menu");
  const menuBtn = document.getElementById("menuBtn");
  const sidebar = document.getElementById("sidebar");

  if (menuBtn) {
    menuBtn.onclick = () => { sidebar.classList.toggle("open"); };
  }

  const params = new URLSearchParams(location.search);
  // URL에 cat이 없으면(첫화면) 기본적으로 diary 모드로 작동하게 설정
  let category = params.get("cat") || "diary";
  const parentParam = params.get("parent");
  const subParam = params.get("sub");

  // =========================
  // 📸 Photos 모드 (파일 구조 반영)
  // =========================
  if (category === "photos") {
    subMenu.innerHTML = `<a href="index.html?cat=photos" class="active">모든 사진</a><a href="index.html">홈으로</a>`;
    list.className = "photo-grid";
    list.innerHTML = "";
    const formats = ["jpg","jpeg","png","webp","gif"];
    for (let i = 1; i <= 20; i++) { // 사진 개수에 맞게 조정
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

  // =========================
  // 📝 Posts 모드 (github 경로 대응)
  // =========================
  fetch("./posts/index.json?v=" + new Date().getTime())
    .then(r => r.json())
    .then(originalPosts => {
      // 데이터 유효성 검사
      const validPosts = originalPosts.filter(p => p && p.title && p.date);
      
      // 1. 다이어리 메뉴판 (고정형으로 가되 필터링 주소 최적화)
      if (category === "diary") {
        const menuStructure = [
          { name: "글", subs: ["일상", "카페"] },
          { name: "냐람", subs: ["연애 포기 각서", "홈스윗홈"] },
          { name: "냐쥬", subs: [] },
          { name: "끄적끄적", subs: ["잡담"] }
        ];

        let menuHtml = `<a href="index.html?cat=diary"${!parentParam && !subParam ? ' class="active"' : ''}>전체 기록</a>`;
        
        menuStructure.forEach(m => {
          // 상위 메뉴(# 냐람)가 활성화된 상태인지 확인
          const isParentActive = (parentParam === m.name && !subParam);
          menuHtml += `<div style="margin-top:10px;">
            <a href="index.html?cat=diary&parent=${encodeURIComponent(m.name)}"${isParentActive ? ' class="active"' : ''} style="font-weight:bold; color:#fff; display:block; margin-bottom:5px;"># ${m.name}</a>`;
          
          m.subs.forEach(s => {
            const isSubActive = (subParam === s);
            menuHtml += `<a href="index.html?cat=diary&parent=${encodeURIComponent(m.name)}&sub=${encodeURIComponent(s)}"${isSubActive ? ' class="active"' : ''} style="padding-left:15px; font-size:0.9em; display:block; margin-bottom:3px; color:#aaa;">ㄴ ${s}</a>`;
          });
          menuHtml += `</div>`;
        });
        subMenu.innerHTML = menuHtml;
      }

      // 2. [핵심] 필터링 로직 수정
      let posts = [...validPosts];

      // 다이어리 카테고리만 먼저 거름
      posts = posts.filter(p => p.category === "diary");

      if (subParam) {
        // 하위 메뉴 클릭 시: 해당 sub만
        posts = posts.filter(p => p.sub === subParam);
      } else if (parentParam) {
        // 상위 메뉴(# 냐람) 클릭 시: 해당 parent인 모든 글을 다 보여줌
        posts = posts.filter(p => p.parent === parentParam);
      }

      // 3. 리스트 출력
      posts.sort((a, b) => new Date(b.date) - new Date(a.date));
      list.innerHTML = "";

      if (posts.length === 0) {
        list.innerHTML = `<div style="padding:100px 0; text-align:center; color:#666;">등록된 글이 없습니다.</div>`;
        return;
      }

      posts.forEach(p => {
        const item = document.createElement("div");
        item.className = "post-item";
        item.innerHTML = `
          <h3>${p.title}</h3>
          <span class="date">${p.date}</span>
          <p>${p.excerpt || "내용 보기"}</p>
        `;

        item.onclick = () => {
          // 뒤로가기 버튼용 주소 생성
          let fromUrl = `index.html?cat=diary`;
          if (parentParam) fromUrl += `&parent=${encodeURIComponent(parentParam)}`;
          if (subParam) fromUrl += `&sub=${encodeURIComponent(subParam)}`;

          // 파일명 결정 (index.json에 file 필드가 있으면 쓰고 없으면 date 활용)
          let fileName = p.file || p.date;
          if (!fileName.toString().endsWith('.json')) fileName += '.json';
          location.href = `viewer.html?post=posts/${fileName}&from=${encodeURIComponent(fromUrl)}`;
        };
        list.appendChild(item);
      });
    })
    .catch(err => {
      console.error(err);
      list.innerHTML = "데이터를 불러오는 데 실패했습니다.";
    });
});
