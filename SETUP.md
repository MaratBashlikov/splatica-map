# Инструкция по установке и запуску

## Шаг 1: Установка Node.js

Если Node.js не установлен, установите его одним из способов:

### Вариант A: Через Homebrew (рекомендуется для macOS)
```bash
brew install node
```

### Вариант B: Скачать с официального сайта
1. Перейдите на https://nodejs.org/
2. Скачайте LTS версию
3. Установите установщик

### Вариант C: Через nvm (Node Version Manager)
```bash
# Установите nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Перезапустите терминал или выполните:
source ~/.zshrc

# Установите Node.js
nvm install --lts
nvm use --lts
```

Проверьте установку:
```bash
node --version  # Должно показать версию, например v20.x.x
npm --version   # Должно показать версию npm
```

## Шаг 2: Установка зависимостей

```bash
cd /Users/marat/splatica-map
npm install
```

## Шаг 3: Настройка переменных окружения

Отредактируйте файл `.env.local`:

1. **MAPBOX_TOKEN**: 
   - Зарегистрируйтесь на https://www.mapbox.com
   - Перейдите в Account → Access tokens
   - Скопируйте ваш Default Public Token
   - Вставьте в `.env.local` вместо `pk.your_mapbox_token_here`

2. **ADMIN_PASSWORD**:
   - Замените `change_this_to_a_secure_password` на ваш пароль для админ-панели

Пример `.env.local`:
```env
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_MAPBOX_TOKEN="pk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6ImN..."
ADMIN_PASSWORD="my_secure_password_123"
```

## Шаг 4: Настройка базы данных

```bash
# Сгенерировать Prisma Client
npx prisma generate

# Создать базу данных и применить схему
npx prisma db push
```

## Шаг 5: Запуск проекта

### Режим разработки:
```bash
npm run dev
```

Откройте браузер и перейдите на http://localhost:3000

### Production сборка:
```bash
npm run build
npm start
```

## Полезные команды

- **Просмотр базы данных**: `npm run db:studio` (откроет Prisma Studio)
- **Линтинг**: `npm run lint`
- **Регенерация Prisma Client**: `npm run db:generate`

## Структура проекта

- `/app` - страницы и API routes Next.js
- `/components` - React компоненты
- `/lib` - утилиты и конфигурация
- `/prisma` - схема базы данных
- `/hooks` - React hooks
- `/types` - TypeScript типы

## Доступ к админ-панели

1. Откройте http://localhost:3000/admin/login
2. Введите пароль из `.env.local` (ADMIN_PASSWORD)
3. После входа вы сможете добавлять, редактировать и удалять сцены

## Решение проблем

### Ошибка "MAPBOX_TOKEN is not set"
- Убедитесь, что `.env.local` существует и содержит `NEXT_PUBLIC_MAPBOX_TOKEN`
- Перезапустите dev сервер после изменения `.env.local`

### Ошибка базы данных
- Убедитесь, что выполнили `npx prisma generate` и `npx prisma db push`
- Проверьте, что файл `dev.db` создан в корне проекта

### Порт 3000 занят
- Измените порт: `npm run dev -- -p 3001`
- Или остановите процесс, использующий порт 3000

