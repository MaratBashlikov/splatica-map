#!/bin/bash
set -e

cd /opt/splatica-map

echo "=== Completing Installation ==="

# Clean and reinstall
echo "Cleaning and reinstalling dependencies..."
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

# Setup Prisma
echo "Setting up database..."
npx prisma generate
npx prisma db push

# Build
echo "Building application..."
npm run build

# Restart PM2
echo "Restarting application..."
pm2 stop splatica-map 2>/dev/null || true
pm2 delete splatica-map 2>/dev/null || true
PORT=8080 pm2 start npm --name splatica-map -- start
pm2 save

echo "=== Installation Complete ==="
pm2 status
pm2 logs splatica-map --lines 20 --nostream

