import { Metadata } from "next";
import { LoginForm } from "./_components/LoginForm";

export const metadata: Metadata = {
  title: "Вход в систему — Beraum",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginPage() {
  return (
    <div className="bg-background relative flex min-h-screen w-full items-center justify-center p-4">
      {/* Декоративный фон для админки */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="bg-brand/5 absolute top-[-10%] left-[-10%] h-[50vw] w-[50vw] rounded-full blur-[120px]" />
        <div className="absolute right-[-10%] bottom-[-10%] h-[50vw] w-[50vw] rounded-full bg-blue-500/5 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  );
}
