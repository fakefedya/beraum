import { cn } from "@/src/lib/utils";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export const Main = ({ children }: Props) => {
  return (
    <main
      className={cn(
        "flex h-full min-h-dvh w-full flex-1 flex-col gap-20",
        "md:gap-30",
      )}
    >
      {children}
    </main>
  );
};
