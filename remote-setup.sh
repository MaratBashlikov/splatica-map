#!/bin/bash
set -e

echo "=== Splatica Map Server Setup ==="

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi

echo "Node.js: $(node --version)"
echo "npm: $(npm --version)"

# Install git if needed
if ! command -v git &> /dev/null; then
    apt-get update
    apt-get install -y git
fi

# Install PM2
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
fi

# Clone or update repository
REPO_DIR="/opt/splatica-map"
if [ -d "$REPO_DIR" ]; then
    echo "Updating repository..."
    cd "$REPO_DIR"
    git pull
else
    echo "Cloning repository..."
    mkdir -p /opt
    cd /opt
    git clone https://github.com/MaratBashlikov/splatica-map.git
    cd "$REPO_DIR"
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Create .env.local if not exists
if [ ! -f .env.local ]; then
    echo "Creating .env.local..."
    cat > .env.local << 'EOF'
DATABASE_URL="file:./prisma/dev.db"
NEXT_PUBLIC_MAPBOX_TOKEN="your_mapbox_token_here"
ADMIN_PASSWORD="change_me_secure_password"
EOF
    echo "⚠️  Please edit .env.local and set MAPBOX_TOKEN and ADMIN_PASSWORD"
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
PORT=8080 pm2 start npm --name "splatica-map" -- start
pm2 save
pm2 startup

echo "=== Setup Complete ==="
echo "Application running on port 8080"
pm2 status

