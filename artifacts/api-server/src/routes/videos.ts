import { Router } from "express";
import { db, videosTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { authMiddleware, adminMiddleware, type AuthRequest } from "../middlewares/auth";

const router = Router();

router.get("/videos", async (_req, res) => {
  const videos = await db
    .select()
    .from(videosTable)
    .orderBy(videosTable.createdAt);
  res.json(videos);
});

router.post("/videos", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  const { title, url, category, duration, description } = req.body as Record<string, string>;
  if (!title) {
    res.status(400).json({ error: "title_required" });
    return;
  }

  const [video] = await db
    .insert(videosTable)
    .values({
      title,
      url: url || "",
      category: category || "",
      duration: duration || "60s",
      description: description || "",
    })
    .returning();

  res.json(video);
});

router.put("/videos/:id", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  const { title, url, category, duration, description } = req.body as Record<string, string>;

  const [video] = await db
    .update(videosTable)
    .set({ title, url, category, duration, description: description || "" })
    .where(eq(videosTable.id, id))
    .returning();

  if (!video) {
    res.status(404).json({ error: "not_found" });
    return;
  }

  res.json(video);
});

router.delete("/videos/:id", authMiddleware, adminMiddleware, async (req: AuthRequest, res) => {
  const id = Number(req.params.id);
  await db.delete(videosTable).where(eq(videosTable.id, id));
  res.json({ ok: true });
});

export default router;
