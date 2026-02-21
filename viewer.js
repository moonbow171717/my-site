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
  } else if (fromPath.includes("cat=diary")) {
    backText = "← Diary 전체로 돌아가기";
  } else {
    backText = "← Home으로 돌아가기";
  }

  if (img) {
    sidebar.innerHTML = `<a href="${fromPath}" class="active">${backText}</a>`;
    container.innerHTML = `<div class="post-view"><div class="img-wrap"><img src="${img}" class="zoomable"></div><div style="margin-top:20px;"><a class="back-btn" href="${fromPath}">${backText}</a></div></div><div id="imgModal" class="img-modal"><img id="modalImg"></div>`;
    
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

  fetch(postUrl)
    .then(res => res.json())
    .then(p => {
      const images = Array.isArray(p.images) ? p.images.map(i => `<div class="img-wrap"><img src="${i}" class="zoomable"></div>`).join("") : "";
      const loadContent = p.text ? fetch(p.text).then(r => r.text()) : Promise.resolve(p.content || "");

      loadContent.then(txt => {
        const content = txt.replace(/\n/g, "<br>");
        sidebar.innerHTML = `<a href="${fromPath}" class="active">${backText}</a>`;
        
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

        fetch("posts/index.json?v=" + Date.now())
          .then(res => res.json())
          .then(allPosts => {
            // 💡 [개선] 주소창의 모든 정보를 훑어서 메뉴 이름을 찾아냅니다.
            let currentPathInfo = decodeURIComponent(fromPath).toLowerCase().replace(/\s/g, "");
            
            // 현재 글의 sub 값
            const currentSub = (p.sub || "").trim();

            // 목록 필터링
            const seriesPosts = allPosts
              .filter(item => {
                // 1. '전체 기록'이나 '최신글' 등으로 들어왔을 때 (Diary 전체)
                if (currentPathInfo.includes("cat=diary") || currentPathInfo.includes("index.html")) {
                  return true; 
                }
                // 2. 특정 소분류(sub)로 들어왔을 때
                if (item.sub && currentSub) {
                  return item.sub.trim() === currentSub;
                }
                return false;
              })
              .sort((a, b) => new Date(a.date) - new Date(b.date));

            const currentIndex = seriesPosts.findIndex(item => `posts/${item.file || item.date}.json` === postUrl);

            const navContainer = document.getElementById("series-nav");
            if (currentIndex !== -1 && seriesPosts.length > 1) {
              
              // 💡 '글'로 표시할 단어 리스트
              const postUnits = ["일상", "카페", "nr", "nj", "잡담", "기록", "diary", "index", "목록"]; 
              
              // 주소창 경로에 위 단어가 하나라도 있으면 '글', 아니면 '화'
              const isPostUnit = postUnits.some(u => currentPathInfo.includes(u));
              const unit = isPostUnit ? "글" : "화";
              
              let navHtml = "";
              if (currentIndex > 0) {
                const prev = seriesPosts[currentIndex - 1];
                const prevUrl = `viewer.html?post=posts/${prev.file || prev.date}.json&from=${encodeURIComponent(q.get("from") || "index.html")}`;
                navHtml += `<a href="${prevUrl}" class="back-btn" style="flex:1; text-align:center;">← 이전 ${unit}</a>`;
              } else {
                navHtml += `<div style="flex:1;"></div>`;
              }

              if (currentIndex < seriesPosts.length - 1) {
                const next = seriesPosts[currentIndex + 1];
                const nextUrl = `viewer.html?post=posts/${next.file || next.date}.json&from=${encodeURIComponent(q.get("from") || "index.html")}`;
                navHtml += `<a href="${nextUrl}" class="back-btn" style="flex:1; text-align:center;">다음 ${unit} →</a>`;
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
    });
});
