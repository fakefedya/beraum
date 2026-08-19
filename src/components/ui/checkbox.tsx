"use client";

import * as React from "react";
import { CheckIcon } from "lucide-react";
import { Checkbox as CheckboxPrimitive } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/src/lib/utils";

const checkboxVariants = cva(
  [
    "peer size-5 shrink-0 rounded-md border border-black/15 bg-white  transition-all duration-200 outline-none",
    "focus-visible:ring-[3px] focus-visible:ring-[#007AFF]/30 focus-visible:border-[#007AFF]",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "data-[state=checked]:border-brand-secondary data-[state=checked]:bg-brand data-[state=checked]:text-foreground",
    "dark:border-white/20 dark:bg-black/50 dark:data-[state=checked]:bg-[#0A84FF] dark:data-[state=checked]:border-[#0A84FF]",
  ].join(" "),
);

export interface CheckboxProps
  extends
    React.ComponentProps<typeof CheckboxPrimitive.Root>,
    VariantProps<typeof checkboxVariants> {}

function Checkbox({ className, ...props }: CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(checkboxVariants({ className }))}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="animate-in zoom-in-50 flex items-center justify-center text-current duration-200"
      >
        <CheckIcon className="size-3.5 stroke-3" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox, checkboxVariants };
