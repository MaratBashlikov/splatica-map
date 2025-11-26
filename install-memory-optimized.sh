#!/bin/bash
set -e

cd /opt/splatica-map

echo "=== Memory-Optimized Installation ==="

# Increase swap if needed
if [ ! -f /swapfile ]; then
    echo "Creating swap file..."
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

# Clean
echo "Cleaning..."
rm -rf node_modules package-lock.json

# Install with production flag and memory limits
echo "Installing dependencies (this may take a while)..."
NODE_OPTIONS="--max-old-space-size=1024" npm install --production=false --legacy-peer-deps --prefer-offline --no-audit --no-fund

# Setup Prisma
echo "Setting up database..."
npx prisma generate
npx prisma db push

# Build
echo "Building application..."
NODE_OPTIONS="--max-old-space-size=1024" npm run build

# Restart PM2
echo "Restarting application..."
pm2 stop splatica-map 2>/dev/null || true
pm2 delete splatica-map 2>/dev/null || true
PORT=8080 pm2 start npm --name splatica-map -- start
pm2 save

echo "=== Installation Complete ==="
pm2 status
pm2 logs splatica-map --lines 20 --nostream

