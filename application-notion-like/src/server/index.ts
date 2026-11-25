import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createApp } from "./app.js";
import { JsonStore } from "./storage.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const dataFile = resolve(process.env.DATA_FILE ?? join(root, "data", "db.json"));
const port = Number(process.env.PORT ?? 3000);

createApp(new JsonStore(dataFile), join(root, "public")).listen(port, () => {
  console.log(`Notion-like : http://localhost:${port}`);
});
