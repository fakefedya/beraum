import { getProducts } from '@/src/server/actions/catalog'

export default async function HomePage() {
	// Вызываем Server Action прямо на сервере при рендеринге страницы!
	const response = await getProducts({ limit: 20 })

	if (!response.success || !response.data) {
		return (
			<div className='flex items-center justify-center min-h-screen text-red-500 font-medium'>
				Ошибка: {response.error}
			</div>
		)
	}

	const items = response.data
	console.log(items.length)

	return (
		<main className='container mx-auto px-4 py-12'>
			<h1 className='text-4xl font-bold mb-8'>Каталог BRM</h1>

			{/* Сетка товаров */}
			<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
				{items.map((product) => (
					<div
						key={product.id}
						className='border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow bg-white flex flex-col'
					>
						{/* Заглушка для картинки */}
						<div className='aspect-square bg-slate-100 rounded-lg mb-4 flex items-center justify-center text-slate-400'>
							[ Изображение ]
						</div>

						{/* Информация */}
						<div className='text-xs text-blue-600 font-semibold mb-1 uppercase tracking-wider'>
							{product.categoryTitle}
						</div>
						<h2
							className='font-bold text-lg mb-2 line-clamp-2'
							title={product.itemArticle}
						>
							{product.itemArticle}
						</h2>

						{/* Специфичный фильтр для наглядности (например, цвет) */}
						{product.filters?.itemColor && (
							<p className='text-sm text-slate-500 mb-4'>
								Цвет: {String(product.filters.itemColor)}
							</p>
						)}

						{/* Подвал карточки с ценой */}
						<div className='mt-auto flex items-center justify-between'>
							<div className='text-xl font-extrabold'>
								{product.price > 0
									? `${product.price.toLocaleString('ru-RU')} ₽`
									: 'Цена по запросу'}
							</div>
							<div
								className={`text-xs font-medium px-2 py-1 rounded-full ${product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
							>
								{product.stock > 0
									? `В наличии: ${product.stock}`
									: 'Под заказ'}
							</div>
						</div>
					</div>
				))}
			</div>
		</main>
	)
}
