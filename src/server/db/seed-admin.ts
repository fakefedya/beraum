import { db } from "./client";
import { users } from "./schema/auth.schema";
import { hash } from "bcrypt-ts";

async function main() {
  console.log("⏳ Создание учетной записи Superadmin...");

  const email = "admin@beraum.com";
  const plainPassword = "SuperSecurePassword2026!";

  try {
    const passwordHash = await hash(plainPassword, 12);

    await db
      .insert(users)
      .values({
        email,
        name: "Beraum Admin",
        passwordHash,
        role: "superadmin",
        isTwoFactorEnabled: true,
      })
      .onConflictDoNothing({ target: users.email });

    console.log(`✅ Администратор успешно создан!`);
    console.log(`✉️ Email: ${email}`);
    console.log(`🔑 Пароль: ${plainPassword}`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Ошибка сидирования админа:", error);
    process.exit(1);
  }
}

main();
