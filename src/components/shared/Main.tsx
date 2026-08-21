import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export const Main = ({ children }: Props) => {
  return (
    <main className="flex h-full min-h-dvh w-full flex-1 flex-col">
      {children}
    </main>
  );
};
