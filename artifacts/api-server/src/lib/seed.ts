import bcrypt from "bcryptjs";
import { db, usersTable, userActivityTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const ADMIN_EMAIL = "admin@horras.com";
const ADMIN_PASSWORD = "Admin";

export async function seedAdmin() {
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  const existing = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, ADMIN_EMAIL))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(usersTable)
      .set({ passwordHash, role: "admin", name: "Admin" })
      .where(eq(usersTable.email, ADMIN_EMAIL));
    return;
  }

  const oldAdmin = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, "admin@h.com"))
    .limit(1);

  if (oldAdmin.length > 0) {
    await db
      .update(usersTable)
      .set({ email: ADMIN_EMAIL, passwordHash, role: "admin", name: "Admin" })
      .where(eq(usersTable.email, "admin@h.com"));
    return;
  }

  const [admin] = await db
    .insert(usersTable)
    .values({ name: "Admin", email: ADMIN_EMAIL, passwordHash, role: "admin" })
    .returning();

  await db.insert(userActivityTable).values({ userId: admin.id });
}
