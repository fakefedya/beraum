import { Container } from "@/src/components/shared/Container";
import { Section } from "@/src/components/shared/Section";
import { ABOUT_STATS } from "@/src/app/(store)/about/_components/data";
import { cn } from "@/src/lib/utils";

export const StatisticSection = () => {
  return (
    <Section>
      <Container maxWidth="5xl">
        <div
          className={cn(
            "mx-auto grid w-full grid-cols-1 gap-4",
            "md:grid-cols-3",
          )}
        >
          {ABOUT_STATS.map((el, i) => (
            <div
              className="bg-card flex flex-col gap-2 rounded-4xl p-8"
              key={i}
            >
              <el.icon
                className="text-brand-secondary mb-2"
                size={48}
                strokeWidth={1.2}
              />
              <span className="text-3xl font-medium">{el.value}</span>
              <span className="text-muted-foreground">{el.label}</span>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
};
