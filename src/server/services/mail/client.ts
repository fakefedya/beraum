import "server-only";

export async function sendTwoFactorTokenEmail(email: string, token: string) {
  // TODO: Здесь будет интеграция с Resend / SMTP
  // Пока выводим в консоль сервера для отладки
  console.log(`\n\n🛡️ [SECURITY] 2FA Код для ${email}: ${token}\n\n`);
}
