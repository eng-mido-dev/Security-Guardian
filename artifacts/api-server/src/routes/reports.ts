import { Router } from "express";
import { db, reportsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { authMiddleware, type AuthRequest } from "../middlewares/auth";
import { logAdminAction } from "./admin";

const router = Router();

router.post("/reports", authMiddleware, async (req, res) => {
  try {
    const { fraudType, url = "", description = "", attachmentUrl = "", isAnonymous = false } = req.body as {
      fraudType?: string; url?: string; description?: string; attachmentUrl?: string; isAnonymous?: boolean;
    };
    if (!fraudType) return res.status(400).json({ error: "fraud_type_required" });

    const user = (req as AuthRequest).user!;
    const [inserted] = await db.insert(reportsTable).values({
      userId: user.id, userEmail: isAnonymous ? "anonymous" : user.email,
      fraudType, url: url.trim(), description: description.trim(),
      attachmentUrl: attachmentUrl.trim(), isAnonymous: isAnonymous ? "true" : "false", status: "pending",
    }).returning();

    return res.status(201).json({ id: inserted.id, message: "report_submitted" });
  } catch (err) {
    console.error("Report submit error:", err);
    return res.status(500).json({ error: "internal_error" });
  }
});

router.get("/reports", authMiddleware, async (req, res) => {
  const user = (req as AuthRequest).user!;
  if (user.role !== "admin") return res.status(403).json({ error: "forbidden" });
  const reports = await db.select().from(reportsTable).orderBy(desc(reportsTable.submittedAt));
  return res.json(reports);
});

router.patch("/reports/:id/resolve", authMiddleware, async (req, res) => {
  const user = (req as AuthRequest).user!;
  if (user.role !== "admin") return res.status(403).json({ error: "forbidden" });

  const id = parseInt(req.params.id);
  const [updated] = await db.update(reportsTable).set({ status: "resolved" }).where(eq(reportsTable.id, id)).returning();
  if (!updated) return res.status(404).json({ error: "not_found" });

  await logAdminAction(user.email, `Resolved report #${id}`, `حسم البلاغ #${id}`, "report", String(id));
  return res.json(updated);
});

router.delete("/reports/:id", authMiddleware, async (req, res) => {
  const user = (req as AuthRequest).user!;
  if (user.role !== "admin") return res.status(403).json({ error: "forbidden" });

  const id = parseInt(req.params.id);
  await db.delete(reportsTable).where(eq(reportsTable.id, id));
  await logAdminAction(user.email, `Deleted report #${id}`, `حذف البلاغ #${id}`, "report", String(id));
  return res.json({ ok: true });
});

export default router;
