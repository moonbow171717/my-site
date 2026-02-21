document.addEventListener("DOMContentLoaded", () => {
  const list = document.getElementById("post-list");
  const subMenu = document.getElementById("sub-menu");
  const params = new URLSearchParams(location.search);
  const category = params.get("cat");
  const parentParam = params.get("parent");
  const subParam = params.get("sub");

  // 1. 왼쪽 사이드바 메뉴 생성
  if (category === "diary") {
    const menuStructure = [
      { name: "글", subs: ["일상", "카페"] },
      { name: "냐람", subs: ["연애 포기 각서", "홈 스윗 홈", "러브 콤플렉스", "NR"] },
      { name: "냐쥬", subs: [] },
      { name: "끄적끄적", subs: ["잡담"] }
    ];

    let menuHtml = `<a href="index.html?cat=diary" class="menu-parent" style="color:#8b90a0; display:block; margin-bottom:15px;">전체 기록</a>`;
    menuStructure.forEach(m => {
      const isOpened = parentParam === m.name;
      menuHtml += `
        <div class="menu-group">
          <div class="menu-parent" onclick="const next = this.nextElementSibling; if(next) next.classList.toggle('active')">${m.name}</div>
          <div class="sub-menu-list ${isOpened ? 'active' : ''}">
            ${m.subs.map(s => `
              <a href="index.html?cat=diary&parent=${encodeURIComponent(m.name)}&sub=${encodeURIComponent(s)}" 
                 class="${subParam === s ? 'active' : ''}">${s}</a>
            `).join('')}
          </div>
        </div>`;
    });
    subMenu.innerHTML = menuHtml;
  } else if (category === "photos") {
    // 포토 메뉴일 때 사이드바 구성
    subMenu.innerHTML = `<a href="index.html?cat=photos" class="menu-parent active">📸 모든 사진</a>`;
  } else {
    subMenu.innerHTML = `<a href="index.html" class="menu-parent">🏠 최신글 목록</a>`;
  }

  // 2. 글/사진 목록 로딩
  fetch("posts/index.json?v=" + new Date().getTime())
    .then(r => r.json())
    .then(data => {
      // 데이터 유효성 검사
      let posts = data.filter(p => p && p.title && p.date);

      // 카테고리 필터링 (diary, photos 등)
      if (category) {
        posts = posts.filter(p => p.category === category);
      }

      // 서브메뉴 필터링
      if (subParam) {
        posts = posts.filter(p => p.sub === subParam);
      } else if (parentParam) {
        posts = posts.filter(p => p.parent === parentParam);
      }

      // 날짜 최신순 정렬
      posts.sort((a, b) => new Date(b.date) - new Date(a.date));

      // 목록 출력
      if (posts.length === 0) {
        list.innerHTML = "<div style='color:#8b90a0; text-align:center; margin-top:50px;'>등록된 게시물이 없습니다.</div>";
        return;
      }

      list.innerHTML = posts.map(p => {
        const currentSearch = location.search || "?cat=all";
        // 사진 카테고리일 때 썸네일이 있다면 보여주기 위해 클래스나 구조를 유지합니다.
        return `
          <div class="post-item" onclick="location.href='viewer.html?post=posts/${p.file || p.date}.json&from=${encodeURIComponent(currentSearch)}'">
            <h3>${p.title}</h3>
            <span class="date">${p.date}</span>
            <p>${p.excerpt || "내용 보기"}</p>
          </div>
        `;
      }).join("");
    })
    .catch(err => {
      console.error("데이터 로딩 실패:", err);
      list.innerHTML = "데이터를 불러오는 중 오류가 발생했습니다.";
    });
});
