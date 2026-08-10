import { Factory, LucideProps, ShieldCheck, Users } from "lucide-react";

type StatsProps = {
  value: string;
  label: string;
  icon: React.FC<LucideProps>;
};

type DescProps = {
  title: string;
  desc: string;
};

type DescImageProps = DescProps & {
  image: string;
};

export const ABOUT_STATS: StatsProps[] = [
  {
    value: "275 000+",
    label: "Довольных клиентов на маркетплейсах",
    icon: Users,
  },
  {
    value: "OEM/ODM",
    label: "Сборка на передовых заводах Китая и Турции",
    icon: Factory,
  },
  { value: "ЕАС", label: "Полная официальная сертификация", icon: ShieldCheck },
] as const;

export const QUALITY_CONTROLS: DescProps[] = [
  {
    title: "Аудит производственных линий",
    desc: "Мы работаем только с фабриками, сертифицированными по ISO. Единая компонентная база с топовыми брендами гарантирует надежность узлов.",
  },
  {
    title: "Стресс-тестирование (QC)",
    desc: "Каждая партия проходит проверку устойчивости к перепадам напряжения, тест ресурса кнопок и стойкости эмали к агрессивной среде.",
  },
] as const;

export const TRUST_TECHNOLOGIES: DescImageProps[] = [
  {
    title: "Автоматизация сборки",
    desc: "Роботизированный процесс производства.",
    image: "/system-assets/pages/about/qc-section-1.jpg",
  },
  {
    title: "Центр контроля качества",
    desc: "Многоступенчатый контроль качества на всех этапах.",
    image: "/system-assets/pages/about/qc-section-2.jpg",
  },
  {
    title: "Отлаженная логистика",
    desc: "Прямые отгрузки на склады маркетплейсов.",
    image: "/system-assets/pages/about/qc-section-3.jpg",
  },
] as const;
