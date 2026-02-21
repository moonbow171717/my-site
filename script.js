document.addEventListener("DOMContentLoaded", () => {
  const list = document.getElementById("post-list");
  const subMenu = document.getElementById("sub-menu");
  const params = new URLSearchParams(location.search);
  const category = params.get("cat");
  const parentParam = params.get("parent");
  const subParam = params.get("sub");

  // 1. 사이드바 메뉴 생성 (사용자님 원본 디자인 유지)
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
    subMenu.innerHTML = `<a href="index.html?cat=photos" class="menu-parent active">모든 사진</a>`;
  } else {
    subMenu.innerHTML = `<a href="index.html" class="menu-parent">최신글 목록</a>`;
  }

  // 2. 글 목록 로딩 로직 (필터링 조건 수정)
  fetch("posts/index.json?v=" + new Date().getTime())
    .then(r => r.json())
    .then(data => {
      let posts = data.filter(p => p && p.title && p.date);

      // 카테고리(diary, photos 등)가 있으면 먼저 거릅니다.
      if (category) {
        posts = posts.filter(p => p.category === category);
      }

      // [중요] subParam이나 parentParam이 있을 때만 추가로 거릅니다.
      // 이렇게 해야 파라미터가 없는 'photos' 목록이 안 지워집니다.
      if (subParam) {
        posts = posts.filter(p => p.sub === subParam);
      } else if (parentParam) {
        posts = posts.filter(p => p.parent === parentParam);
      }

      posts.sort((a, b) => new Date(b.date) - new Date(a.date));

      if (posts.length === 0) {
        list.innerHTML = "<div style='color:#8b90a0; text-align:center; padding:50px;'>게시물이 없습니다.</div>";
        return;
      }

      list.innerHTML = posts.map(p => `
        <div class="post-item" onclick="location.href='viewer.html?post=posts/${p.file || p.date}.json&from=${encodeURIComponent(location.search || 'index.html')}'">
          <h3>${p.title}</h3>
          <span class="date">${p.date}</span>
          <p>${p.excerpt || "내용 보기"}</p>
        </div>
      `).join("");
    })
    .catch(err => {
      list.innerHTML = "<div style='color:red; text-align:center;'>데이터 로딩 실패</div>";
    });
});
