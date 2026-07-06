type Props = {
  children: React.ReactNode;
};

export const Section = ({ children }: Props) => {
  return <section className="mb-15 flex w-full flex-col">{children}</section>;
};
