import { cn } from "@/src/lib/utils";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  isWide?: boolean;
  className?: string;
  maxWidth?: "5xl" | "7xl" | "360";
}

export const Container = ({
  children,
  className,
  isWide = false,
  maxWidth = "360",
  ...props
}: Props) => {
  return (
    <div
      className={cn(
        "mx-auto flex w-full flex-col px-4",
        isWide ? "max-w-full" : `max-w-${maxWidth}`,
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};
