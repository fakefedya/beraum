import { cn } from "@/src/lib/utils";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  isWide?: boolean;
  className?: string;
}

export const Container = ({
  children,
  className,
  isWide = false,
  ...props
}: Props) => {
  return (
    <div
      className={cn(
        "mx-auto flex w-full flex-col px-4",
        className,
        isWide ? "max-w-full" : "max-w-360",
      )}
      {...props}
    >
      {children}
    </div>
  );
};
