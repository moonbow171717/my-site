document.addEventListener("DOMContentLoaded", () => {
  if (!sessionStorage.getItem("auth")) {
    location.href = "login.html";
    return;
  }

  const q = new URLSearchParams(location.search);
  const postUrl = q.get("post");
  const img = q.get("img");
  
  // 뒤로가기 경로 보정 (잘못된 접근 방지)
  let rawPath = q.get("from") || "index.html";
  const fromPath = rawPath.startsWith("?") ? "index.html" + rawPath : rawPath;

  const container = document.getElementById("post");
  const sidebar = document.getElementById("sidebar");

  // 뒤로가기 버튼 텍스트 설정
  let backText = "← 돌아가기";
  if (fromPath.includes("sub=")) {
    const subName = decodeURIComponent(fromPath.split("sub=")[1].split("&")[0]);
    backText = `← ${subName}로 돌아가기`;
  } else if (fromPath.includes("parent=")) {
    const parentName = decodeURIComponent(fromPath.split("parent=")[1].split("&")[0]);
    backText = `← ${parentName}로 돌아가기`;
  } else if (fromPath.includes("cat=diary")) {
    backText = "← Diary 전체로 돌아가기";
  } else if (fromPath.includes("cat=photos")) {
    backText = "← Photos로 돌아가기";
  } else {
    backText = "← Home으로 돌아가기";
  }

  // 사진 전용 뷰 모드
  if (img) {
    sidebar.innerHTML = `<a href="${fromPath}" class="active">${backText}</a>`;
    container.innerHTML = `
      <div class="post-view">
        <div class="img-wrap"><img src="${img}" class="zoomable"></div>
        <a class="back-btn" href="${fromPath}">${backText}</a>
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
        sidebar.innerHTML = `<a href="${fromPath}" class="active">${backText}</a>`;
        container.innerHTML = `
          <article class="post-view">
            <h1 class="post-title">${p.title}</h1>
            <div class="meta">${p.date}</div>
            ${images}
            <div class="post-content">${content}</div>
            <a class="back-btn" href="${fromPath}">${backText}</a>
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
