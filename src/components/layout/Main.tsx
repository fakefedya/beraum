import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export const Main = ({ children }: Props) => {
  return <main className="flex h-full w-full flex-col">{children}</main>;
};
