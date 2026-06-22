import fs from 'node:fs'
import path from 'node:path'
import { db } from './client'
import { categories, products } from './schema'

async function main() {
	console.log('🌱 Начинаем сидирование базы данных...')

	// 1. Читаем JSON файл
	const dataPath = path.resolve(process.cwd(), 'dataExample.json')
	if (!fs.existsSync(dataPath)) {
		throw new Error('❌ Файл dataExample.json не найден в корне проекта!')
	}

	const rawData = fs.readFileSync(dataPath, 'utf-8')
	const items = JSON.parse(rawData)

	console.log(`📦 Найдено товаров в JSON: ${items.length}`)

	// 2. Извлекаем и создаем уникальные категории
	const uniqueCategories = new Map<string, string>()
	for (const item of items) {
		if (item.itemCategory && !uniqueCategories.has(item.itemCategory)) {
			uniqueCategories.set(item.itemCategory, item.itemCategoryRu)
		}
	}

	console.log(`📂 Найдено уникальных категорий: ${uniqueCategories.size}`)

	// Записываем категории в БД и сохраняем их UUID для связей
	const categoryMap = new Map<string, string>()
	for (const [slug, titleRu] of uniqueCategories.entries()) {
		const [inserted] = await db
			.insert(categories)
			.values({
				slug,
				titleRu,
			})
			.returning({ id: categories.id })

		categoryMap.set(slug, inserted.id)
	}

	// 3. Подготавливаем массив товаров для вставки
	const productsToInsert = items.map((item: any) => {
		// Безопасно извлекаем спецификации и фильтры (берем первый элемент из массива)
		const spec = item.itemSpecification?.[0] || {}
		const filters = item.itemFilters?.[0] || {}

		// Вытаскиваем вес из JSONB-спецификаций в строгую int-колонку, если он там есть
		const weightString = spec['Вес, г']
		const weightNetto = weightString
			? parseInt(String(weightString).replace(/\D/g, ''), 10)
			: null

		// Определяем статус товара
		let status: 'draft' | 'published' | 'archived' = 'draft'
		if (item.itemArchive === 'Да') {
			status = 'archived'
		} else if (item.isDisplayed) {
			status = 'published'
		}

		return {
			categoryId: categoryMap.get(item.itemCategory), // Связь (Foreign Key)
			siteArticle: item.siteArticle,
			itemArticle: item.itemArticle,
			status,
			isLatest: item.itemLatest === 'Да',
			basePrice: item.itemPrice || 0,
			baseStock: item.itemStock || 0,
			manualStock: item.itemStockManual || null, // Если 0 или null — мапится корректно
			ozonLink: item.itemLinks?.[0]?.ozon || null,
			wbLink: item.itemLinks?.[0]?.wildberries || null,
			weightNetto,
			filters,
			specifications: spec,
		}
	})

	// 4. Пакетная вставка (Batch Insert) товаров в базу
	console.log('🚀 Загружаем товары в базу...')
	await db.insert(products).values(productsToInsert)

	console.log('✅ Сидирование успешно завершено!')
	// Принудительно завершаем процесс, так как пул подключений БД может держать его открытым
	process.exit(0)
}

main().catch((err) => {
	console.error('❌ Ошибка при сидировании:', err)
	process.exit(1)
})
