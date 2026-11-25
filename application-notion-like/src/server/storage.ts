import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import type { Database } from "../shared/types.js";
import { seedDatabase } from "./pages.js";

export class JsonStore {
  private db: Database;

  constructor(private readonly file: string) {
    this.db = existsSync(file) ? (JSON.parse(readFileSync(file, "utf8")) as Database) : seedDatabase();
    if (!existsSync(file)) this.save();
  }

  get data(): Database {
    return this.db;
  }

  save(): void {
    mkdirSync(dirname(this.file), { recursive: true });
    const tmp = `${this.file}.tmp`;
    writeFileSync(tmp, JSON.stringify(this.db, null, 2));
    renameSync(tmp, this.file);
  }
}
