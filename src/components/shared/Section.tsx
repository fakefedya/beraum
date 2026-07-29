type Props = {
  children: React.ReactNode;
};

export const Section = ({ children }: Props) => {
  return <section className="mb-30 flex w-full flex-col">{children}</section>;
};
