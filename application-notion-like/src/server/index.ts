import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { readFile } from "node:fs/promises";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { handle } from "./handler.js";

/** Serveur local de développement : fichiers de public/ et API (même handler que la fonction publiée). */

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const publicDir = join(root, "public");
const port = Number(process.env.PORT ?? 3000);

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
};

async function toRequest(req: IncomingMessage): Promise<Request> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  const hasBody = req.method !== "GET" && req.method !== "HEAD";
  return new Request(new URL(req.url ?? "/", "http://localhost"), {
    method: req.method,
    headers: { "content-type": req.headers["content-type"] ?? "application/json" },
    body: hasBody ? Buffer.concat(chunks) : undefined,
  });
}

async function serveApi(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const response = await handle(await toRequest(req));
  res.writeHead(response.status, Object.fromEntries(response.headers));
  res.end(Buffer.from(await response.arrayBuffer()));
}

async function serveStatic(res: ServerResponse, pathname: string): Promise<void> {
  const rel = pathname === "/" ? "index.html" : pathname.slice(1);
  const type = MIME[extname(rel)];
  if (!type || rel.split("/").includes("..")) return void res.writeHead(404).end("Introuvable");
  try {
    res.writeHead(200, { "content-type": type }).end(await readFile(join(publicDir, rel)));
  } catch {
    res.writeHead(404).end("Introuvable");
  }
}

createServer((req, res) => {
  const { pathname } = new URL(req.url ?? "/", "http://localhost");
  const run = pathname.startsWith("/api/") ? serveApi(req, res) : serveStatic(res, pathname);
  run.catch(() => {
    if (!res.headersSent) res.writeHead(500);
    res.end();
  });
}).listen(port, () => {
  console.log(`Notion-like : http://localhost:${port}`);
});
