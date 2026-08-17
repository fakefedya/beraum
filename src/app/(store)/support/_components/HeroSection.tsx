import { Container } from "@/src/components/shared/Container";
import { Section } from "@/src/components/shared/Section";
import { cn } from "@/src/lib/utils";
import Link from "next/link";
import { WORK_SCHEDULE_INFO } from "@/src/app/(store)/support/_components/data";

export const HeroSection = () => {
  const info = WORK_SCHEDULE_INFO.information;
  return (
    <Section>
      <Container maxWidth="5xl">
        <div className="mx-auto flex flex-col items-center justify-center gap-8 text-center">
          <h1 className="flex gap-0.5 text-5xl font-medium lg:text-6xl">
            Поддержка
            <span className="relative flex h-4 w-4">
              <span className="bg-brand-secondary absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"></span>
              <span className="bg-brand-secondary relative inline-flex h-4 w-4 rounded-full"></span>
            </span>
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed lg:text-lg">
            Если у вас возникли вопросы по эксплуатации, обратите внимание на
            раздел{" "}
            <Link
              className={cn(
                "text-medium text-brand-secondary",
                "hover:text-brand-secondary-muted transition-colors duration-300",
              )}
              href="/faq"
            >
              «Вопросы и ответы»
            </Link>
            , если вы хотите сообщить о неисправности, — создайте обращение в
            службу поддержки.
          </p>
          {WORK_SCHEDULE_INFO.isEnabled && (
            <div className="rounded-2xl bg-[#fa6d2014] p-4 text-[#e35502]">
              <div className="flex items-center justify-center gap-2">
                <info.icon size={24} strokeWidth={1.4} />
                <span>
                  {info.description}: {info.days}, {info.hours} по{" "}
                  {info.timezone}
                </span>
              </div>
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
};
