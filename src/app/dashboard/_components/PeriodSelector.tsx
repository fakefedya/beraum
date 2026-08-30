"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";

export const PeriodSelector = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const currentPeriod = searchParams.get("period") || "30d";

  const handleChange = (val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("period", val);
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <Select value={currentPeriod} onValueChange={handleChange}>
      <SelectTrigger className="bg-background w-[180px]">
        <SelectValue placeholder="За период" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="7d">За последние 7 дней</SelectItem>
        <SelectItem value="30d">За последние 30 дней</SelectItem>
        <SelectItem value="90d">За последние 3 месяца</SelectItem>
        <SelectItem value="all">За всё время</SelectItem>
      </SelectContent>
    </Select>
  );
};
