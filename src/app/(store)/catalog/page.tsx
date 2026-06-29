import { getProducts } from "@/src/server/actions/catalog";

export default async function HomePage() {
  // Вызываем Server Action прямо на сервере при рендеринге страницы!
  const response = await getProducts({ limit: 20 });

  if (!response.success || !response.data) {
    return (
      <div className="flex min-h-screen items-center justify-center font-medium text-red-500">
        Ошибка: {response.error}
      </div>
    );
  }

  const items = response.data;
  console.log(items.length);

  return (
    <main className="container mx-auto px-4 py-12">
      <h1 className="mb-8 text-4xl font-bold">Каталог BRM</h1>

      {/* Сетка товаров */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {items.map((product) => (
          <div
            key={product.id}
            className="flex flex-col rounded-xl border bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            {/* Заглушка для картинки */}
            <div className="mb-4 flex aspect-square items-center justify-center rounded-lg bg-slate-100 text-slate-400">
              [ Изображение ]
            </div>

            {/* Информация */}
            <div className="mb-1 text-xs font-semibold tracking-wider text-blue-600 uppercase">
              {product.categoryTitle}
            </div>
            <h2
              className="mb-2 line-clamp-2 text-lg font-bold"
              title={product.itemArticle}
            >
              {product.itemArticle}
            </h2>

            {/* Специфичный фильтр для наглядности (например, цвет) */}
            {product.filters?.itemColor && (
              <p className="mb-4 text-sm text-slate-500">
                Цвет: {String(product.filters.itemColor)}
              </p>
            )}

            {/* Подвал карточки с ценой */}
            <div className="mt-auto flex items-center justify-between">
              <div className="text-xl font-extrabold">
                {product.price > 0
                  ? `${product.price.toLocaleString("ru-RU")} ₽`
                  : "Цена по запросу"}
              </div>
              <div
                className={`rounded-full px-2 py-1 text-xs font-medium ${product.stock > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
              >
                {product.stock > 0
                  ? `В наличии: ${product.stock}`
                  : "Под заказ"}
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
