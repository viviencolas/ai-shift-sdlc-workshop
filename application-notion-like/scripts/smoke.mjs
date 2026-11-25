// Test de fumée d'un déploiement : npm run smoke -- https://<projet>.vercel.app
// Crée une page, la relit, la modifie, vérifie la liste, puis la supprime. Code de sortie non nul au premier échec.
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

const created = await call("POST", "/pages", { title: "Test de fumée", blocks: [{ type: "paragraph", text: "Bonjour" }] });
check("création d'une page (201)", created.status === 201, JSON.stringify(created.data));
const id = created.data.id;

const read = await call("GET", `/pages/${id}`);
check("lecture de la page", read.status === 200 && read.data.blocks[0]?.text === "Bonjour", JSON.stringify(read.data));

const updated = await call("PUT", `/pages/${id}`, { title: "Test de fumée modifié" });
check("modification du titre", updated.status === 200 && updated.data.title === "Test de fumée modifié");

const again = await call("GET", `/pages/${id}`);
check("données conservées au rechargement", again.data?.title === "Test de fumée modifié" && again.data.blocks.length === 1);

const list = await call("GET", "/pages");
check("la page figure dans la liste", list.data.some((p) => p.id === id));

check("suppression (204)", (await call("DELETE", `/pages/${id}`)).status === 204);
check("page supprimée (404)", (await call("GET", `/pages/${id}`)).status === 404);
console.log("Tous les contrôles sont passés.");
