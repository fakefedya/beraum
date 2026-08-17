import { Container } from "@/src/components/shared/Container";
import { Section } from "@/src/components/shared/Section";
import { Button } from "@/src/components/ui/button";
import { buildImageUrl, cn } from "@/src/lib/utils";
import { SafeImage } from "@/src/components/shared/SafeImage";
import Link from "next/link";

export const SupportActionBlock = () => {
  const imageUrl = buildImageUrl("pages/service/support-action-bg.webp");

  const SUPPORT_ACTION_STEPS = [
    {
      title: "Подготовьте данные",
      desc: "Вам понадобится только электронный чек из личного кабинета маркетплейса.",
    },
    {
      title: "Опишите проблему",
      desc: "Заполните короткую форму обращения и прикрепите фото неисправности.",
    },
    {
      title: "Ожидайте решения",
      desc: "Наши инженеры свяжутся с вами напрямую для оперативного решения вопроса.",
    },
  ] as const;

  return (
    <Section>
      <Container maxWidth="5xl">
        <div
          className={cn(
            "bg-foreground text-background mx-auto flex w-full flex-col items-stretch overflow-hidden rounded-4xl",
            "md:flex-row",
          )}
        >
          <div
            className={cn(
              "relative z-20 flex flex-col justify-center gap-6 p-10",
              "md:w-1/2 lg:p-16",
            )}
          >
            <div className="flex flex-col gap-6">
              <h2
                className={cn(
                  "text-3xl font-medium tracking-tight text-balance",
                  "lg:text-4xl",
                )}
              >
                Случилась неисправность?
              </h2>
              <p className="text-background/80 text-lg leading-relaxed">
                Не переживайте. Мы построили процесс так, чтобы решить вашу
                проблему максимально быстро и прозрачно:
              </p>
            </div>

            <ol className="flex flex-col gap-4">
              {SUPPORT_ACTION_STEPS.map((step, idx) => (
                <li key={idx} className="flex items-start gap-4">
                  <div className="text-brand border-brand/30 bg-brand/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-sm font-medium">
                    {idx + 1}
                  </div>
                  <div className="mt-1 flex flex-col gap-2">
                    <span className="font-medium text-white">{step.title}</span>
                    <span className="text-background/70 text-sm leading-relaxed">
                      {step.desc}
                    </span>
                  </div>
                </li>
              ))}
            </ol>

            <Button
              asChild
              className="bg-brand text-foreground hover:bg-brand-hover shadow-button mt-2 h-12 w-fit rounded-[16px] px-8 text-base font-medium"
            >
              <Link href="/support">Создать обращение</Link>
            </Button>
          </div>

          <div className="relative min-h-75 w-full md:w-1/2">
            <div className="from-foreground via-foreground/20 absolute inset-0 z-10 bg-linear-to-t to-transparent md:bg-linear-to-r" />
            <SafeImage
              src={imageUrl}
              alt="Служба поддержки Beraum"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover object-right"
            />
          </div>
        </div>
      </Container>
    </Section>
  );
};
