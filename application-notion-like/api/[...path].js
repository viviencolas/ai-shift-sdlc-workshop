// Fonction de la plateforme : toutes les routes /api/* passent par le handler compilé (npm run build -> dist/).
import { handle } from "../dist/server/handler.js";

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const DELETE = handle;
