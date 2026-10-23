#!/usr/bin/env bash
# Rebuild Cyto Guide data and push to GitHub Pages (creates the repo + Pages on first run).
set -euo pipefail
cd /workspace/cytoguide/app
for f in /workspace/cytoguide/src/*.py; do [ "$(basename $f)" = common.py ] || (cd /workspace/cytoguide/src && python3 "$(basename $f)"); done
python3 build_data.py
[ -d .git ] || git init -q -b main
git add -A
git diff --cached --quiet || git -c user.name=WajidMisbah -c user.email=WajidMisbah@users.noreply.github.com commit -qm "Cyto Guide update $(date +%F)"
gh auth setup-git >/dev/null 2>&1 || true
if ! git remote get-url origin >/dev/null 2>&1; then
  gh repo create WajidMisbah/cytoguide --public --source . --remote origin --push
  gh api -X POST repos/WajidMisbah/cytoguide/pages -f "source[branch]=main" -f "source[path]=/" >/dev/null || true
else
  git push -q origin main
fi
echo "Pushed. Live (after Pages build): https://wajidmisbah.github.io/cytoguide/"
