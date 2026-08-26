import "@/src/app/globals.css";
import { Golos_Text } from "next/font/google";
import { cookies } from "next/headers";

import { Footer } from "@/src/components/shared/Footer";
import { Header } from "@/src/components/shared/header/Header";
import { Main } from "@/src/components/shared/Main";
import { cn } from "@/src/lib/utils";
import { Toaster } from "@/src/components/ui/sonner";
import { CookieBanner } from "@/src/components/shared/CookieBanner";
import { ConsultWidget } from "@/src/components/shared/ConsultWidget";
import { clientEnv } from "@/src/lib/env/client";
import { Metadata } from "next";

const golosText = Golos_Text({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-golos-text",
});

export const metadata: Metadata = {
  metadataBase: new URL(clientEnv.NEXT_PUBLIC_APP_URL),
  title: {
    default: "Бытовая техника с ярким дизайном по доступной цене — Beraum",
    template: "%s — Beraum",
  },
  description:
    "Официальный магазин Beraum. Создаем стильную бытовую технику, которая идеально впишется в ваш интерьер. Честная цена, надежные комплектующие и гарантия от производителя.",
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: "/",
    siteName: "Beraum",
    images: [{ url: "/apple-icon.png", width: 512, height: 512 }],
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const hasConsent = cookieStore.has("beraum_cookie_consent");

  return (
    <html
      lang="ru"
      className={cn(
        "scrollbar-track-background scrollbar-thumb-muted-foreground/20 font-sans antialiased",
        golosText.variable,
      )}
    >
      <body>
        <div className="relative flex h-full min-h-screen flex-col">
          <Header />
          <Main>{children}</Main>
          <Footer />
        </div>

        {!hasConsent && <CookieBanner />}

        <ConsultWidget />
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
