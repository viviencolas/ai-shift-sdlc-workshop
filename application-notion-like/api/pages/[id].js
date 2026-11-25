// Fonction Vercel : GET, PUT et DELETE /api/pages/:id (même handler que le serveur local).
import { handle } from "../../dist/server/handler.js";

export const GET = handle;
export const PUT = handle;
export const DELETE = handle;
