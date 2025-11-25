# Установка Node.js на macOS

## Вариант 1: Установка через Homebrew (рекомендуется)

### Шаг 1: Установите Homebrew

Откройте терминал и выполните:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Следуйте инструкциям на экране. Вам может потребоваться ввести пароль администратора.

После установки Homebrew, добавьте его в PATH (если потребуется):

```bash
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```

### Шаг 2: Установите Node.js

```bash
brew install node
```

### Шаг 3: Проверьте установку

```bash
node --version
npm --version
```

---

## Вариант 2: Установка через официальный установщик

1. Перейдите на https://nodejs.org/
2. Скачайте **LTS версию** (рекомендуется)
3. Запустите установщик `.pkg`
4. Следуйте инструкциям мастера установки
5. Проверьте установку:

```bash
node --version
npm --version
```

---

## Вариант 3: Установка через nvm (Node Version Manager)

### Шаг 1: Установите nvm

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
```

### Шаг 2: Перезагрузите терминал или выполните:

```bash
source ~/.zshrc
# или
source ~/.bash_profile
```

### Шаг 3: Установите Node.js LTS

```bash
nvm install --lts
nvm use --lts
```

### Шаг 4: Проверьте установку

```bash
node --version
npm --version
```

---

## После установки Node.js

После успешной установки Node.js выполните следующие команды в директории проекта:

```bash
cd /Users/marat/splatica-map

# Установите зависимости
npm install

# Настройте базу данных
npx prisma generate
npx prisma db push

# Запустите проект
npm run dev
```

---

## Проверка установки

Выполните скрипт проверки:

```bash
cd /Users/marat/splatica-map
./check-setup.sh
```

Или проверьте вручную:

```bash
node --version  # Должно показать версию, например v20.x.x
npm --version   # Должно показать версию npm, например 10.x.x
```

---

## Решение проблем

### Команда `node` не найдена после установки

1. Перезапустите терминал
2. Проверьте PATH: `echo $PATH`
3. Для Homebrew: добавьте в `~/.zshrc`:
   ```bash
   eval "$(/opt/homebrew/bin/brew shellenv)"
   ```

### Ошибки прав доступа

Если возникают ошибки с правами доступа при установке пакетов:

```bash
# Создайте директорию для глобальных пакетов
mkdir ~/.npm-global

# Настройте npm
npm config set prefix '~/.npm-global'

# Добавьте в PATH (добавьте в ~/.zshrc)
export PATH=~/.npm-global/bin:$PATH
```


