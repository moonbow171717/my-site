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
    document.querySelector(".zoomable").onclick = e => { modal.style.display = "flex"; modalImg.src = e.target.src; };
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
            // [강화된 매칭 로직] 현재 글의 카테고리명을 정규화 (공백 제거 및 소문자화)
            const currentSub = (p.sub || "").replace(/\s/g, "");

            // 같은 카테고리에 속한 글들을 더 유연하게 찾습니다.
            const seriesPosts = allPosts
              .filter(item => {
                if (!item.sub) return false;
                const itemSub = item.sub.replace(/\s/g, "");
                // 완벽히 일치하거나, 한쪽이 다른 쪽을 포함하고 있으면 같은 그룹으로 간주
                return itemSub === currentSub || itemSub.includes(currentSub) || currentSub.includes(itemSub);
              })
              .sort((a, b) => new Date(a.date) - new Date(b.date));

            const currentIndex = seriesPosts.findIndex(item => {
              const itemPath = `posts/${item.file || item.date}.json`;
              return itemPath === postUrl;
            });

            const navContainer = document.getElementById("series-nav");
            if (currentIndex !== -1 && seriesPosts.length > 1) {
              const shortMenus = ["NR", "일상", "잡담", "카페", "끄적", "♡"];
              const isShort = shortMenus.some(m => currentSub.includes(m));
              const unit = isShort ? "글" : "화";
              
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
