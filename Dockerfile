FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* npm-shrinkwrap.json* ./
# Используем ci для строгой фиксации версий, если есть lock-файл
RUN \
  if [ -f package-lock.json ]; then npm ci; \
  else npm install; \
  fi

# Стейдж 2: Сборка
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Публичные переменные (допустимы в билде)
ENV NEXT_PUBLIC_APP_URL=https://beraum.com
ENV NEXT_PUBLIC_STORAGE_URL=https://s3.beraum.com

# Архитектурные флаги для безопасной сборки
ENV SKIP_DB_PREFETCH=1
ENV SKIP_ENV_VALIDATION=1

# Билдим приложение
RUN npm run build

# Стейдж 3: Продакшн образ
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Создаем системного пользователя без прав root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Копируем публичные ассеты
COPY --from=builder /app/public ./public

# Настраиваем права на кэш
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Копируем standalone сборку и статику
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Запускаем server.js, созданный в режиме standalone
CMD ["node", "server.js"]

