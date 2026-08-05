type StatisticProps = {
  value: string;
  label: string;
};

export const STATISTIC: StatisticProps[] = [
  {
    value: "250 000+",
    label: "Довольных клиентов на маркетплейсах",
  },
  { value: "OEM/ODM", label: "Сборка на топовых фабриках Азии" },
  { value: "ЕАС", label: "Полная официальная сертификация" },
] as const;
