document.addEventListener("DOMContentLoaded", () => {

  // 🔐 로그인 체크 (HTML 말고 JS에서만)
  if (!sessionStorage.getItem("auth")) {
    location.href = "login.html";
    return;
  }

  const q = new URLSearchParams(location.search);
  const postUrl = q.get("post");
  const img = q.get("img");
  const from = q.get("from");

  const container = document.getElementById("post");
  const sidebar = document.getElementById("sidebar");

  // =========================
  // 📸 사진 보기
  // =========================
  if (img) {

    const backHref = "index.html?cat=photos";
    const backText = "← Photos로 돌아가기";

    sidebar.innerHTML = `<a href="${backHref}" class="active">${backText}</a>`;

    container.innerHTML = `
      <div class="post-view">
        <div class="img-wrap">
          <img src="${img}" class="zoomable">
        </div>
        <a class="back-btn" href="${backHref}">${backText}</a>
      </div>

      <div id="imgModal" class="img-modal">
        <img id="modalImg">
      </div>
    `;

    const modal = document.getElementById("imgModal");
    const modalImg = document.getElementById("modalImg");

    document.querySelector(".zoomable").onclick = e => {
      modal.style.display = "flex";
      modalImg.src = e.target.src;
    };

    modal.onclick = () => modal.style.display = "none";

    return;
  }

  // =========================
  // 📝 글 보기
  // =========================
  if (!postUrl) {
    container.innerHTML = "잘못된 접근입니다.";
    return;
  }

  fetch(postUrl)
    .then(res => {
      if (!res.ok) throw new Error("파일 없음");
      return res.json();
    })
    .then(p => {

      const images = Array.isArray(p.images)
        ? p.images.map(i => `
          <div class="img-wrap">
            <img src="${i}" class="zoomable">
          </div>
        `).join("")
        : "";

      const loadContent = p.text
        ? fetch(p.text).then(r => r.text())
        : Promise.resolve(p.content || "");

      loadContent.then(txt => {

        const content = txt.replace(/\n/g, "<br>");

        let backHref = "index.html";
        let backText = "← Home으로 돌아가기";

        if (from === "photos") {
          backHref = "index.html?cat=photos";
          backText = "← Photos로 돌아가기";
        }
        else if (from === "diary-all") {
          backHref = "index.html?cat=diary";
          backText = "← Diary 전체로 돌아가기";
        }
        else if (from && from.startsWith("diary-")) {
          const sub = from.replace("diary-", "");
          backHref = `index.html?cat=diary&sub=${encodeURIComponent(sub)}`;
          backText = `← ${sub}로 돌아가기`;
        }

        sidebar.innerHTML = `
          <a href="${backHref}" class="active">${backText}</a>
        `;

        container.innerHTML = `
          <article class="post-view">
            <h1 class="post-title">${p.title}</h1>
            <div class="meta">${p.date}</div>
            ${images}
            <div class="post-content">${content}</div>
            <a class="back-btn" href="${backHref}">${backText}</a>
          </article>

          <div id="imgModal" class="img-modal">
            <img id="modalImg">
          </div>
        `;

        const modal = document.getElementById("imgModal");
        const modalImg = document.getElementById("modalImg");

        document.querySelectorAll(".zoomable").forEach(imgEl => {
          imgEl.onclick = () => {
            modal.style.display = "flex";
            modalImg.src = imgEl.src;
          };
        });

        modal.onclick = () => {
          modal.style.display = "none";
        };

      });

    })
    .catch(() => {
      container.innerHTML = "글을 불러오지 못했습니다.";
    });

});
