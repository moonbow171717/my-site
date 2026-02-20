const fs = require("fs");
const path = require("path");

const postsDir = path.join(__dirname, "posts");

const files = fs.readdirSync(postsDir)
  .filter(file => file.endsWith(".json"));

const index = [];

files.forEach(file => {
  const fullPath = path.join(postsDir, file);
  const data = JSON.parse(fs.readFileSync(fullPath, "utf-8"));

  index.push({
    title: data.title,
    date: data.date,
    category: data.category,
    sub: data.sub || "",
    excerpt: data.excerpt || ""
  });
});

// 날짜 최신순 정렬
index.sort((a, b) => new Date(b.date) - new Date(a.date));

// index.json 생성
fs.writeFileSync(
  path.join(postsDir, "index.json"),
  JSON.stringify(index, null, 2)
);

console.log("index.json generated successfully");
