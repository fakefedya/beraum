import { z } from 'zod'

const envSchema = z.object({
	// База данных
	DATABASE_URL: z.string().url('DATABASE_URL должна быть валидным URL-адресом'),

	// Auth.js
	AUTH_SECRET: z
		.string()
		.min(15, 'AUTH_SECRET слишком короткий для обеспечения безопасности'),

	// MinIO
	MINIO_ENDPOINT: z.string().default('localhost'),
	MINIO_PORT: z.string().transform((val) => parseInt(val, 10)),
	MINIO_ACCESS_KEY: z.string().min(1),
	MINIO_SECRET_KEY: z.string().min(1),

	// Маркетплейсы
	OZON_CLIENT_ID: z.string().min(1),
	OZON_API_KEY: z.string().min(1),

	// Публичные (валидируем и их)
	NEXT_PUBLIC_APP_URL: z.string().url(),
})

// Безопасный парсинг process.env
const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
	console.error('❌ КРИТИЧЕСКАЯ ОШИБКА КОНФИГУРАЦИИ ОКРУЖЕНИЯ:')
	console.error(JSON.stringify(parsed.error.format(), null, 2))
	throw new Error('Невалидные переменные окружения')
}

export const env = parsed.data
