// Usage: npm run admin:reset -- <email> <new-password>
// Updates the admin's password hash, or creates the SUPER_ADMIN if the email is unknown.
import bcrypt from "bcryptjs";
import { createClient } from "../src/lib/db";

const db = createClient();

async function main() {
  const [emailArg, password] = process.argv.slice(2);
  if (!emailArg || !password) {
    console.error("Usage: npm run admin:reset -- <email> <new-password>");
    process.exitCode = 1;
    return;
  }
  if (password.length < 8) {
    console.error("Password must be at least 8 characters.");
    process.exitCode = 1;
    return;
  }

  const email = emailArg.toLowerCase();
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await db.adminUser.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, name: "Site Admin", role: "SUPER_ADMIN", passwordHash },
  });
  console.log(`Password set for ${user.email} (${user.role}).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
