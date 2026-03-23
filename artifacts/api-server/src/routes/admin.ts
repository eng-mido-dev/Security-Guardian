import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { ne } from "drizzle-orm";
import { authMiddleware, adminMiddleware, type AuthRequest } from "../middlewares/auth";

const router = Router();

router.get("/admin/users", authMiddleware, adminMiddleware, async (_req: AuthRequest, res) => {
  const users = await db
    .select({
      id: usersTable.id,
      name: usersTable.name,
      email: usersTable.email,
      role: usersTable.role,
      joinDate: usersTable.joinDate,
    })
    .from(usersTable)
    .where(ne(usersTable.role, "admin"))
    .orderBy(usersTable.joinDate);

  res.json(users);
});

export default router;
