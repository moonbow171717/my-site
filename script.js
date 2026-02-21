document.addEventListener("DOMContentLoaded", () => {
  const list = document.getElementById("post-list");
  const subMenu = document.getElementById("sub-menu");
  const menuBtn = document.getElementById("menuBtn");
  const sidebar = document.getElementById("sidebar");

  if (menuBtn) {
    menuBtn.onclick = () => sidebar.classList.toggle("open");
  }

  const params = new URLSearchParams(location.search);
  const category = params.get("cat") || ""; // 기본값 빈 문자열
  const sub = params.get("sub") || "";      // 기본값 빈 문자열
  const series = params.get("series") || ""; // 기본값 빈 문자열

  // =========================
  // 📸 Photos 로직 (생략 없이 유지)
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
          item.onclick = () => location.href = `viewer.html?img=${encodeURIComponent(img.src)}&from=photos`;
          list.appendChild(item);
        };
      });
    }
    return;
  }

  // =========================
  // 📝 Posts 로직 (필터링 오류 수정)
  // =========================
  fetch("posts/index.json?v=" + new Date().getTime())
    .then(r => r.json())
    .then(originalPosts => {
      const validPosts = (originalPosts || []).filter(p => p && p.title && p.date);
      
      // 1. 메뉴 생성 로직
      if (category === "diary") {
        const myMenuOrder = ["전체 기록", "글", "냐람", "냐쥬", "♡", "끄적끄적", "일상"];
        let menuHtml = "";

        myMenuOrder.forEach(mName => {
          if (mName === "전체 기록") {
            menuHtml += `<a href="index.html?cat=diary"${(!sub && !series) ? ' class="active"' : ''}>전체 기록</a>`;
          } else {
            const isActive = (sub === mName);
            menuHtml += `<a href="index.html?cat=diary&sub=${encodeURIComponent(mName)}"${isActive ? ' class="active"' : ''}>${mName}</a>`;
            
            // "글" 메뉴 하위 시리즈 노출
            if (mName === "글" && (sub === "글" || series)) {
              const seriesList = [...new Set(validPosts.filter(p => p.sub === "글").map(p => p.series).filter(Boolean))];
              seriesList.forEach(ser => {
                const isSerActive = (series === ser);
                menuHtml += `<a href="index.html?cat=diary&sub=글&series=${encodeURIComponent(ser)}"${isSerActive ? ' class="active"' : ''} style="padding-left: 25px; font-size: 0.9em; opacity: 0.8; border: none;">└ ${ser}</a>`;
              });
            }
          }
        });
        subMenu.innerHTML = menuHtml;
      } else {
        subMenu.innerHTML = `<a href="index.html" class="active">최신글 목록</a>`;
      }

      // 2. 필터링 로직 (여기가 핵심 수정 부분!)
      let posts = [...validPosts];
      
      if (category) {
        posts = posts.filter(p => p.category === category);
      }
      
      if (sub) {
        posts = posts.filter(p => p.sub === sub);
        if (series) {
          posts = posts.filter(p => p.series === series);
        }
      }

      // 3. 화면 렌더링
      posts.sort((a, b) => new Date(b.date) - new Date(a.date));
      list.innerHTML = "";

      if (posts.length === 0) {
        list.innerHTML = "<p style='text-align:center; padding: 50px; color: #888;'>작성된 글이 아직 없어요.</p>";
      } else {
        posts.forEach(p => {
          const item = document.createElement("div");
          item.className = "post-item";
          item.innerHTML = `<h3>${p.title}</h3><span class="date">${p.date}</span><p>${p.excerpt || "내용 보기"}</p>`;
          item.onclick = () => {
            let from = category === "diary" ? (series ? `diary-글-${series}` : (sub ? `diary-${sub}` : "diary-all")) : "home";
            let fileName = p.file || p.date;
            if (!fileName.toString().endsWith('.json')) fileName += '.json';
            location.href = `viewer.html?post=posts/${fileName}&from=${encodeURIComponent(from)}`;
          };
          list.appendChild(item);
        });
      }
    })
    .catch(err => {
      console.error(err);
      list.innerHTML = "글 목록을 가져오는데 실패했습니다.";
    });
});
