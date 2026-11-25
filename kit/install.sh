#!/usr/bin/env bash
#
# AI SDLC — installateur du Kit Cursor.
# Usage : bash install.sh [chemin/vers/projet]
#   - par défaut, installe dans le répertoire courant.
#   - le script copie `.cursor/` du kit (rules, modes, mcp.json) dans la cible.
#
set -euo pipefail

KIT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET="${1:-$PWD}"

echo "AI SDLC · Kit Cursor"
echo "  Source    : ${KIT_DIR}"
echo "  Cible     : ${TARGET}"

if [[ ! -d "${TARGET}" ]]; then
  echo "✗ Cible introuvable : ${TARGET}" >&2
  exit 1
fi

if [[ -e "${TARGET}/.cursor" ]]; then
  read -r -p "⚠  ${TARGET}/.cursor existe déjà. Écraser ? [y/N] " answer
  case "${answer}" in
    y|Y|yes|YES) rm -rf "${TARGET}/.cursor" ;;
    *) echo "Abandon." ; exit 1 ;;
  esac
fi

mkdir -p "${TARGET}/.cursor"
cp -R "${KIT_DIR}/.cursor/rules"  "${TARGET}/.cursor/rules"
cp -R "${KIT_DIR}/.cursor/modes"  "${TARGET}/.cursor/modes"
cp    "${KIT_DIR}/.cursor/mcp.json" "${TARGET}/.cursor/mcp.json"

mkdir -p "${TARGET}/aisdlc/pivots" "${TARGET}/aisdlc/examples"
cp -R "${KIT_DIR}/pivots/."   "${TARGET}/aisdlc/pivots/"
cp -R "${KIT_DIR}/examples/." "${TARGET}/aisdlc/examples/"

echo "✓ Rules installées     : ${TARGET}/.cursor/rules/"
echo "✓ Modes installés      : ${TARGET}/.cursor/modes/"
echo "✓ MCP installé         : ${TARGET}/.cursor/mcp.json"
echo "✓ Schémas pivots       : ${TARGET}/aisdlc/pivots/"
echo "✓ Exemples             : ${TARGET}/aisdlc/examples/"
echo ""
echo "Étapes suivantes :"
echo "  1. Exporte tes variables d'env (voir README §MCP) :"
echo "       ATLASSIAN_SITE_URL, ATLASSIAN_EMAIL, ATLASSIAN_API_TOKEN,"
echo "       GITHUB_TOKEN, FIGMA_API_TOKEN, ZAPIER_MCP_URL, ZAPIER_MCP_API_KEY"
echo "  2. Ouvre le projet dans Cursor et lance le mode : aisdlc.team.smoke-test"
echo "     (ou, à défaut, Composer puis vérifie que les 4 serveurs MCP sont verts)."
echo "  3. Rejoins le Cursor Team « AI SDLC » pour recevoir les updates futures."
