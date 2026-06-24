import "@/src/app/globals.css";
import { Manrope } from "next/font/google";

import { Footer } from "@/src/components/layout/Footer";
import { Header } from "@/src/components/layout/header/Header";
import { Main } from "@/src/components/layout/Main";
import { cn } from "@/src/lib/utils";

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-manrope",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={cn("font-sans antialiased", manrope.variable)}>
      <body>
        <div className="bg-background-main relative min-h-screen">
          <Header />
          <Main>{children}</Main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
