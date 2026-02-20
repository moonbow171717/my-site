const fs = require("fs");
const path = require("path");

const postsDir = path.join(__dirname, "posts");

const files = fs.readdirSync(postsDir);

const postFiles = files.filter(
  file => file.endsWith(".json") && file !== "index.json"
);

let indexData = [];

postFiles.forEach(file => {
  const filePath = path.join(postsDir, file);
  const raw = fs.readFileSync(filePath, "utf-8");
  const data = JSON.parse(raw);

  indexData.push({
    date: data.date,
    title: data.title,
    category: data.category || "diary",
    sub: data.sub || "잡담",
    file: file, // 🔥 실제 파일명 저장
    excerpt: data.content
      ? data.content.substring(0, 40)
      : "텍스트 글입니다..."
  });
});

// 날짜 최신순 정렬 유지
indexData.sort((a, b) => new Date(b.date) - new Date(a.date));

fs.writeFileSync(
  path.join(postsDir, "index.json"),
  JSON.stringify(indexData, null, 2),
  "utf-8"
);

console.log("✅ index.json 자동 생성 완료!");