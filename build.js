const fs = require("fs");
const path = require("path");

const postsDir = path.join(__dirname, "posts");

if (!fs.existsSync(postsDir)) {
  console.log("posts 폴더 없음");
  process.exit(0);
}

const files = fs.readdirSync(postsDir)
  .filter(file => file.endsWith(".json") && file !== "index.json");

const posts = files.map(file => {
  const data = JSON.parse(
    fs.readFileSync(path.join(postsDir, file))
  );
  return data;
});

// 날짜 최신순 정렬
posts.sort((a, b) => new Date(b.date) - new Date(a.date));

fs.writeFileSync(
  path.join(postsDir, "index.json"),
  JSON.stringify(posts, null, 2)
);

console.log("index.json 자동 생성 완료");
