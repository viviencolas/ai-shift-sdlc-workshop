// Version statique : copie public/ (HTML, CSS, JS compilé) dans dist-static/ et bascule le stockage sur localStorage.
import { cp, readFile, rm, writeFile } from "node:fs/promises";

await rm("dist-static", { recursive: true, force: true });
await cp("public", "dist-static", { recursive: true });
const html = await readFile("dist-static/index.html", "utf8");
const patched = html.replace('name="app-storage" content="server"', 'name="app-storage" content="local"');
if (patched === html) throw new Error("meta app-storage introuvable dans public/index.html");
await writeFile("dist-static/index.html", patched);
console.log("Version statique générée dans dist-static/");
