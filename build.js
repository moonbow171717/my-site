const fs = require("fs");
const path = require("path");

const postsDir = path.join(__dirname, "posts");

const files = fs.readdirSync(postsDir)
  .filter(file => file.endsWith(".json") && file !== "index.json");

const index = [];

files.forEach(file => {

  const fullPath = path.join(postsDir, file);
  const data = JSON.parse(fs.readFileSync(fullPath, "utf-8"));

  const subValue = data.sub || "잡담";

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
