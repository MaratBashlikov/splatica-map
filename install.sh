#!/bin/bash
set -e

cd /opt/splatica-map

# Check if dependencies are installed
if [ ! -d node_modules ]; then
    echo "Installing dependencies (this may take a while)..."
    npm install --no-optional --legacy-peer-deps || npm install
fi

# Create .env.local
if [ ! -f .env.local ]; then
    cat > .env.local << 'EOF'
DATABASE_URL="file:./prisma/dev.db"
NEXT_PUBLIC_MAPBOX_TOKEN="your_mapbox_token_here"
ADMIN_PASSWORD="change_me_secure_password"
EOF
fi

# Setup database
echo "Setting up database..."
npx prisma generate
npx prisma db push

# Build
echo "Building application..."
npm run build

# Stop old process
pm2 stop splatica-map 2>/dev/null || true
pm2 delete splatica-map 2>/dev/null || true

# Start on port 8080
echo "Starting on port 8080..."
PORT=8080 pm2 start npm --name splatica-map -- start
pm2 save

echo "Done! Check status with: pm2 status"
pm2 status

