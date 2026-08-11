import { Container } from "@/src/components/shared/Container";
import { Section } from "@/src/components/shared/Section";
import { buildImageUrl, cn } from "@/src/lib/utils";
import { PARTNERS_OFFER } from "@/src/app/(store)/partnership/_components/data";
import { SafeImage } from "@/src/components/shared/SafeImage";

export const OfferSection = () => {
  return (
    <Section>
      <Container maxWidth="5xl">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {PARTNERS_OFFER.map((el, idx) => (
            <div
              key={idx}
              className={cn(
                "bg-card group flex flex-col overflow-hidden rounded-[32px]",
                "hover:border-black-muted border-2 border-transparent transition-colors duration-500",
              )}
            >
              <div className="bg-accent relative aspect-video w-full overflow-hidden border-b border-black/5">
                <SafeImage
                  src={buildImageUrl(el.image)}
                  alt={el.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-102"
                />
              </div>

              <div className="flex flex-col gap-3 p-8">
                <h3 className="text-xl font-medium tracking-tight">
                  {el.title}
                </h3>
                <p className="text-muted-foreground text-base leading-relaxed">
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
