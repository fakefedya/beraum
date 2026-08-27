import "@/src/app/globals.css";
import { Golos_Text } from "next/font/google";
import { cn } from "@/src/lib/utils";
import { Toaster } from "@/src/components/ui/sonner";
import { clientEnv } from "@/src/lib/env/client";
import { Metadata } from "next";
import { ThemeProvider } from "@/src/components/providers/theme-provider";

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
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="ru"
      suppressHydrationWarning
      className={cn(
        "scrollbar-track-background scrollbar-thumb-muted-foreground/20 font-sans antialiased",
        golosText.variable,
      )}
    >
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
