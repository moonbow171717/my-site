const fs = require("fs");
const path = require("path");

const postsDir = path.join(__dirname, "posts");

const files = fs.readdirSync(postsDir)
  .filter(file => file.endsWith(".json"));

const index = [];

files.forEach(file => {

  const fullPath = path.join(postsDir, file);
  const data = JSON.parse(fs.readFileSync(fullPath, "utf-8"));

  // 🔥 sub 없으면 기본값 "잡담"
  const subValue = data.sub || "잡담";

  // 🔥 excerpt 자동 생성
  let excerpt = data.excerpt || "";

  if (!excerpt && data.text) {
    excerpt = "내용 보기";
  }

  index.push({
    title: data.title,
    date: data.date,
    category: data.category,
    sub: subValue,
    excerpt: excerpt
  });

});

index.sort((a, b) => new Date(b.date) - new Date(a.date));

fs.writeFileSync(
  path.join(postsDir, "index.json"),
  JSON.stringify(index, null, 2)
);

console.log("index.json generated successfully");
