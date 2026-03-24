import { Router } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable, userActivityTable, adminLogsTable } from "@workspace/db";
import { eq, ne, desc, sql } from "drizzle-orm";
import { authMiddleware, adminMiddleware, type AuthRequest } from "../middlewares/auth";

const router = Router();

export async function logAdminAction(
  adminEmail: string,
  actionEn: string,
  actionAr: string,
  entityType = "",
  entityId = ""
) {
  try {
    await db.insert(adminLogsTable).values({ adminEmail, actionEn, actionAr, entityType, entityId });
  } catch {
    // non-blocking
  }
}

function generatePassword(length = 10): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

// ── GET /admin/users ──────────────────────────────────────────────────────────
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
    .orderBy(desc(usersTable.joinDate));

  res.json(users);
});

// ── DELETE /admin/users/:id ───────────────────────────────────────────────────
router.delete("/admin/users/:id", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
  if (!user) return res.status(404).json({ error: "not_found" });
  if (user.role === "admin") return res.status(403).json({ error: "cannot_delete_admin" });

  await db.delete(usersTable).where(eq(usersTable.id, id));
  await logAdminAction(
    req.user!.email,
    `Deleted user ${user.email}`,
    `حذف المستخدم ${user.email}`,
    "user",
    String(id)
  );
  return res.json({ ok: true });
});

// ── POST /admin/users/:id/reset-password ─────────────────────────────────────
router.post("/admin/users/:id/reset-password", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
  if (!user) return res.status(404).json({ error: "not_found" });
  if (user.role === "admin") return res.status(403).json({ error: "cannot_reset_admin" });

  const newPassword = generatePassword();
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await db.update(usersTable).set({ passwordHash }).where(eq(usersTable.id, id));

  await logAdminAction(
    req.user!.email,
    `Reset password for ${user.email}`,
    `إعادة تعيين كلمة مرور ${user.email}`,
    "user",
    String(id)
  );

  return res.json({ ok: true, newPassword, userEmail: user.email });
});

// ── GET /admin/analytics ──────────────────────────────────────────────────────
router.get("/admin/analytics", authMiddleware, adminMiddleware, async (_req: AuthRequest, res) => {
  const activities = await db
    .select({
      quizScore: userActivityTable.quizScore,
      failedTopics: userActivityTable.failedTopics,
      linksChecked: userActivityTable.linksChecked,
    })
    .from(userActivityTable);

  const scoresWithData = activities.filter((a) => a.quizScore !== null);
  const avgScore =
    scoresWithData.length > 0
      ? Math.round(scoresWithData.reduce((sum, a) => sum + (a.quizScore ?? 0), 0) / scoresWithData.length)
      : null;

  const topicFreq: Record<string, number> = {};
  for (const { failedTopics } of activities) {
    for (const topic of failedTopics ?? []) {
      if (topic) topicFreq[topic] = (topicFreq[topic] ?? 0) + 1;
    }
  }
  const topFailedTopics = Object.entries(topicFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([topic, count]) => ({ topic, count }));

  const totalLinksChecked = activities.reduce((sum, a) => sum + (a.linksChecked ?? 0), 0);
  const usersWithQuiz = scoresWithData.length;
  const totalUsers = activities.length;

  const scoreBuckets = { excellent: 0, good: 0, average: 0, poor: 0 };
  for (const { quizScore } of scoresWithData) {
    const s = quizScore ?? 0;
    if (s >= 90) scoreBuckets.excellent++;
    else if (s >= 70) scoreBuckets.good++;
    else if (s >= 50) scoreBuckets.average++;
    else scoreBuckets.poor++;
  }

  return res.json({
    avgScore,
    topFailedTopics,
    totalLinksChecked,
    usersWithQuiz,
    totalUsers,
    scoreBuckets,
  });
});

// ── GET /admin/logs ───────────────────────────────────────────────────────────
router.get("/admin/logs", authMiddleware, adminMiddleware, async (_req: AuthRequest, res) => {
  const logs = await db
    .select()
    .from(adminLogsTable)
    .orderBy(desc(adminLogsTable.createdAt))
    .limit(200);
  return res.json(logs);
});

export default router;
