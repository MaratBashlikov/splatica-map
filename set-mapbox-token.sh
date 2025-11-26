#!/bin/bash
if [ -z "$1" ]; then
  echo "Usage: ./set-mapbox-token.sh YOUR_MAPBOX_TOKEN"
  echo "Get your token from: https://account.mapbox.com/access-tokens/"
  exit 1
fi

TOKEN="$1"
sed -i "s|NEXT_PUBLIC_MAPBOX_TOKEN=\".*\"|NEXT_PUBLIC_MAPBOX_TOKEN=\"$TOKEN\"|" .env.local

echo "Token updated in .env.local"
echo "Rebuilding application..."

pm2 stop splatica-map
npm run build
export $(grep -v '^#' .env.local | xargs) && PORT=8080 pm2 start npm --name splatica-map -- start
pm2 save

echo "Application rebuilt and restarted!"

