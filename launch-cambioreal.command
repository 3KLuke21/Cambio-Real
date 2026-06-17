#!/bin/bash
# launch-cambioreal.command
# Double‑click to run on any macOS machine.

# ---- Helper functions ----
log() { echo "[launch-cambioreal] $1"; }

ensure_homebrew() {
  if ! command -v brew >/dev/null 2>&1; then
    log "Homebrew not found – installing..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    # Add brew to PATH for this session (handles Intel & Apple Silicon)
    export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
  fi
}

ensure_node() {
  if ! command -v node >/dev/null 2>&1; then
    log "Node.js not found – installing via Homebrew..."
    brew install node
  fi
}

# ---- Main script ----
REPO_URL="https://github.com/3KLuke21/Cambio-Real.git"
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

# Pull latest code (clone if repository not present)
if [ -d ".git" ]; then
  log "Git repository detected – pulling latest changes..."
  git pull origin main || git pull origin master || log "Unable to pull – proceeding with existing code"
else
  log "Cloning repository..."
  git clone "$REPO_URL" .
fi

# Ensure required tools are installed
ensure_homebrew
ensure_node

# Install npm dependencies (use ci if lockfile exists)
if [ -f package-lock.json ]; then
  log "Installing npm dependencies (ci)..."
  npm ci
else
  log "Installing npm dependencies..."
  npm install
fi

# Start Vite dev server in background and capture PID
log "Starting Vite dev server..."
npm run dev &
VITE_PID=$!
log "Vite server PID: $VITE_PID"

# Open the app in the default browser
log "Opening http://localhost:5173 in default browser..."
open "http://localhost:5173" || log "Failed to open browser – open manually"

# Cleanup function to stop the server when the script exits
cleanup() {
  if kill -0 $VITE_PID 2>/dev/null; then
    log "Stopping Vite dev server (PID $VITE_PID)..."
    kill $VITE_PID 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

# Keep script alive until the Vite process ends (Ctrl‑C or window close triggers cleanup)
wait $VITE_PID
