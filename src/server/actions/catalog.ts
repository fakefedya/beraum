'use server'

import { eq, desc, sql } from 'drizzle-orm'
import { db } from '@/src/server/db/client'
import { products, categories, productMedia } from '@/src/server/db/schema'

// Типизация аргументов функции для защиты от мусорных параметров
interface GetProductsArgs {
	limit?: number
	offset?: number
	categorySlug?: string
}

export async function getProducts({
	offset = 0,
	categorySlug,
}: GetProductsArgs = {}) {
	try {
		// Формируем базовый запрос
		const query = db
			.select({
				id: products.id,
				itemArticle: products.itemArticle,
				status: products.status,
				isLatest: products.isLatest,
				// SQL-выражение: если задана ручная цена, берем ее, иначе базовую
				price:
					sql<number>`COALESCE(${products.manualPrice}, ${products.basePrice})`.as(
						'price',
					),
				// Аналогично для стоков
				stock:
					sql<number>`COALESCE(${products.manualStock}, ${products.baseStock})`.as(
						'stock',
					),

				categorySlug: categories.slug,
				categoryTitle: categories.titleRu,

				// Вытягиваем только нужные фильтры (например, тип и цвет) для превью в карточке
				filters: products.filters,
			})
			.from(products)
			.leftJoin(categories, eq(products.categoryId, categories.id))
			// Показываем только опубликованные товары
			.where(eq(products.status, 'published'))
			.orderBy(desc(products.createdAt))
			// .limit(limit)
			.offset(offset)

		// Выполняем запрос
		const items = await query

		return {
			success: true,
			data: items,
		}
	} catch (error) {
		console.error('❌ Ошибка Server Action (getProducts):', error)
		return {
			success: false,
			error: 'Ошибка при загрузке каталога',
		}
	}
}
