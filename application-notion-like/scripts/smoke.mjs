// Test de fumée d'un déploiement : npm run smoke -- https://<projet>.vercel.app
// Crée une page et une sous-page, les relit, les modifie, passe par la corbeille, puis supprime. Code de sortie non nul au premier échec.
const base = (process.argv[2] ?? process.env.APP_URL ?? "").replace(/\/+$/, "");
if (!/^https?:\/\//.test(base)) {
  console.error("Usage : npm run smoke -- https://<projet>.vercel.app");
  process.exit(2);
}

async function call(method, path, body) {
  const res = await fetch(`${base}/api${path}`, {
    method,
    headers: { "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : undefined;
  } catch {
    throw new Error(`${method} ${path} : réponse non JSON (statut ${res.status}). Protection de déploiement Vercel active ?`);
  }
  return { status: res.status, data };
}

function check(label, ok, detail = "") {
  console.log(`${ok ? "OK  " : "ÉCHEC"} ${label}${ok ? "" : ` ${detail}`}`);
  if (!ok) process.exit(1);
}

const home = await fetch(`${base}/`);
check("la page d'accueil répond", home.status === 200 && (await home.text()).includes("Notion-like"), `(statut ${home.status})`);

const created = await call("POST", "/pages", { title: "Test de fumée", icon: "🧪", blocks: [{ type: "paragraph", text: "Bonjour" }] });
check("création d'une page (201)", created.status === 201, JSON.stringify(created.data));
const id = created.data.id;

const sub = await call("POST", "/pages", { title: "Sous-page de fumée", parentId: id });
check("création d'une sous-page", sub.status === 201 && sub.data.parentId === id, JSON.stringify(sub.data));

const read = await call("GET", `/pages/${id}`);
check("lecture de la page", read.status === 200 && read.data.blocks[0]?.text === "Bonjour" && read.data.icon === "🧪", JSON.stringify(read.data));

const updated = await call("PUT", `/pages/${id}`, {
  title: "Test de fumée modifié",
  blocks: [
    { id: "b2", type: "heading_1", text: "Titre" },
    { id: "b1", type: "todo", text: "Tâche", checked: true },
  ],
});
check("modification du titre et des blocs", updated.status === 200 && updated.data.title === "Test de fumée modifié");

const again = await call("GET", `/pages/${id}`);
check(
  "données conservées au rechargement",
  again.data?.title === "Test de fumée modifié" && again.data.blocks.map((b) => b.id).join() === "b2,b1" && again.data.blocks[1]?.checked === true,
);

const list = await call("GET", "/pages");
check("la page et sa sous-page figurent dans la liste", list.data.some((p) => p.id === id) && list.data.some((p) => p.id === sub.data.id));

check("suppression directe refusée hors corbeille (409)", (await call("DELETE", `/pages/${id}`)).status === 409);
check("mise à la corbeille", (await call("PUT", `/pages/${id}`, { trashed: true })).data?.trashedAt != null);
const trash = await call("GET", "/pages?trashed=1");
check("la page est dans la corbeille", trash.data.some((p) => p.id === id));
check("la sous-page a quitté la liste", !(await call("GET", "/pages")).data.some((p) => p.id === sub.data.id));
check("restauration", (await call("PUT", `/pages/${id}`, { trashed: false })).data?.trashedAt === null);
await call("PUT", `/pages/${id}`, { trashed: true });
check("suppression définitive (204)", (await call("DELETE", `/pages/${id}`)).status === 204);
check("page supprimée (404)", (await call("GET", `/pages/${id}`)).status === 404);
check("sous-page supprimée avec elle (404)", (await call("GET", `/pages/${sub.data.id}`)).status === 404);
console.log("Tous les contrôles sont passés.");
