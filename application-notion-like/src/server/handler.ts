import { HttpError } from "./errors.js";
import { createPage, deletePage, getPage, listPages, updatePage } from "./pages.js";

/**
 * Routes de l'API, en signature web standard (Request -> Response) :
 * le même code sert le serveur local (index.ts) et la fonction de la plateforme (api/[...path].js).
 */

const MAX_BODY = 1_000_000;

function json(status: number, body: unknown): Response {
  return Response.json(body, { status, headers: { "cache-control": "no-store" } });
}

async function readJson(request: Request): Promise<Record<string, unknown>> {
  const text = await request.text();
  if (text.length > MAX_BODY) throw new HttpError(413, "Requête trop volumineuse.");
  if (text.length === 0) return {};
  try {
    const parsed: unknown = JSON.parse(text);
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error();
    return parsed as Record<string, unknown>;
  } catch {
    throw new HttpError(400, "JSON invalide.");
  }
}

async function route(request: Request): Promise<Response> {
  const method = request.method;
  const parts = new URL(request.url).pathname.split("/").filter(Boolean).slice(1);

  if (parts[0] === "pages") {
    const pageId = parts[1] === undefined ? undefined : decodeURIComponent(parts[1]);
    if (pageId === undefined && parts.length === 1) {
      if (method === "GET") return json(200, await listPages());
      if (method === "POST") return json(201, await createPage(await readJson(request)));
    } else if (pageId !== undefined && parts.length === 2) {
      if (method === "GET") return json(200, await getPage(pageId));
      if (method === "PUT") return json(200, await updatePage(pageId, await readJson(request)));
      if (method === "DELETE") {
        await deletePage(pageId);
        return new Response(null, { status: 204, headers: { "cache-control": "no-store" } });
      }
    }
  }
  throw new HttpError(404, "Route inconnue.");
}

export async function handle(request: Request): Promise<Response> {
  try {
    return await route(request);
  } catch (err) {
    if (err instanceof HttpError) return json(err.status, { error: err.message });
    console.error("Erreur serveur :", err instanceof Error ? err.message : "inconnue");
    return json(500, { error: "Erreur serveur." });
  }
}
