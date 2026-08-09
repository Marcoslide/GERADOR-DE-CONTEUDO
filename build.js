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

// Versão para publicação (Artifact / página web): conteúdo interno, sem <!DOCTYPE>/<html>/<head>/<body>
const css = fs.readFileSync(path.join(root, "assets/css/styles.css"), "utf8");
const jsOrder = ["seed", "store", "learning", "ai", "research", "components", "publish", "publication-provider", "variations", "views", "video", "recorder", "campaign", "card", "assistant", "aiprovider", "app"];
const scripts = jsOrder.map((n) => `<script>\n${fs.readFileSync(path.join(root, "assets/js/" + n + ".js"), "utf8")}\n</script>`).join("\n");
const appMarkup = `<div class="app"><aside class="sidebar" id="sidebar"></aside><div class="main"><header class="header" id="header"></header><main class="content" id="content"></main></div></div>`;
const artifact = `<style>\n${css}\n</style>\n${appMarkup}\n${scripts}\n`;
fs.writeFileSync(path.join(root, "viraliza-app.artifact.html"), artifact);
console.log(`viraliza-app.artifact.html gerado (${(Buffer.byteLength(artifact) / 1024).toFixed(0)} KB)`);
