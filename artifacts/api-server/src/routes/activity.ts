import { Router } from "express";
import { db, userActivityTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { authMiddleware, type AuthRequest } from "../middlewares/auth";

const router = Router();

router.get("/activity", authMiddleware, async (req: AuthRequest, res) => {
  const { id } = req.user!;
  let [activity] = await db
    .select()
    .from(userActivityTable)
    .where(eq(userActivityTable.userId, id))
    .limit(1);

  if (!activity) {
    [activity] = await db
      .insert(userActivityTable)
      .values({ userId: id })
      .returning();
  }

  res.json({
    quizScore: activity.quizScore,
    linksChecked: activity.linksChecked,
    toolsChecked: activity.toolsChecked,
  });
});

router.patch("/activity", authMiddleware, async (req: AuthRequest, res) => {
  const { id } = req.user!;
  const { quizScore, linksChecked, toolsChecked } = req.body as {
    quizScore?: number | null;
    linksChecked?: number;
    toolsChecked?: string[];
  };

  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (quizScore !== undefined) updateData.quizScore = quizScore;
  if (linksChecked !== undefined) updateData.linksChecked = linksChecked;
  if (toolsChecked !== undefined) updateData.toolsChecked = toolsChecked;

  const existing = await db
    .select()
    .from(userActivityTable)
    .where(eq(userActivityTable.userId, id))
    .limit(1);

  let activity;
  if (existing.length === 0) {
    [activity] = await db
      .insert(userActivityTable)
      .values({ userId: id, ...updateData })
      .returning();
  } else {
    [activity] = await db
      .update(userActivityTable)
      .set(updateData)
      .where(eq(userActivityTable.userId, id))
      .returning();
  }

  res.json({
    quizScore: activity.quizScore,
    linksChecked: activity.linksChecked,
    toolsChecked: activity.toolsChecked,
  });
});

export default router;
