#!/usr/bin/env bash
# AI SDLC — Installateur pack Atelier 3 Prototype
# Usage : bash install.sh [chemin/vers/projet]
set -euo pipefail

PACK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET="${1:-$PWD}"

echo "AI SDLC · Pack Atelier 3 Prototype"
echo "  Source : ${PACK_DIR}"
echo "  Cible  : ${TARGET}"

if [[ ! -d "${TARGET}" ]]; then
  echo "✗ Cible introuvable : ${TARGET}" >&2
  exit 1
fi

if [[ -e "${TARGET}/.cursor" ]]; then
  echo "→ .cursor/ existe déjà : fusion (rules/modes Prototype + skills + mcp)."
else
  mkdir -p "${TARGET}/.cursor"
fi

mkdir -p "${TARGET}/.cursor/rules" "${TARGET}/.cursor/modes" "${TARGET}/.cursor/skills"

cp -f "${PACK_DIR}/.cursor/rules/"*.mdc "${TARGET}/.cursor/rules/"
cp -f "${PACK_DIR}/.cursor/modes/"*.json "${TARGET}/.cursor/modes/"
cp -f "${PACK_DIR}/.cursor/mcp.json" "${TARGET}/.cursor/mcp.json"

for skill_dir in "${PACK_DIR}/skills/"*; do
  name="$(basename "${skill_dir}")"
  mkdir -p "${TARGET}/.cursor/skills/${name}"
  cp -f "${skill_dir}/SKILL.md" "${TARGET}/.cursor/skills/${name}/SKILL.md"
done

mkdir -p "${TARGET}/aisdlc/prototype/pivots" \
         "${TARGET}/aisdlc/prototype/examples" \
         "${TARGET}/aisdlc/prototype/guide"
cp -f "${PACK_DIR}/pivots/"*   "${TARGET}/aisdlc/prototype/pivots/"
cp -f "${PACK_DIR}/examples/"* "${TARGET}/aisdlc/prototype/examples/"
cp -f "${PACK_DIR}/guide/"*    "${TARGET}/aisdlc/prototype/guide/"

echo "✓ Rules Prototype  : ${TARGET}/.cursor/rules/aisdlc.prototype.*"
echo "✓ Modes Prototype  : ${TARGET}/.cursor/modes/aisdlc.prototype.*"
echo "✓ Skills (3)       : ${TARGET}/.cursor/skills/aisdlc-prototype-*"
echo "✓ MCP              : ${TARGET}/.cursor/mcp.json"
echo "✓ Pivots/examples  : ${TARGET}/aisdlc/prototype/"
echo ""
echo "Ensuite :"
echo "  1. export ATLASSIAN_* + FIGMA_API_TOKEN"
echo "  2. cursor ${TARGET}"
echo "  3. Composer → mode aisdlc.prototype.flow-mapper"
