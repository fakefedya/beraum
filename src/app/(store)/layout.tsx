import "@/src/app/globals.css";
import { Golos_Text } from "next/font/google";

import { Footer } from "@/src/components/shared/Footer";
import { Header } from "@/src/components/shared/header/Header";
import { Main } from "@/src/components/shared/Main";
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
        <div className="relative flex h-full min-h-screen flex-col">
          <Header />
          <Main>{children}</Main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
