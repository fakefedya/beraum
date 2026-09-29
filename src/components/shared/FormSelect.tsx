"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { AlertCircle } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface Option {
  value: string;
  label: string;
}

interface FormSelectProps {
  name: string;
  label: string;
  options: Option[];
  defaultValue?: string;
  error?: string;
  disabled?: boolean;
}

export const FormSelect = ({
  name,
  label,
  options,
  defaultValue,
  error,
  disabled,
}: FormSelectProps) => {
  return (
    <div className="relative flex w-full flex-col gap-1.5">
      <div className="relative w-full">
        <Select
          name={name}
          defaultValue={defaultValue}
          key={defaultValue || name}
          disabled={disabled}
        >
          <SelectTrigger
            className={cn(
              "text-foreground h-14 w-full rounded-xl border bg-transparent px-4 pt-6 pb-2 text-base shadow-none transition-all duration-200 outline-none",
              "border-ring/30 focus:border-brand-secondary focus:ring-brand-secondary focus:ring-1",
              error &&
                "border-red-500 bg-[#fff2f4] focus:border-red-500 focus:ring-red-500",
            )}
          >
            <SelectValue placeholder={`Выберите ${label.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            {options.map((opt) => (
              <SelectItem
                key={opt.value}
                value={opt.value}
                className="cursor-pointer rounded-lg"
              >
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <label className="text-muted-foreground pointer-events-none absolute top-4 left-4 z-10 flex origin-left -translate-y-2.5 scale-[0.8] gap-0.5 transition-all duration-200">
          {label} <span className="text-red-600/60">*</span>
        </label>
      </div>

      <div
        className={cn(
          "flex items-start gap-1.5 px-1 text-xs font-medium text-red-500 opacity-0 transition-opacity duration-300",
          error && "opacity-100",
        )}
      >
        {error && (
          <>
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>{error}</span>
          </>
        )}
      </div>
    </div>
  );
};
