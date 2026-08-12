import { AlertCircle } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface FloatingFieldProps {
  isRequired?: boolean;
  name: string;
  label: string;
  type?: string;
  list?: string;
  error?: string;
  disabled?: boolean;
  isTextarea?: boolean;
  defaultValue?: string;
  onChange?: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
}

export const FloatingField = ({
  isRequired = true,
  name,
  label,
  type = "text",
  list,
  error,
  disabled,
  isTextarea = false,
  defaultValue,
  onChange,
}: FloatingFieldProps) => {
  const commonClasses = cn(
    "peer w-full rounded-xl border bg-transparent px-4 pt-6 pb-2 text-base text-foreground outline-none",
    "border-ring/30 focus:border-brand-secondary focus:ring-1 focus:ring-brand-secondary",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "transition-all duration-200",
    error &&
      "bg-[#fff2f4] border-red-500 focus:border-red-500 focus:ring-red-500",
  );

  const labelClasses = cn(
    "absolute left-4 top-4 z-10 origin-[0] -translate-y-2.5 scale-[0.8] transform text-muted-foreground transition-all duration-200 pointer-events-none flex gap-0.5",
    "peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100",
    "peer-focus:-translate-y-2.5 peer-focus:scale-[0.8] peer-focus:text-brand-secondary-muted",
    error && "text-red-500 peer-focus:text-red-500",
  );

  return (
    <div
      id={`container-${name}`}
      className="flex w-full scroll-mt-24 flex-col gap-1.5"
    >
      <div className="relative w-full">
        {isTextarea ? (
          <textarea
            id={name}
            name={name}
            placeholder=" "
            disabled={disabled}
            defaultValue={defaultValue}
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
            list={list}
            placeholder=" "
            disabled={disabled}
            defaultValue={defaultValue}
            onChange={onChange}
            className={cn(commonClasses, "h-14")}
            aria-invalid={!!error}
          />
        )}
        <label htmlFor={name} className={labelClasses}>
          {label}
          {isRequired && <span className="text-red-600/60">*</span>}
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
