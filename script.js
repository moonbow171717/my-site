document.addEventListener("DOMContentLoaded", () => {

  const list = document.getElementById("post-list");
  const subMenu = document.getElementById("sub-menu");

  const params = new URLSearchParams(location.search);
  const category = params.get("cat");
  const sub = params.get("sub");

  // =========================
  // 📸 Photos
  // =========================
  if (category === "photos") {
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
          item.onclick = () =>
            location.href =
              `viewer.html?img=${encodeURIComponent(img.src)}&from=photos`;
          list.appendChild(item);
        };
      });
    }
    return;
  }

  // =========================
  // 📝 Posts
  // =========================
  fetch("posts/index.json")
    .then(r => r.json())
    .then(originalPosts => {

      // 🔒 안전 필터 (데이터가 올바른지 확인)
      const validPosts = originalPosts.filter(
        p => p && p.title && p.date
      );

      let posts = [...validPosts];
      if (category) posts = posts.filter(p => p.category === category);

      // =========================
      // 서브메뉴 (카테고리 필터)
      // =========================
      if (category === "diary") {
        const subs = [...new Set(
          validPosts.filter(p => p.sub).map(p => p.sub)
        )];

        if (subs.length) {
          subMenu.innerHTML =
            `<a href="index.html?cat=diary"${!sub ? ' class="active"' : ''}>전체</a>` +
            subs.map(s =>
              `<a href="index.html?cat=diary&sub=${encodeURIComponent(s)}"${
                sub === s ? ' class="active"' : ''
              }>${s}</a>`
            ).join("");
        }
      }

      if (sub) posts = posts.filter(p => p.sub === sub);

      // 날짜 순 정렬 (최신순)
      posts.sort((a, b) => new Date(b.date) - new Date(a.date));

      list.innerHTML = "";

      posts.forEach(p => {
        const item = document.createElement("div");
        item.className = "post-item";
        item.innerHTML = `
          <h3>${p.title}</h3>
          <span class="date">${p.date}</span>
          <p>${p.excerpt || "내용 보기"}</p>
        `;

        // ✅ 수정된 핵심 부분
        // p.date 대신 p.filename(혹은 실제 파일명)을 사용하도록 유연하게 변경
        item.onclick = () => {
          let from = "home";
          if (category === "diary") {
            from = sub ? `diary-${sub}` : "diary-all";
          }

          // 파일 이름에 .json이 안 붙어있을 경우를 대비해 처리
          let targetFile = p.filename || p.date;
          if (!targetFile.endsWith('.json')) {
            targetFile += '.json';
          }

          location.href =
            `viewer.html?post=posts/${targetFile}&from=${encodeURIComponent(from)}`;
        };

        list.appendChild(item);
      });
    })
    .catch(() => {
      list.innerHTML = "글을 불러오지 못했습니다.";
    });
});
