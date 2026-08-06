import { Container } from "@/src/components/shared/Container";
import { Section } from "@/src/components/shared/Section";
import { ABOUT_STATS } from "@/src/app/(store)/about/_components/data";
import { cn } from "@/src/lib/utils";

export const Statistics = () => {
  return (
    <Section>
      <Container>
        <div
          className={cn(
            "mx-auto grid w-full max-w-5xl grid-cols-1 gap-4",
            "md:grid-cols-3",
          )}
        >
          {ABOUT_STATS.map((el, i) => (
            <div
              className="bg-card flex flex-col gap-4 rounded-3xl p-8"
              key={i}
            >
              <span>{el.value}</span>
              <span>{el.label}</span>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
};
