import { Router } from "express";
import { db, videosTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { authMiddleware, adminMiddleware, type AuthRequest } from "../middlewares/auth";
import { translateVideoFields, translateText } from "../lib/translate";
import { logAdminAction } from "./admin";

const router = Router();

router.get("/videos", async (_req, res) => {
  const videos = await db.select().from(videosTable).orderBy(videosTable.createdAt);
  res.json(videos);
});

router.post("/videos", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  const { title, titleAr: rawTitleAr, url, category, duration, description, descriptionAr: rawDescAr } = req.body as Record<string, string>;
  if (!title) { res.status(400).json({ error: "title_required" }); return; }

  let titleAr = rawTitleAr || "";
  let descriptionAr = rawDescAr || "";
  if (!titleAr || (description && !descriptionAr)) {
    const translated = await translateVideoFields(titleAr ? "" : title, descriptionAr ? "" : (description || ""));
    if (!titleAr) titleAr = translated.titleAr || title;
    if (!descriptionAr) descriptionAr = translated.descriptionAr;
  }

  const [video] = await db.insert(videosTable).values({
    title, titleAr, url: url || "", category: category || "",
    duration: duration || "60s", description: description || "", descriptionAr,
  }).returning();

  await logAdminAction(req.user!.email, `Added video "${title}"`, `أضاف فيديو "${titleAr || title}"`, "video", String(video.id));
  res.json(video);
});

router.put("/videos/:id", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  const { title, titleAr: rawTitleAr, url, category, duration, description, descriptionAr: rawDescAr } = req.body as Record<string, string>;

  let titleAr = rawTitleAr ?? "";
  let descriptionAr = rawDescAr ?? "";
  if (title && (!titleAr || (description && !descriptionAr))) {
    const translated = await translateVideoFields(titleAr ? "" : title, descriptionAr ? "" : (description || ""));
    if (!titleAr) titleAr = translated.titleAr || title;
    if (!descriptionAr) descriptionAr = translated.descriptionAr;
  }

  const [video] = await db.update(videosTable)
    .set({ title, titleAr, url, category, duration, description: description || "", descriptionAr })
    .where(eq(videosTable.id, id))
    .returning();

  if (!video) { res.status(404).json({ error: "not_found" }); return; }

  await logAdminAction(req.user!.email, `Updated video #${id} "${title}"`, `عدّل الفيديو #${id} "${titleAr || title}"`, "video", String(id));
  res.json(video);
});

router.post("/videos/backfill-translations", authMiddleware, adminMiddleware, async (_req, res) => {
  await backfillVideoTranslations();
  res.json({ ok: true });
});

router.delete("/videos/:id", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  const [video] = await db.select().from(videosTable).where(eq(videosTable.id, id)).limit(1);
  await db.delete(videosTable).where(eq(videosTable.id, id));
  await logAdminAction(req.user!.email, `Deleted video #${id} "${video?.title ?? ""}"`, `حذف الفيديو #${id} "${video?.titleAr || video?.title || ""}"`, "video", String(id));
  res.json({ ok: true });
});

export async function backfillVideoTranslations(): Promise<void> {
  const videos = await db.select().from(videosTable);
  const needsTranslation = videos.filter((v) => !v.titleAr || (v.description && !v.descriptionAr));
  if (needsTranslation.length === 0) return;
  console.log(`[translate] Backfilling ${needsTranslation.length} video(s)...`);
  for (const video of needsTranslation) {
    try {
      const titleAr = video.titleAr || (await translateText(video.title, "ar")) || video.title;
      const descriptionAr = video.descriptionAr || (video.description ? await translateText(video.description, "ar") : "");
      await db.update(videosTable).set({ titleAr, descriptionAr }).where(eq(videosTable.id, video.id));
      await new Promise((r) => setTimeout(r, 250));
    } catch { console.warn(`[translate] Failed to translate video id=${video.id}`); }
  }
  console.log(`[translate] Backfill complete.`);
}

export default router;
