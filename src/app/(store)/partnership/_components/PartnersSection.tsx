import { Container } from "@/src/components/shared/Container";
import { Section } from "@/src/components/shared/Section";
import { buildImageUrl, cn } from "@/src/lib/utils";
import { PARTNERS_OFFER } from "@/src/app/(store)/partnership/_components/data";
import { SafeImage } from "@/src/components/shared/SafeImage";

export const PartnersSection = () => {
  return (
    <Section>
      <Container maxWidth="5xl">
        <div className={cn("grid grid-cols-1 gap-8", "md:grid-cols-2")}>
          {PARTNERS_OFFER.map((el, idx) => (
            <div key={idx} className={cn("bg-card -z-1 rounded-4xl")}>
              <div
                className={cn(
                  "relative flex aspect-3/2 items-end overflow-hidden rounded-4xl",
                  "md:col-span-3 lg:p-16",
                )}
              >
                <SafeImage
                  src={buildImageUrl(el.image)}
                  alt="Фабрика"
                  fill
                  className="-z-10 object-cover"
                />
              </div>
              <div className="flex flex-col gap-2 p-8">
                <h3 className="text-xl font-medium">{el.title}</h3>
                <p className="text-muted-foreground text-base">
                  {el.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
};
