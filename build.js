/* Gera VIRALIZA.html — um único arquivo com CSS e JS embutidos,
   para abrir com duplo clique sem precisar da pasta assets/.
   Uso: node build.js */
const fs = require("fs");
const path = require("path");

const root = __dirname;
let html = fs.readFileSync(path.join(root, "index.html"), "utf8");

// Inline CSS: <link rel="stylesheet" href="assets/css/styles.css" />
html = html.replace(/<link rel="stylesheet" href="([^"]+)"\s*\/?>/g, (m, href) => {
  const css = fs.readFileSync(path.join(root, href), "utf8");
  return `<style>\n${css}\n</style>`;
});

// Inline JS: <script src="assets/js/*.js"></script>  (na ordem em que aparecem)
html = html.replace(/<script src="([^"]+)"><\/script>/g, (m, src) => {
  const js = fs.readFileSync(path.join(root, src), "utf8");
  return `<script>\n${js}\n</script>`;
});

fs.writeFileSync(path.join(root, "VIRALIZA.html"), html);
const kb = (fs.statSync(path.join(root, "VIRALIZA.html")).size / 1024).toFixed(0);
console.log(`VIRALIZA.html gerado (${kb} KB)`);
