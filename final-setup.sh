#!/bin/bash
set -e

cd /opt/splatica-map

# Install dependencies if node_modules doesn't exist
if [ ! -d node_modules ]; then
    echo "Installing dependencies..."
    npm install --no-optional --legacy-peer-deps
fi

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo "Creating .env.local..."
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

# Stop existing PM2 process
pm2 stop splatica-map 2>/dev/null || true
pm2 delete splatica-map 2>/dev/null || true

# Start with PM2 on port 8080
echo "Starting application on port 8080..."
PORT=8080 pm2 start npm --name splatica-map -- start
pm2 save

echo "=== Setup Complete ==="
pm2 status
pm2 logs splatica-map --lines 20 --nostream

