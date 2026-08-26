# Deploying eit-samarambh-2026

## 1. Push to GitHub (from your local machine, inside the project folder)

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main

# Create the repo on GitHub first (github.com/new), name it eit-samarambh-2026
# Don't initialize it with a README/license — keep it empty, then:
git remote add origin https://github.com/<your-username>/eit-samarambh-2026.git
git push -u origin main
```

## 2. First-time server setup (on the server, as a user with sudo)

```bash
sudo mkdir -p /var/www/eit-samarambh-2026
sudo chown $USER:$USER /var/www/eit-samarambh-2026
cd /var/www
git clone https://github.com/<your-username>/eit-samarambh-2026.git eit-samarambh-2026
cd eit-samarambh-2026
```

Create `.env.local` here with production values (MongoDB, Google Sheets,
SMTP — see `.env.local.example` for the full list). This file is
gitignored, so it never gets committed — you create it directly on the
server, once.

```bash
npm install
npm run build
mkdir -p logs
pm2 start ecosystem.config.js
pm2 save
pm2 startup   # run whatever command this prints
```

Then set up nginx + SSL as described in the nginx config file's header
comment (`starnight.eitfaridabad.co.in.conf`).

## 3. Every future update (deploying new changes)

Push from your local machine as usual (`git add`, `commit`, `push`), then
on the server:

```bash
cd /var/www/eit-samarambh-2026
git pull origin main
npm install        # only needed if package.json changed
npm run build
pm2 restart eit-samarambh-2026
```