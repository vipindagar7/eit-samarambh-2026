#!/bin/bash
# ============================================================
# deploy.sh — pull latest code from GitHub, rebuild, and
# restart the app + reload nginx.
#
# Run this on the VPS, from inside the project folder:
#   cd /var/www/eit-samarambh-2026
#   ./deploy.sh
#
# First time only:
#   chmod +x deploy.sh
# ============================================================

set -e  # stop immediately if any command fails

APP_DIR="/var/www/eit-samarambh-2026"
BRANCH="main"
PM2_APP_NAME="eit-samarambh-2026"
NGINX_SITE="starnight.eitfaridabad.co.in"

# colors for readable output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() { echo -e "${GREEN}==>${NC} $1"; }
warn() { echo -e "${YELLOW}==>${NC} $1"; }
fail() { echo -e "${RED}==> ERROR:${NC} $1"; exit 1; }

cd "$APP_DIR" || fail "Could not cd into $APP_DIR"

log "Pulling latest code from GitHub ($BRANCH)..."
git fetch origin "$BRANCH"
git reset --hard "origin/$BRANCH"

log "Installing dependencies..."
npm install

log "Building the app..."
npm run build

log "Making sure the logs folder exists..."
mkdir -p logs

log "Restarting the app via PM2..."
if pm2 describe "$PM2_APP_NAME" > /dev/null 2>&1; then
  pm2 restart "$PM2_APP_NAME"
else
  warn "PM2 process '$PM2_APP_NAME' not found — starting it fresh."
  pm2 start ecosystem.config.js
fi
pm2 save

log "Checking nginx config..."
if sudo nginx -t; then
  log "Reloading nginx..."
  sudo systemctl reload nginx
else
  fail "nginx config test failed — NOT reloading. Fix the config and rerun."
fi

log "Deploy complete. Site: https://$NGINX_SITE"
pm2 status "$PM2_APP_NAME"