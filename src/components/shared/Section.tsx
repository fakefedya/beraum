import { cn } from "@/src/lib/utils";

type Props = {
  children: React.ReactNode;
  className?: string;
};

export const Section = ({ children, className }: Props) => {
  return (
    <section className={cn(className, "flex w-full flex-col")}>
      {children}
    </section>
  );
};
