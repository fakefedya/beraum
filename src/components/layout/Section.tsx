type Props = {
  children: React.ReactNode;
};

export const Section = ({ children }: Props) => {
  return <section className="flex w-full flex-col">{children}</section>;
};
