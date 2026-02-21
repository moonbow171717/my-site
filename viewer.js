document.addEventListener("DOMContentLoaded", () => {
  if (!sessionStorage.getItem("auth")) {
    location.href = "login.html";
    return;
  }

  const q = new URLSearchParams(location.search);
  const postUrl = q.get("post");
  const img = q.get("img");
  
  let rawPath = q.get("from") || "index.html";
  const fromPath = rawPath.startsWith("?") ? "index.html" + rawPath : rawPath;

  const container = document.getElementById("post");
  const sidebar = document.getElementById("sidebar");

  let backText = "← 돌아가기";
  if (fromPath.includes("cat=photos")) {
    backText = "← Photos로 돌아가기";
  } else if (fromPath.includes("sub=")) {
    const subName = decodeURIComponent(fromPath.split("sub=")[1].split("&")[0]);
    backText = `← ${subName}로 돌아가기`;
  } else if (fromPath.includes("parent=")) {
    const parentName = decodeURIComponent(fromPath.split("parent=")[1].split("&")[0]);
    backText = `← ${parentName}로 돌아가기`;
  } else if (fromPath.includes("cat=diary")) {
    backText = "← Diary 전체로 돌아가기";
  } else {
    backText = "← Home으로 돌아가기";
  }

  if (img) {
    sidebar.innerHTML = `<a href="${fromPath}" class="active">${backText}</a>`;
    container.innerHTML = `
      <div class="post-view">
        <div class="img-wrap"><img src="${img}" class="zoomable"></div>
        <div style="margin-top:20px;"><a class="back-btn" href="${fromPath}">${backText}</a></div>
      </div>
      <div id="imgModal" class="img-modal"><img id="modalImg"></div>`;
    
    const modal = document.getElementById("imgModal");
    const modalImg = document.getElementById("modalImg");
    document.querySelector(".zoomable").onclick = e => {
      modal.style.display = "flex";
      modalImg.src = e.target.src;
    };
    modal.onclick = () => modal.style.display = "none";
    return;
  }

  if (!postUrl) {
    container.innerHTML = "잘못된 접근입니다.";
    return;
  }

  // 1. 현재 글 내용 가져오기
  fetch(postUrl)
    .then(res => res.json())
    .then(p => {
      const images = Array.isArray(p.images) ? p.images.map(i => `<div class="img-wrap"><img src="${i}" class="zoomable"></div>`).join("") : "";
      const loadContent = p.text ? fetch(p.text).then(r => r.text()) : Promise.resolve(p.content || "");

      loadContent.then(txt => {
        const content = txt.replace(/\n/g, "<br>");
        sidebar.innerHTML = `<a href="${fromPath}" class="active">${backText}</a>`;
        
        // 게시글 기본 구조 삽입
        container.innerHTML = `
          <article class="post-view">
            <h1 class="post-title">${p.title}</h1>
            <div class="meta">${p.date}</div>
            ${images}
            <div class="post-content">${content}</div>
            <div id="series-nav" style="margin-top:40px; display:flex; justify-content:space-between; gap:10px;"></div>
            <div style="margin-top:20px;"><a class="back-btn" href="${fromPath}">${backText}</a></div>
          </article>
          <div id="imgModal" class="img-modal"><img id="modalImg"></div>`;

        // 2. 시리즈 이동 버튼 로직 (index.json 참조)
        fetch("posts/index.json?v=" + Date.now())
          .then(res => res.json())
          .then(allPosts => {
            // 현재 글과 같은 'sub'를 가진 글들만 필터링 (날짜순 정렬)
            const seriesPosts = allPosts
              .filter(item => item.sub === p.sub)
              .sort((a, b) => new Date(a.date) - new Date(b.date)); // 1화부터 순서대로

            const currentIndex = seriesPosts.findIndex(item => {
              const itemPath = `posts/${item.file || item.date}.json`;
              return itemPath === postUrl;
            });

            const navContainer = document.getElementById("series-nav");
            if (currentIndex !== -1 && seriesPosts.length > 1) {
              let navHtml = "";
              
              // 이전 글 버튼 (현재가 1화가 아니면 생성)
              if (currentIndex > 0) {
                const prev = seriesPosts[currentIndex - 1];
                const prevUrl = `viewer.html?post=posts/${prev.file || prev.date}.json&from=${encodeURIComponent(q.get("from"))}`;
                navHtml += `<a href="${prevUrl}" class="back-btn" style="flex:1; text-align:center;">← 이전 화</a>`;
              } else {
                navHtml += `<div style="flex:1;"></div>`; // 여백 유지
              }

              // 다음 글 버튼 (현재가 마지막 화가 아니면 생성)
              if (currentIndex < seriesPosts.length - 1) {
                const next = seriesPosts[currentIndex + 1];
                const nextUrl = `viewer.html?post=posts/${next.file || next.date}.json&from=${encodeURIComponent(q.get("from"))}`;
                navHtml += `<a href="${nextUrl}" class="back-btn" style="flex:1; text-align:center;">다음 화 →</a>`;
              } else {
                navHtml += `<div style="flex:1;"></div>`;
              }
              
              navContainer.innerHTML = navHtml;
            }
          });

        const modal = document.getElementById("imgModal");
        const modalImg = document.getElementById("modalImg");
        document.querySelectorAll(".zoomable").forEach(imgEl => {
          imgEl.onclick = () => { modal.style.display = "flex"; modalImg.src = imgEl.src; };
        });
        modal.onclick = () => { modal.style.display = "none"; };
      });
    })
    .catch(() => { container.innerHTML = "글을 불러오지 못했습니다."; });
});
