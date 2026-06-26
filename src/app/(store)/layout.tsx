import "@/src/app/globals.css";
import { Golos_Text } from "next/font/google";

import { Footer } from "@/src/components/layout/Footer";
import { Header } from "@/src/components/layout/header/Header";
import { Main } from "@/src/components/layout/Main";
import { cn } from "@/src/lib/utils";

const golosText = Golos_Text({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-golos-text",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={cn("font-sans antialiased", golosText.variable)}>
      <body>
        <div className="bg-surface-gray relative min-h-screen">
          <Header />
          <Main>{children}</Main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
