document.addEventListener("DOMContentLoaded", () => {
  const list = document.getElementById("post-list");
  const subMenu = document.getElementById("sub-menu");
  const params = new URLSearchParams(location.search);
  const category = params.get("cat");
  const parentParam = params.get("parent");
  const subParam = params.get("sub");

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

  // 글 목록 로딩
  fetch("posts/index.json?v=" + new Date().getTime())
    .then(r => r.json())
    .then(data => {
      let posts = data.filter(p => p && p.title && p.date);
      if (category) posts = posts.filter(p => p.category === category);
      if (subParam) posts = posts.filter(p => p.sub === subParam);
      else if (parentParam) posts = posts.filter(p => p.parent === parentParam);

      posts.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      // [수정 포인트] location.search 전체를 안전하게 넘겨서 뒤로가기 시 복구되게 함
      list.innerHTML = posts.map(p => {
        const currentSearch = location.search || "?cat=all";
        return `
          <div class="post-item" onclick="location.href='viewer.html?post=posts/${p.file || p.date}.json&from=${encodeURIComponent(currentSearch)}'">
            <h3>${p.title}</h3>
            <span class="date">${p.date}</span>
            <p>${p.excerpt || "내용 보기"}</p>
          </div>
        `;
      }).join("");
    });
});
