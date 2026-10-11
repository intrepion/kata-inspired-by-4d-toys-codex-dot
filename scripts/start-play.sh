#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."
if lsof -nP -iTCP:5192 -sTCP:LISTEN >/dev/null 2>&1; then
  echo 'Port 5192 is already occupied. Inspect the listener before restarting.' >&2
  exit 1
fi
npm run build
# Session-only detached process; no launch agent, login item, or machine configuration.
python3 - <<'PY'
import subprocess, pathlib
root=pathlib.Path.cwd()
with (root/'.play-server.log').open('a') as log:
    process=subprocess.Popen(['node','node_modules/vite/bin/vite.js','preview','--host','127.0.0.1','--port','5192','--strictPort'],stdin=subprocess.DEVNULL,stdout=log,stderr=log,start_new_session=True,cwd=root)
(root/'.play-server.pid').write_text(str(process.pid)+'\n')
print(f'Play server PID {process.pid}: http://127.0.0.1:5192')
PY
