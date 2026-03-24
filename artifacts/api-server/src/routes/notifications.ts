import { Router } from "express";
import { db, notificationsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { authMiddleware, adminMiddleware, type AuthRequest } from "../middlewares/auth";
import { logAdminAction } from "./admin";

const router = Router();

// ── GET /notifications/active (public for all logged-in users) ────────────────
router.get("/notifications/active", authMiddleware, async (_req, res) => {
  const active = await db
    .select()
    .from(notificationsTable)
    .where(eq(notificationsTable.isActive, true))
    .orderBy(desc(notificationsTable.sentAt));
  return res.json(active);
});

// ── GET /admin/notifications ──────────────────────────────────────────────────
router.get("/admin/notifications", authMiddleware, adminMiddleware, async (_req, res) => {
  const list = await db
    .select()
    .from(notificationsTable)
    .orderBy(desc(notificationsTable.sentAt));
  return res.json(list);
});

// ── POST /admin/notifications ─────────────────────────────────────────────────
router.post("/admin/notifications", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  const { titleAr, titleEn, bodyAr, bodyEn } = req.body as {
    titleAr?: string;
    titleEn?: string;
    bodyAr?: string;
    bodyEn?: string;
  };

  if (!bodyAr?.trim()) {
    return res.status(400).json({ error: "body_ar_required" });
  }

  const [created] = await db
    .insert(notificationsTable)
    .values({
      titleAr: titleAr?.trim() ?? "",
      titleEn: titleEn?.trim() ?? "",
      bodyAr: bodyAr.trim(),
      bodyEn: bodyEn?.trim() ?? "",
      isActive: true,
    })
    .returning();

  await logAdminAction(
    req.user!.email,
    `Sent notification: "${created.bodyEn || created.bodyAr}"`,
    `أرسل إشعاراً: "${created.bodyAr}"`,
    "notification",
    String(created.id)
  );

  return res.status(201).json(created);
});

// ── PATCH /admin/notifications/:id/toggle ─────────────────────────────────────
router.patch("/admin/notifications/:id/toggle", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  const [existing] = await db.select().from(notificationsTable).where(eq(notificationsTable.id, id)).limit(1);
  if (!existing) return res.status(404).json({ error: "not_found" });

  const [updated] = await db
    .update(notificationsTable)
    .set({ isActive: !existing.isActive })
    .where(eq(notificationsTable.id, id))
    .returning();

  return res.json(updated);
});

// ── DELETE /admin/notifications/:id ──────────────────────────────────────────
router.delete("/admin/notifications/:id", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  await db.delete(notificationsTable).where(eq(notificationsTable.id, id));

  await logAdminAction(
    req.user!.email,
    `Deleted notification #${id}`,
    `حذف الإشعار #${id}`,
    "notification",
    String(id)
  );

  return res.json({ ok: true });
});

export default router;
