import { cn } from "@/src/lib/utils";

interface Props {
  children: React.ReactNode;
  isWide?: boolean;
  className?: string;
}

export const Container = ({ children, className, isWide = false }: Props) => {
  return (
    <div
      className={cn(
        "mx-auto flex w-full flex-col",
        className,
        isWide ? "max-w-full" : "max-w-7xl",
      )}
    >
      {children}
    </div>
  );
};
