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
    backText = "← Photos 목록으로 돌아가기";
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

  // [수정] 사이드바에는 텍스트만 넣거나 비워둡니다 (중복 방지)
  sidebar.innerHTML = `<div style="padding:10px; color:#fff; font-weight:bold;">VIEWING</div>`;

  // [수정] 본문용 버튼 HTML (인라인 스타일로 줄바꿈 절대 방지)
  const backBtnHtml = `
    <div style="margin-bottom: 30px; display: block; clear: both;">
      <a class="back-btn" href="${fromPath}" style="white-space: nowrap !important; display: inline-flex !important; align-items: center;">
        ${backText}
      </a>
    </div>`;

  // 사진 전용 뷰 모드
  if (img) {
    container.innerHTML = `
      <div class="post-view">
        ${backBtnHtml}
        <div class="img-wrap"><img src="${img}" class="zoomable"></div>
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

  // 게시글 뷰 모드
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
        container.innerHTML = `
          <article class="post-view">
            <h1 class="post-title">${p.title}</h1>
            <div class="meta">${p.date}</div>
            <div style="margin-top:20px;">
              ${backBtnHtml}
            </div>
            ${images}
            <div class="post-content">${content}</div>
          </article>
          <div id="imgModal" class="img-modal"><img id="modalImg"></div>`;

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
