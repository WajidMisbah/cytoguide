# Cyto Guide PWA
Static offline cytology reporting reference (mirrors Pathmates).

- Content source: /workspace/cytoguide/src/*.py -> data/<system>.json (one per system)
- Build: python3 build_data.py (merges data/*.json + coming-soon catalogue -> data.json, bumps sw.js VERSION)
- Local: python3 -m http.server 8765
- Deploy: ./deploy.sh (GitHub Pages, WajidMisbah/cytoguide)
- Add a batch-2 system: write src/<id>.py using common.py helpers with the same id as in build_data.py CATALOGUE.
