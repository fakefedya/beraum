import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Container } from "@/src/components/shared/Container";
import { Section } from "@/src/components/shared/Section";
import { Breadcrumbs } from "@/src/components/shared/Breadcrumbs";
import { cn } from "@/src/lib/utils";
import { FOOTER_LINKS } from "@/src/lib/constants/navigation";
import { getPolicyData } from "./_components/data";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return FOOTER_LINKS.map((link) => {
    const slug = link.href.split("/").pop() || "";
    return { slug };
  });
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const policy = getPolicyData(slug);

  if (!policy) return {};

  return {
    title: `${policy.title} | Beraum`,
    description: `Официальная информация: ${policy.title.toLowerCase()}`,
  };
}

export default async function PolicyPage({ params }: PageProps) {
  const { slug } = await params;

  const policy = getPolicyData(slug);

  if (!policy) {
    notFound();
  }

  const breadcrumbItems = [
    { label: "Главная", href: "/" },
    { label: policy.title },
  ];

  return (
    <>
      <Section>
        <Container className={cn("pt-24", "md:pt-32")}>
          <Breadcrumbs
            items={breadcrumbItems}
            className="flex justify-center"
          />
        </Container>
      </Section>

      <Section>
        <Container maxWidth="3xl">
          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-4 text-center">
              <h1 className="text-foreground text-3xl font-semibold tracking-tight md:text-4xl">
                {policy.title}
              </h1>
              <p className="text-muted-foreground text-sm">
                Последнее обновление: {policy.lastUpdated}
              </p>
            </div>

            <div className="flex flex-col gap-8">
              {policy.sections.map((section, idx) => (
                <div key={idx} className="flex flex-col gap-4">
                  {section.heading && (
                    <h2 className="text-foreground mt-4 text-xl font-medium">
                      {section.heading}
                    </h2>
                  )}

                  {section.paragraphs && section.paragraphs.length > 0 && (
                    <div className="text-muted-foreground flex flex-col gap-3 leading-relaxed">
                      {section.paragraphs.map((p, pIdx) => (
                        <p key={pIdx}>{p}</p>
                      ))}
                    </div>
                  )}

                  {section.list && section.list.length > 0 && (
                    <ul className="text-muted-foreground flex list-disc flex-col gap-2 pl-5 leading-relaxed">
                      {section.list.map((item, lIdx) => (
                        <li key={lIdx}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
