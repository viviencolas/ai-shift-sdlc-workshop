// Fonction Vercel : GET /api/pages et POST /api/pages (handler compilé par npm run build dans dist/).
import { handle } from "../../dist/server/handler.js";

export const GET = handle;
export const POST = handle;
