import bcrypt from "bcryptjs";
import { db, usersTable, userActivityTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export async function seedAdmin() {
  const email = "admin@h.com";
  const existing = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);

  if (existing.length > 0) return;

  const passwordHash = await bcrypt.hash("Admin", 10);
  const [admin] = await db
    .insert(usersTable)
    .values({ name: "Admin", email, passwordHash, role: "admin" })
    .returning();

  await db.insert(userActivityTable).values({ userId: admin.id });
}
