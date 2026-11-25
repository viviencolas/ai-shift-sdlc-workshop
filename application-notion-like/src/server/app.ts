import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { HttpError } from "../shared/errors.js";
import { createPage, deletePage, getPage, listPages, updatePage } from "../shared/pages.js";
import type { JsonStore } from "./storage.js";

const MIME: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
};

const MAX_BODY = 1_000_000;

function send(res: ServerResponse, status: number, body: unknown): void {
  const payload = JSON.stringify(body);
  res.writeHead(status, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
  res.end(payload);
}

async function readJson(req: IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    size += (chunk as Buffer).length;
    if (size > MAX_BODY) throw new HttpError(413, "Requête trop volumineuse.");
    chunks.push(chunk as Buffer);
  }
  if (size === 0) return {};
  try {
    const parsed: unknown = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error();
    return parsed as Record<string, unknown>;
  } catch {
    throw new HttpError(400, "JSON invalide.");
  }
}

export function createApp(store: JsonStore, publicDir: string): Server {
  async function handleApi(req: IncomingMessage, res: ServerResponse, path: string): Promise<void> {
    const method = req.method ?? "GET";
    const parts = path.split("/").filter(Boolean).slice(1);
    const db = store.data;

    if (parts[0] === "pages") {
      const pageId = parts[1];
      if (pageId === undefined) {
        if (method === "GET") return send(res, 200, listPages(db));
        if (method === "POST") {
          const page = createPage(db, await readJson(req));
          store.save();
          return send(res, 201, page);
        }
      } else if (parts.length === 2) {
        if (method === "GET") return send(res, 200, getPage(db, pageId));
        if (method === "PUT") {
          const page = updatePage(db, pageId, await readJson(req));
          store.save();
          return send(res, 200, page);
        }
        if (method === "DELETE") {
          deletePage(db, pageId);
          store.save();
          res.writeHead(204);
          return void res.end();
        }
      }
    }
    throw new HttpError(404, "Route inconnue.");
  }

  async function handleStatic(res: ServerResponse, path: string): Promise<void> {
    const rel = normalize(path === "/" ? "/index.html" : path).replace(/^([/\\])+/, "");
    if (rel.split(/[/\\]/).includes("..")) throw new HttpError(404, "Introuvable.");
    const ext = extname(rel);
    const type = MIME[ext];
    if (!type) throw new HttpError(404, "Introuvable.");
    try {
      const content = await readFile(join(publicDir, rel));
      res.writeHead(200, { "content-type": type });
      res.end(content);
    } catch {
      throw new HttpError(404, "Introuvable.");
    }
  }

  return createServer((req, res) => {
    const path = new URL(req.url ?? "/", "http://localhost").pathname;
    const run = path.startsWith("/api/") ? handleApi(req, res, path) : handleStatic(res, path);
    run.catch((err: unknown) => {
      const status = err instanceof HttpError ? err.status : 500;
      if (status === 500) console.error(err);
      if (!res.headersSent) send(res, status, { error: err instanceof HttpError ? err.message : "Erreur serveur." });
    });
  });
}
