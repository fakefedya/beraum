import { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/src/components/shared/Container";
import { Section } from "@/src/components/shared/Section";
import { Breadcrumbs } from "@/src/components/shared/Breadcrumbs";
import { Icons } from "@/src/components/ui/icons";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";
import { HeroSection } from "./_components/Hero";
import { Statistics } from "./_components/Statistics";

export const metadata: Metadata = {
  title: "О бренде Beraum | Честная техника для современного интерьера",
  description:
    "Узнайте правду о производстве Beraum. Честный российский бренд, передовые заводы Китая и фокус на интеграции техники в интерьер.",
};

const breadcrumbItems = [
  { label: "Главная", href: "/" },
  { label: "О бренде" },
];

export default function AboutPage() {
  return (
    <>
      <Section>
        <Container className="pt-32">
          <Breadcrumbs
            items={breadcrumbItems}
            className="flex justify-center"
          />
        </Container>
      </Section>

      <HeroSection />
      <Statistics />

      <Section>
        <Container className="flex flex-col gap-24">
          {/* 2. STATS: Опора на цифры */}
          <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-4 md:grid-cols-3">
            {[
              {
                value: "250 000+",
                label: "Довольных клиентов на маркетплейсах",
              },
              { value: "OEM/ODM", label: "Сборка на топовых фабриках Азии" },
              { value: "ЕАС", label: "Полная официальная сертификация" },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-card flex flex-col items-center rounded-3xl p-8 text-center"
              >
                <span className="text-foreground mb-2 text-4xl font-medium">
                  {stat.value}
                </span>
                <span className="text-muted-foreground">{stat.label}</span>
              </div>
            ))}
          </div>

          {/* 3. ДИЗАЙН КАК ЭКОСИСТЕМА (Интеграция факта о студии дизайна) */}
          <div className="bg-card hover:border-brand mx-auto flex w-full max-w-5xl flex-col overflow-hidden rounded-[32px] border-2 border-transparent transition-colors duration-500 lg:flex-row">
            <div className="flex flex-col justify-center gap-6 p-10 lg:w-1/2 lg:p-16">
              <h2 className="text-3xl font-medium lg:text-4xl">
                Техника, которая понимает интерьер
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Для нас варочная панель или вытяжка — это не просто утилитарный
                прибор, а полноправный элемент архитектуры кухни. Наше внимание
                к интеграции техники в пространство зашло так далеко, что мы
                открыли собственную студию дизайна интерьеров. Мы на практике
                знаем, как важны матовые фактуры, геометрия линий и правильные
                зазоры.
              </p>
              <Button asChild className="mt-4 h-12 w-fit rounded-[16px] px-8">
                {/* Использование внешней ссылки с защитой noopener noreferrer */}
                <a
                  href="https://design.beraum.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Перейти в студию дизайна
                </a>
              </Button>
            </div>
            <div className="bg-muted relative min-h-[300px] lg:min-h-full lg:w-1/2">
              {/* TODO: Заменить на реальную фотографию красивого интерьера со встроенной техникой Beraum */}
              <div className="text-muted-foreground bg-accent absolute inset-0 flex items-center justify-center">
                [ Изображение премиального интерьера ]
              </div>
            </div>
          </div>

          {/* 4. БЕНТО-ГРИД: Технологии доверия (Интеграция со слайдом маркетплейсов) */}
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-12">
            <h2 className="text-center text-3xl font-medium tracking-tight lg:text-5xl">
              Технологии доверия
            </h2>

            <div className="grid auto-rows-[minmax(250px,auto)] grid-cols-1 gap-6 md:grid-cols-3">
              {/* Главный блок: Фабрика */}
              <div className="group hover:border-black-muted relative flex min-h-[350px] items-end overflow-hidden rounded-3xl border-2 border-transparent p-6 transition-colors duration-500 md:col-span-3 lg:p-10">
                {/* 
                  TODO: Заменить div на <Image /> из next/image
                  <Image src="укажи_путь_к_фото_фабрики" alt="Фабрика" fill className="object-cover -z-10 group-hover:scale-105 transition-transform duration-700" /> 
                */}
                <div className="bg-accent absolute inset-0 -z-20" />{" "}
                {/* Заглушка фона */}
                <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="relative z-10 max-w-3xl text-white">
                  <h3 className="mb-3 text-2xl font-medium lg:text-3xl">
                    Глобальное производство
                  </h3>
                  <p className="text-base leading-relaxed text-white/80 lg:text-lg">
                    Мы выпускаем продукцию на крупнейшей в мире фабрике бытовой
                    кухонной техники. Использование единой компонентной базы с
                    лидерами индустрии позволяет нам быть абсолютно уверенными в
                    качестве каждого устройства.
                  </p>
                </div>
              </div>

              {/* Малые блоки */}
              {[
                {
                  title: "Автоматизированная сборка",
                  desc: "Исключение человеческого фактора. Высокоточные роботизированные линии гарантируют идеальную подгонку деталей и отсутствие люфтов.",
                },
                {
                  title: "Центр контроля качества",
                  desc: "Строгий QC на каждом этапе. Проверка устойчивости к перепадам напряжения, ресурсные испытания электроники и стресс-тесты материалов.",
                },
                {
                  title: "Отлаженная логистика",
                  desc: "Собственные распределительные центры и прямые отгрузки на маркетплейсы обеспечивают сохранность техники и быструю доставку.",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="bg-background border-border hover:border-black-muted group relative flex flex-col gap-4 overflow-hidden rounded-3xl border p-8 transition-colors duration-300"
                >
                  {/* 
                    TODO: Сюда можно добавить фоном те самые вертикальные фото со слайда с opacity-10 или разместить их сверху
                  */}
                  <div className="bg-brand/20 text-brand-muted flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-xl font-medium">
                    {idx + 1}
                  </div>
                  <div className="relative z-10 flex flex-col gap-2">
                    <h3 className="text-xl leading-tight font-medium">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 5. БЛОК ГАРАНТИИ: Снятие финальных рисков */}
          <div className="bg-foreground text-background mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-12 rounded-[32px] p-10 lg:flex-row lg:p-16">
            <div className="flex flex-col gap-6 text-center lg:w-2/3 lg:text-left">
              <Icons.logo className="mx-auto h-8 w-auto fill-current lg:mx-0" />
              <h2 className="text-3xl font-medium lg:text-4xl">
                Поддержка без бюрократии
              </h2>
              <p className="text-background/80 text-lg leading-relaxed">
                Прямые продажи означают прямую ответственность. У нас нет
                сложной цепи дистрибьюторов, перекидывающих вину друг на друга.
                На всю технику действует официальная гарантия 12 месяцев.
                Собственный сервисный центр и склад запчастей в РФ позволяют
                решать вопросы напрямую и в кратчайшие сроки.
              </p>
              <div className="mt-2 flex flex-wrap justify-center gap-4 lg:justify-start">
                <Button
                  asChild
                  variant="outline"
                  className="text-background border-background/20 hover:bg-background hover:text-foreground h-12 rounded-[16px] bg-transparent px-8"
                >
                  <Link href="/service">Условия гарантии</Link>
                </Button>
                <Button
                  asChild
                  className="bg-brand text-foreground hover:bg-brand-hover h-12 rounded-[16px] px-8"
                >
                  <Link href="/support">Служба поддержки</Link>
                </Button>
              </div>
            </div>

            <div className="flex justify-center lg:w-1/3">
              <div className="border-brand/20 relative flex h-48 w-48 flex-col items-center justify-center rounded-full border-4 p-6 text-center">
                <div className="border-brand absolute inset-0 animate-spin rounded-full border-4 border-t-transparent [animation-duration:10s]" />
                <span className="text-brand text-5xl font-medium">1</span>
                <span className="mt-1 text-sm font-medium tracking-widest uppercase">
                  Год
                  <br />
                  Гарантии
                </span>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
