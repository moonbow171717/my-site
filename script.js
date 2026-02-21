document.addEventListener("DOMContentLoaded", () => {
  const list = document.getElementById("post-list");
  const subMenu = document.getElementById("sub-menu");
  const menuBtn = document.getElementById("menuBtn");
  const sidebar = document.getElementById("sidebar");

  // 메뉴 토글 및 위로가기
  if (menuBtn) menuBtn.onclick = () => sidebar.classList.toggle("open");
  const topBtn = document.getElementById("scrollTopBtn");
  window.onscroll = () => {
    if (window.scrollY > 300) topBtn.style.display = "flex";
    else topBtn.style.display = "none";
  };
  topBtn.onclick = () => window.scrollTo({top: 0, behavior: 'smooth'});

  const params = new URLSearchParams(location.search);
  const category = params.get("cat");
  const parentParam = params.get("parent");
  const subParam = params.get("sub");

  // 사이드바 아코디언 메뉴 생성
  if (category === "diary") {
    const menuStructure = [
      { name: "글", subs: ["일상", "카페"] },
      { name: "냐람", subs: ["연애 포기 각서", "홈 스윗 홈", "러브 콤플렉스", "NR"] },
      { name: "냐쥬", subs: [] },
      { name: "끄적끄적", subs: ["잡담"] }
    ];

    let menuHtml = `<a href="index.html?cat=diary" class="menu-parent">전체 기록</a>`;
    menuStructure.forEach(m => {
      const isOpened = parentParam === m.name; // 현재 선택된 그룹이면 열어둠
      menuHtml += `
        <div class="menu-group">
          <div class="menu-parent" onclick="this.nextElementSibling.classList.toggle('active')">${m.name} ▾</div>
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
    subMenu.innerHTML = `<a href="index.html?cat=photos" class="menu-parent active">모든 사진</a><a href="index.html" class="menu-parent">홈으로</a>`;
  } else {
    subMenu.innerHTML = `<a href="index.html" class="menu-parent active">최신글 목록</a>`;
  }

  // 글 목록 로딩 (기존 로직 유지)
  fetch("posts/index.json?v=" + new Date().getTime())
    .then(r => r.json())
    .then(originalPosts => {
      let posts = originalPosts.filter(p => p && p.title && p.date);
      if (category) posts = posts.filter(p => p.category === category);
      if (subParam) posts = posts.filter(p => p.sub === subParam);
      else if (parentParam) posts = posts.filter(p => p.parent === parentParam);

      posts.sort((a, b) => new Date(b.date) - new Date(a.date));
      list.innerHTML = posts.map(p => {
        let fileName = p.file || p.date;
        if (!fileName.toString().endsWith('.json')) fileName += '.json';
        return `
          <div class="post-item" onclick="location.href='viewer.html?post=posts/${fileName}&from=${encodeURIComponent(location.search || 'index.html')}'">
            <h3>${p.title}</h3>
            <span class="date">${p.date}</span>
            <p>${p.excerpt || "내용 보기"}</p>
          </div>`;
      }).join("") || `<div style="padding:20px; color:#666;">등록된 글이 없습니다.</div>`;
    });
});
