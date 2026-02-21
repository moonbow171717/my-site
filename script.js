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
  const parent = params.get("parent");
  const sub = params.get("sub");

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
      const validPosts = originalPosts.filter(p => p && p.title && p.date);
      let posts = [...validPosts];

      if (category === "diary") {
        // 메뉴 구조 정의
        const menuStructure = [
          { name: "글", subs: ["일상", "카페"] },
          { name: "냐람", subs: ["연애 포기 각서", "홈스윗홈"] },
          { name: "냐쥬", subs: [] },
          { name: "끄적끄적", subs: ["잡담"] }
        ];

        let menuHtml = `<a href="index.html?cat=diary"${!parent && !sub ? ' class="active"' : ''}>전체 기록</a>`;
        
        menuStructure.forEach(m => {
          menuHtml += `<div style="margin-top:10px;">
            <a href="index.html?cat=diary&parent=${encodeURIComponent(m.name)}"${parent === m.name && !sub ? ' class="active"' : ''} style="font-weight:bold; color:#aaa;"># ${m.name}</a>`;
          m.subs.forEach(s => {
            menuHtml += `<a href="index.html?cat=diary&parent=${encodeURIComponent(m.name)}&sub=${encodeURIComponent(s)}"${sub === s ? ' class="active"' : ''} style="padding-left:15px; font-size:0.9em;">ㄴ ${s}</a>`;
          });
          menuHtml += `</div>`;
        });
        subMenu.innerHTML = menuHtml;
      } else {
        subMenu.innerHTML = `<a href="index.html" class="active">최신글 목록</a>`;
      }

      // 필터링
      if (category) posts = posts.filter(p => p.category === category);
      if (parent) posts = posts.filter(p => p.parent === parent);
      if (sub) posts = posts.filter(p => p.sub === sub);

      posts.sort((a, b) => new Date(b.date) - new Date(a.date));
      list.innerHTML = "";

      posts.forEach(p => {
        const item = document.createElement("div");
        item.className = "post-item";
        item.innerHTML = `<h3>${p.title}</h3><span class="date">${p.date}</span><p>${p.excerpt || "내용 보기"}</p>`;

        item.onclick = () => {
          // 어디서 왔는지 경로 생성
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
    .catch(() => { list.innerHTML = "글을 불러오지 못했습니다."; });
});
