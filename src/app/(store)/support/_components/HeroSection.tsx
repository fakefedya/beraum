import { Container } from "@/src/components/shared/Container";
import { Section } from "@/src/components/shared/Section";
import { cn } from "@/src/lib/utils";
import Link from "next/link";
import { WORK_SCHEDULE_INFO } from "@/src/app/(store)/support/_components/data";
import { SupportStatus } from "@/src/components/shared/SupportStatus";

export const HeroSection = () => {
  const info = WORK_SCHEDULE_INFO.information;
  return (
    <Section>
      <Container maxWidth="5xl">
        <div className="mx-auto flex flex-col items-center justify-center gap-8 text-center">
          <h1
            className={cn(
              "text-foreground flex gap-1 text-4xl font-semibold tracking-tight text-balance",
              "md:text-5xl lg:text-6xl",
            )}
          >
            Поддержка
            <SupportStatus
              className={cn("mt-1.5 h-2 w-2", "md:mt-2.5 md:h-4 md:w-4")}
            />
          </h1>
          <p
            className={cn(
              "text-muted-foreground text-base leading-relaxed text-pretty",
              "md:text-lg",
            )}
          >
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
            , если вы хотите сообщить о неисправности — создайте обращение в
            службу поддержки.
          </p>
          {WORK_SCHEDULE_INFO.isEnabled && (
            <div className="rounded-2xl bg-orange-50 p-4 text-orange-700">
              <div
                className={cn(
                  "flex items-center justify-center gap-4",
                  "md:gap-2",
                )}
              >
                <info.icon className="shrink-0" size={24} strokeWidth={1.4} />
                <span className={cn("text-left text-sm")}>
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
