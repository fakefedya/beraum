import { cookies } from "next/headers";
import { Footer } from "@/src/components/shared/Footer";
import { Header } from "@/src/components/shared/header/Header";
import { Main } from "@/src/components/shared/Main";
import { CookieBanner } from "@/src/components/shared/CookieBanner";
import { ConsultWidget } from "@/src/components/shared/ConsultWidget";

export default async function StoreLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const hasConsent = cookieStore.has("beraum_cookie_consent");

  return (
    <div className="relative flex h-full min-h-screen flex-col">
      <Header />
      <Main>{children}</Main>
      <Footer />

      {!hasConsent && <CookieBanner />}
      <ConsultWidget />
    </div>
  );
}
