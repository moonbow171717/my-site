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

  // 1. PHOTOS 카테고리 로직 (사용자님 원본 그대로 유지)
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
          item.onclick = () => location.href = `viewer.html?img=${encodeURIComponent(img.src)}&from=index.html?cat=photos`;
          list.appendChild(item);
        };
      });
    }
    return;
  }

  // 2. DIARY 및 일반 글 목록 로딩
  fetch("posts/index.json?v=" + new Date().getTime())
    .then(r => r.json())
    .then(originalPosts => {
      const validPosts = originalPosts.filter(p => p && p.title && p.date);
      let posts = [...validPosts];

      // 사이드바 메뉴 생성
      if (category === "diary") {
        const menuStructure = [
          { name: "글", subs: ["일상", "카페"] },
          { name: "냐람", subs: ["연애 포기 각서", "홈 스윗 홈", "러브 콤플렉스", "NR"] },
          { name: "냐쥬", subs: [] },
          { name: "끄적끄적", subs: ["잡담"] }
        ];

        let menuHtml = `<a href="index.html?cat=diary" class="menu-parent ${!parentParam && !subParam ? 'active' : ''}" style="color:#8b90a0; display:block; margin-bottom:15px;">전체 기록</a>`;
        
        menuStructure.forEach(m => {
          const isOpened = (parentParam === m.name);
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
      } else {
        subMenu.innerHTML = `<a href="index.html" class="active">최신글 목록</a>`;
      }

      // 필터링 적용
      if (category) {
        posts = posts.filter(p => p.category === category);
      }
      if (subParam) {
        posts = posts.filter(p => p.sub === subParam);
      } else if (parentParam) {
        posts = posts.filter(p => p.parent === parentParam);
      }

      // 정렬 및 출력
      posts.sort((a, b) => new Date(b.date) - new Date(a.date));
      list.className = ""; // 포토 그리드 해제
      list.innerHTML = posts.map(p => {
        let fileName = p.file || p.date;
        if (!fileName.toString().endsWith('.json')) fileName += '.json';
        const fromUrl = location.search || "index.html";
        
        return `
          <div class="post-item" onclick="location.href='viewer.html?post=posts/${fileName}&from=${encodeURIComponent(fromUrl)}'">
            <h3>${p.title}</h3>
            <span class="date">${p.date}</span>
            <p>${p.excerpt || "내용 보기"}</p>
          </div>
        `;
      }).join("");

      if (posts.length === 0) {
        list.innerHTML = `<div style="padding:50px; text-align:center; color:#8b90a0;">게시물이 없습니다.</div>`;
      }
    })
    .catch(err => {
      console.error(err);
      list.innerHTML = "글을 불러오는 중 오류가 발생했습니다.";
    });
});
