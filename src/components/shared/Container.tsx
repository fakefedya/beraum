import { cn } from "@/src/lib/utils";

const maxWidthMap = {
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "5xl": "max-w-5xl",
  "7xl": "max-w-7xl",
  "360": "max-w-360",
} as const;

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  isWide?: boolean;
  className?: string;
  maxWidth?: keyof typeof maxWidthMap;
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
        "first:pt-24",
        "md:px-6 md:first:pt-32",
        isWide ? "max-w-full" : maxWidthMap[maxWidth],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};
