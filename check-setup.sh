#!/bin/bash
echo "🔍 Проверка окружения..."
echo ""

# Проверка Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js установлен: $NODE_VERSION"
else
    echo "❌ Node.js не установлен"
    echo "   Установите Node.js: https://nodejs.org/"
    exit 1
fi

# Проверка npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "✅ npm установлен: $NPM_VERSION"
else
    echo "❌ npm не установлен"
    exit 1
fi

# Проверка .env.local
if [ -f ".env.local" ]; then
    echo "✅ Файл .env.local существует"
    
    # Проверка MAPBOX_TOKEN
    if grep -q "pk\." .env.local 2>/dev/null; then
        echo "✅ MAPBOX_TOKEN настроен"
    else
        echo "⚠️  MAPBOX_TOKEN не настроен (используется placeholder)"
    fi
    
    # Проверка ADMIN_PASSWORD
    if grep -q "change_this" .env.local 2>/dev/null; then
        echo "⚠️  ADMIN_PASSWORD не изменен (используется placeholder)"
    else
        echo "✅ ADMIN_PASSWORD настроен"
    fi
else
    echo "❌ Файл .env.local не найден"
    echo "   Создайте его на основе .env.example"
    exit 1
fi

# Проверка node_modules
if [ -d "node_modules" ]; then
    echo "✅ Зависимости установлены"
else
    echo "⚠️  Зависимости не установлены"
    echo "   Выполните: npm install"
fi

# Проверка базы данных
if [ -f "dev.db" ] || [ -f "prisma/dev.db" ]; then
    echo "✅ База данных создана"
else
    echo "⚠️  База данных не создана"
    echo "   Выполните: npx prisma generate && npx prisma db push"
fi

echo ""
echo "✨ Проверка завершена!"
