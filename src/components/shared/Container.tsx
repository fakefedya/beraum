import { cn } from "@/src/lib/utils";

const maxWidthMap = {
  "5xl": "max-w-5xl",
  "7xl": "max-w-7xl",
  "360": "max-w-[90rem]",
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
        isWide ? "max-w-full" : maxWidthMap[maxWidth],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};
