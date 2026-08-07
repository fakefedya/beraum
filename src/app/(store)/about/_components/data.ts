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

export const TRUST_TECHNOLOGIES: DescProps[] = [
  {
    title: "Автоматизированная сборка",
    desc: "Исключение человеческого фактора. Роботизированные линии гарантируют идеальную подгонку деталей и отсутствие люфтов.",
  },
  {
    title: "Центр контроля качества",
    desc: "Строгий QC на каждом этапе. Проверка устойчивости к перепадам напряжения и стресс-тесты материалов.",
  },
  {
    title: "Отлаженная логистика",
    desc: "Прямые отгрузки на склады маркетплейсов обеспечивают сохранность техники и быструю доставку до вашей двери.",
  },
] as const;
