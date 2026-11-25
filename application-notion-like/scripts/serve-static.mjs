// Serveur minimal pour tester dist-static/ en local sous /application/, comme sur GitHub Pages.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";

const types = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript" };
const port = Number(process.env.PORT ?? 4000);
createServer(async (req, res) => {
  const path = new URL(req.url ?? "/", "http://x").pathname.replace(/^\/application\/?/, "/");
  const rel = path === "/" ? "index.html" : path.slice(1);
  if (rel.includes("..")) return void res.writeHead(404).end();
  try {
    const body = await readFile(join("dist-static", rel));
    res.writeHead(200, { "content-type": types[extname(rel)] ?? "application/octet-stream" }).end(body);
  } catch {
    res.writeHead(404).end("Introuvable");
  }
}).listen(port, () => console.log(`Version statique : http://localhost:${port}/application/`));
