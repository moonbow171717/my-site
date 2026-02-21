document.addEventListener("DOMContentLoaded", () => {
  const list = document.getElementById("post-list");
  const subMenu = document.getElementById("sub-menu");
  const menuBtn = document.getElementById("menuBtn");
  const sidebar = document.getElementById("sidebar");

  if (menuBtn) {
    menuBtn.onclick = () => {
      sidebar.classList.toggle("open");
    };
  }

  const params = new URLSearchParams(location.search);
  const category = params.get("cat");
  const sub = params.get("sub");
  const series = params.get("series"); // 3단계 파라미터 추가

  // =========================
  // 📸 Photos 로직
  // =========================
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
          item.onclick = () =>
            location.href = `viewer.html?img=${encodeURIComponent(img.src)}&from=photos`;
          list.appendChild(item);
        };
      });
    }
    return;
  }

  // =========================
  // 📝 Posts 로직 (3단계 대응 업데이트)
  // =========================
  fetch("posts/index.json?v=" + new Date().getTime())
    .then(r => r.json())
    .then(originalPosts => {
      const validPosts = originalPosts.filter(p => p && p.title && p.date);
      let posts = [...validPosts];

      // 사이드바 메뉴 구성
      if (category === "diary") {
        // 2단계 메뉴(sub) 추출
        const subs = [...new Set(validPosts.filter(p => p.category === "diary").map(p => p.sub))];
        
        let menuHtml = `<a href="index.html?cat=diary"${(!sub && !series) ? ' class="active"' : ''}>전체 기록</a>`;

        subs.forEach(s => {
          const isActive = (sub === s);
          menuHtml += `<a href="index.html?cat=diary&sub=${encodeURIComponent(s)}"${isActive ? ' class="active"' : ''}>${s}</a>`;
          
          // 3단계 로직: 만약 현재 메뉴가 '글'이거나, 사용자가 클릭한 sub라면 세부 시리즈(series) 노출
          if (s === "글" && (sub === "글" || series)) {
            const seriesList = [...new Set(validPosts.filter(p => p.sub === "글").map(p => p.series).filter(Boolean))];
            
            seriesList.forEach(ser => {
              const isSerActive = (series === ser);
              // 들여쓰기 디자인을 위해 스타일 추가
              menuHtml += `<a href="index.html?cat=diary&sub=글&series=${encodeURIComponent(ser)}"${isSerActive ? ' class="active"' : ''} style="padding-left: 30px; font-size: 13px; opacity: 0.8;">└ ${ser}</a>`;
            });
          }
        });
        subMenu.innerHTML = menuHtml;
      } else {
        subMenu.innerHTML = `<a href="index.html" class="active">최신글 목록</a>`;
      }

      // 필터링 로직
      if (category) posts = posts.filter(p => p.category === category);
      if (sub) posts = posts.filter(p => p.sub === sub);
      if (series) posts = posts.filter(p => p.series === series); // 3단계 필터 적용

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

        item.onclick = () => {
          // 정확한 복귀 주소 생성 (3단계까지 포함)
          let from = "home";
          if (category === "diary") {
            if (series) from = `diary-글-${series}`;
            else if (sub) from = `diary-${sub}`;
            else from = "diary-all";
          }
          
          let fileName = p.file || p.date;
          if (!fileName.toString().endsWith('.json')) fileName += '.json';
          location.href = `viewer.html?post=posts/${fileName}&from=${encodeURIComponent(from)}`;
        };
        list.appendChild(item);
      });
    })
    .catch(err => {
      console.error(err);
      list.innerHTML = "글을 불러오지 못했습니다.";
    });
});
