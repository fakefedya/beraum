import { CalendarClock, LucideProps } from "lucide-react";

type ScheduleInfoProps = {
  icon: React.FC<LucideProps>;
  description: string;
  days: string;
  hours: string;
  timezone: string;
};

type ScheduleProps = {
  isEnabled: boolean;
  information: ScheduleInfoProps;
};

export const WORK_SCHEDULE_INFO: ScheduleProps = {
  isEnabled: true,
  information: {
    icon: CalendarClock,
    description: "График работы службы поддержки",
    days: "ПН‑ПТ",
    hours: "10:00‑19:00",
    timezone: "МСК",
  },
} as const;
