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

const golosText = Golos_Text({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-golos-text",
});

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
