#!/bin/zsh
set -euo pipefail

cd "$(dirname "$0")"

URL="http://127.0.0.1:5173/"

if curl -fsS "$URL" >/dev/null 2>&1; then
  echo "Olympus Brawler is already running."
  open "$URL"
  exit 0
fi

if [ ! -d "node_modules" ]; then
  echo "Project dependencies are missing."
  echo "Run npm install in this folder first, then open this launcher again."
  read -r "?Press Enter to close this window."
  exit 1
fi

echo "Starting Olympus Brawler..."
npm run dev -- --port 5173 &
SERVER_PID=$!

cleanup() {
  kill "$SERVER_PID" >/dev/null 2>&1 || true
}

trap cleanup INT TERM EXIT

for _ in {1..80}; do
  if curl -fsS "$URL" >/dev/null 2>&1; then
    echo "Opening $URL"
    open "$URL"
    wait "$SERVER_PID"
    exit 0
  fi

  sleep 0.25
done

echo "The game server did not start in time."
echo "Try running npm run dev from Terminal to see the full error."
read -r "?Press Enter to close this window."
exit 1
