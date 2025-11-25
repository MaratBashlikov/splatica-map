# Splatica Map

Интерактивная карта для отображения 3D сцен из Splatica. Веб-сервис с красивой картой, на которой отображаются сцены с возможностью просмотра через встроенный viewer.

## Технологии

- **Frontend**: Next.js 14 (App Router), TypeScript, React
- **UI**: Tailwind CSS
- **Карта**: Mapbox GL JS
- **Backend**: Next.js API Routes
- **База данных**: SQLite через Prisma

## Установка и запуск

> **Важно**: Если Node.js не установлен, сначала выполните шаги из [SETUP.md](./SETUP.md)

### 1. Установка зависимостей

```bash
npm install
```

### 2. Настройка переменных окружения

Создайте файл `.env.local` в корне проекта:

```env
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_MAPBOX_TOKEN="your_mapbox_token_here"
ADMIN_PASSWORD="your_secure_password_here"
```

**Где взять токен Mapbox:**
1. Зарегистрируйтесь на [mapbox.com](https://www.mapbox.com)
2. Перейдите в Account → Access tokens
3. Скопируйте ваш Default Public Token или создайте новый

### 3. Настройка базы данных

Сгенерируйте Prisma Client и создайте базу данных:

```bash
npx prisma generate
npx prisma db push
```

### 4. Запуск в режиме разработки

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) в браузере.

### 5. Запуск в production

```bash
npm run build
npm start
```

## Использование

### Главная страница

Главная страница (`/`) отображает интерактивную карту со всеми добавленными сценами:
- Клик по маркеру открывает боковую панель с информацией о сцене
- Кнопка "Open in Viewer" открывает сцену в новом окне или iframe
- Кнопка "Reset View" возвращает карту к виду по умолчанию

### Админ-панель

Доступ к админ-панели: `/admin`

**Вход:**
1. Перейдите на `/admin/login`
2. Введите пароль из переменной окружения `ADMIN_PASSWORD`

**Управление сценами:**
- **Список сцен** (`/admin`): просмотр всех сцен, редактирование и удаление
- **Добавление сцены** (`/admin/new`): форма для создания новой сцены
- **Редактирование** (`/admin/[id]/edit`): редактирование существующей сцены

**Поля сцены:**
- **Title** (обязательно): название сцены
- **Description** (опционально): описание
- **Splatica URL** (обязательно): ссылка вида `https://app.splatica.com/viewer/2424b5ce`
- **Thumbnail URL** (опционально): ссылка на превью изображение
- **Coordinates** (обязательно): широта и долгота (можно выбрать на карте)

## Структура проекта

```
├── app/
│   ├── api/              # API endpoints
│   │   ├── scenes/       # CRUD для сцен
│   │   └── auth/         # Авторизация
│   ├── admin/            # Админ-панель
│   │   ├── login/        # Страница входа
│   │   ├── new/          # Создание сцены
│   │   └── [id]/edit/    # Редактирование сцены
│   ├── page.tsx          # Главная страница с картой
│   └── layout.tsx        # Корневой layout
├── components/           # React компоненты
│   ├── Map.tsx           # Компонент карты
│   ├── SceneSidebar.tsx  # Боковая панель сцены
│   ├── SceneViewerModal.tsx # Модальное окно viewer
│   └── MapPicker.tsx     # Выбор координат на карте
├── hooks/                # React hooks
│   └── useScenes.ts      # Загрузка сцен
├── lib/                  # Утилиты
│   ├── prisma.ts         # Prisma client
│   ├── auth.ts           # Функции авторизации
│   └── scene-utils.ts    # Утилиты для работы со сценами
├── prisma/
│   └── schema.prisma     # Схема базы данных
└── types/
    └── scene.ts          # TypeScript типы
```

## API Endpoints

### Сцены

- `GET /api/scenes` - получить все сцены
- `GET /api/scenes/[id]` - получить одну сцену
- `POST /api/scenes` - создать сцену (требует авторизации)
- `PUT /api/scenes/[id]` - обновить сцену (требует авторизации)
- `DELETE /api/scenes/[id]` - удалить сцену (требует авторизации)

### Авторизация

- `POST /api/auth/login` - войти (требует `password` в body)
- `POST /api/auth/logout` - выйти
- `GET /api/auth/check` - проверить статус авторизации

## База данных

Модель `Scene`:
- `id` - уникальный идентификатор
- `title` - название
- `description` - описание (опционально)
- `splaticaUrl` - полный URL сцены
- `sceneSlug` - извлеченный slug из URL
- `lat` - широта
- `lng` - долгота
- `thumbnailUrl` - URL превью (опционально)
- `createdAt` - дата создания
- `updatedAt` - дата обновления

### Работа с базой данных

**Просмотр данных:**
```bash
npx prisma studio
```

**Сброс базы данных:**
```bash
rm prisma/dev.db
npx prisma db push
```

## Разработка

### Добавление новых функций

1. Компоненты карты находятся в `components/Map.tsx`
2. API endpoints в `app/api/`
3. Стили настраиваются через Tailwind CSS в `tailwind.config.ts`

### Отладка

- Логи сервера отображаются в консоли терминала
- Логи клиента в консоли браузера
- Prisma Studio для просмотра данных: `npm run db:studio`

## Безопасность

- Пароль администратора хранится в переменных окружения
- Сессия администратора хранится в HTTP-only cookie
- API endpoints для изменения данных защищены проверкой авторизации
- В production используйте `Secure` флаг для cookies (настроено автоматически)

## Лицензия

MIT

