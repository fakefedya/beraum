import { AlertCircle } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface FloatingFieldProps {
  name: string;
  label: string;
  type?: string;
  error?: string;
  disabled?: boolean;
  isTextarea?: boolean;
  onChange?: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
}

export const FloatingField = ({
  name,
  label,
  type = "text",
  error,
  disabled,
  isTextarea = false,
  onChange,
}: FloatingFieldProps) => {
  const commonClasses = cn(
    "peer w-full rounded-xl border bg-transparent px-4 pt-6 pb-2 text-base text-foreground outline-none",
    "border-ring/50 focus:border-brand-secondary focus:ring-1 focus:ring-brand-secondary",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "transition-all duration-200",
    error &&
      " bg-[#fff2f4] border-red-500 focus:border-red-500 focus:ring-red-500",
  );

  const labelClasses = cn(
    "absolute left-4 top-4 z-10 origin-[0] -translate-y-2.5 scale-[0.8] transform text-muted-foreground transition-all duration-200 pointer-events-none",
    "peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100",
    "peer-focus:-translate-y-2.5 peer-focus:scale-[0.8] peer-focus:text-brand-secondary-muted",
    error && "text-red-500 peer-focus:text-red-500",
  );

  return (
    <div className="flex w-full flex-col gap-1.5">
      <div className="relative w-full">
        {isTextarea ? (
          <textarea
            id={name}
            name={name}
            placeholder=" "
            disabled={disabled}
            onChange={onChange}
            rows={4}
            className={cn(commonClasses, "resize-none")}
            aria-invalid={!!error}
          />
        ) : (
          <input
            id={name}
            name={name}
            type={type}
            placeholder=" "
            disabled={disabled}
            onChange={onChange}
            className={cn(commonClasses, "h-14")}
            aria-invalid={!!error}
          />
        )}
        <label htmlFor={name} className={labelClasses}>
          {label}
        </label>
      </div>

      <div
        className={cn(
          "items-top flex gap-1.5 px-1 text-xs font-medium text-red-500 opacity-0 transition-opacity duration-300",
          error && "opacity-100",
        )}
      >
        {error && (
          <>
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </>
        )}
      </div>
    </div>
  );
};
