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

  // [기존 로직 유지] PHOTOS 카테고리
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
          // [수정] from 파라미터를 정확하게 index.html?cat=photos 로 전달
          item.onclick = () => location.href = `viewer.html?img=${encodeURIComponent(img.src)}&from=${encodeURIComponent('index.html?cat=photos')}`;
          list.appendChild(item);
        };
      });
    }
    return;
  }

  // 게시글 로딩 로직
  fetch("posts/index.json?v=" + new Date().getTime())
    .then(r => r.json())
    .then(originalPosts => {
      const validPosts = originalPosts.filter(p => p && p.title && p.date);
      let posts = [...validPosts];

      if (category === "diary") {
        const menuStructure = [
          { name: "글", subs: ["5/10", "성간운", "일상", "카페"] },
          { name: "냐람", subs: ["구원의 구원", "돌을 던진 것은 누구인가", "러브 콤플렉스", "연애 포기 각서", "지구 열 바퀴", "홈 스윗 홈", "NR"] },
          { name: "냐쥬", subs: ["대타위기사랑", "순애보증수표", "NJ"] },
		  { name: "댠닺", subs: ["Private", "DD"] },
		  { name: "쥬얀", subs: ["시시콜콜한 마음", "양의 종말", "JA"]},
		  { name: "원작", subs: ["Denied Love"]},
          { name: "끄적끄적", subs: ["잡담"] }
        ];

        let menuHtml = `<a href="index.html?cat=diary" class="${!parentParam && !subParam ? 'active' : ''}">전체 기록</a>`;
        menuStructure.forEach(m => {
          const isParentActive = (parentParam === m.name);
          menuHtml += `
            <div style="margin-top:12px;">
              <div class="menu-toggle" style="font-weight:bold; color:#fff; cursor:pointer;" 
                   onclick="const next = this.nextElementSibling; next.style.display = (next.style.display === 'none' ? 'block' : 'none');">
                ${m.name}
              </div>
              <div class="sub-list" style="display: ${isParentActive ? 'block' : 'none'};">
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

      if (category) posts = posts.filter(p => p.category === category);
      if (subParam) posts = posts.filter(p => p.sub === subParam);
      else if (parentParam) posts = posts.filter(p => p.parent === parentParam);

      posts.sort((a, b) => new Date(b.date) - new Date(a.date));
      list.innerHTML = "";
      posts.forEach(p => {
        const item = document.createElement("div");
        item.className = "post-item";
        item.innerHTML = `<h3>${p.title}</h3><span class="date">${p.date}</span><p>${p.excerpt || "내용 보기"}</p>`;
        item.onclick = () => {
          let fromPath = location.search ? `index.html${location.search}` : "index.html";
          let fileName = p.file || p.date;
          if (!fileName.toString().endsWith('.json')) fileName += '.json';
          location.href = `viewer.html?post=posts/${fileName}&from=${encodeURIComponent(fromPath)}`;
        };
        list.appendChild(item);
      });
    });
});
