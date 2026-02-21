document.addEventListener("DOMContentLoaded", () => {
  const list = document.getElementById("post-list");
  const subMenu = document.getElementById("sub-menu");
  const params = new URLSearchParams(location.search);
  const category = params.get("cat");
  const parentParam = params.get("parent");
  const subParam = params.get("sub");

  // 1. 사이드바 메뉴 생성
  if (category === "diary") {
    const menuStructure = [
      { name: "글", subs: ["일상", "카페"] },
      { name: "냐람", subs: ["연애 포기 각서", "홈 스윗 홈", "러브 콤플렉스", "NR"] },
      { name: "냐쥬", subs: [] },
      { name: "끄적끄적", subs: ["잡담"] }
    ];

    let menuHtml = `<a href="index.html?cat=diary" class="menu-parent" style="color:#8b90a0;">전체 기록</a>`;
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
    subMenu.innerHTML = `<a href="index.html?cat=photos" class="menu-parent">모든 사진</a>`;
  } else {
    subMenu.innerHTML = `<a href="index.html" class="menu-parent">최신글 목록</a>`;
  }

  // 2. 글 목록 로딩 및 필터링
  fetch("posts/index.json?v=" + new Date().getTime())
    .then(r => r.json())
    .then(data => {
      let posts = data.filter(p => p && p.title && p.date);

      // [핵심 수정] 필터링 로직을 완전히 분리했습니다.
      if (category) {
        posts = posts.filter(p => p.category === category);
      }

      // DIARY 메뉴의 세부 카테고리(sub, parent)가 있을 때만 추가 필터링
      if (category === "diary") {
        if (subParam) {
          posts = posts.filter(p => p.sub === subParam);
        } else if (parentParam) {
          posts = posts.filter(p => p.parent === parentParam);
        }
      }

      posts.sort((a, b) => new Date(b.date) - new Date(a.date));

      // 목록 출력
      list.innerHTML = posts.map(p => `
        <div class="post-item" onclick="location.href='viewer.html?post=posts/${p.file || p.date}.json&from=${encodeURIComponent(location.search || 'index.html')}'">
          <h3>${p.title}</h3>
          <span class="date">${p.date}</span>
          <p>${p.excerpt || "내용 보기"}</p>
        </div>
      `).join("");

      if (posts.length === 0) {
        list.innerHTML = "<div style='color:#8b90a0; text-align:center; padding-top:50px;'>게시물이 없습니다.</div>";
      }
    });
});
