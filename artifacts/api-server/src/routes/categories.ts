import { Router } from "express";
import { db, categoriesTable, videosTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { authMiddleware, adminMiddleware, type AuthRequest } from "../middlewares/auth";

const router = Router();

function parseBilingualCategory(raw: string): { nameAr: string; nameEn: string } | null {
  if (!raw) return null;
  const parts = raw.split(/\s[-–]\s/);
  if (parts.length < 2) return null;
  const hasArabic = (s: string) => /[\u0600-\u06FF]/.test(s);
  const arPart = parts.find(hasArabic) ?? parts[0];
  const enPart = parts.find((p) => !hasArabic(p)) ?? parts[1];
  if (!arPart.trim() || !enPart.trim()) return null;
  return { nameAr: arPart.trim(), nameEn: enPart.trim() };
}

function buildCombinedString(nameAr: string, nameEn: string): string {
  return `${nameAr} - ${nameEn}`;
}

router.get(
  "/admin/categories",
  authMiddleware,
  adminMiddleware,
  async (_req: AuthRequest, res) => {
    const allVideos = await db.select({ category: videosTable.category }).from(videosTable);
    const existingCategories = await db.select().from(categoriesTable);

    const knownCombined = new Set(
      existingCategories.map((c) => buildCombinedString(c.nameAr, c.nameEn).toLowerCase())
    );

    const toInsert: { nameAr: string; nameEn: string }[] = [];
    const seen = new Set<string>();

    for (const { category } of allVideos) {
      if (!category) continue;
      const parsed = parseBilingualCategory(category);
      if (!parsed) continue;
      const combined = buildCombinedString(parsed.nameAr, parsed.nameEn).toLowerCase();
      if (!knownCombined.has(combined) && !seen.has(combined)) {
        toInsert.push(parsed);
        seen.add(combined);
        knownCombined.add(combined);
      }
    }

    if (toInsert.length > 0) {
      await db.insert(categoriesTable).values(toInsert);
    }

    const categories = await db
      .select()
      .from(categoriesTable)
      .orderBy(categoriesTable.createdAt);

    return res.json(categories);
  }
);

router.post(
  "/admin/categories",
  authMiddleware,
  adminMiddleware,
  async (req: AuthRequest, res) => {
    const { nameAr, nameEn } = req.body as { nameAr?: string; nameEn?: string };
    if (!nameAr?.trim() || !nameEn?.trim()) {
      return res.status(400).json({ error: "name_ar_and_name_en_required" });
    }
    const [created] = await db
      .insert(categoriesTable)
      .values({ nameAr: nameAr.trim(), nameEn: nameEn.trim() })
      .returning();
    return res.status(201).json(created);
  }
);

router.patch(
  "/admin/categories/:id",
  authMiddleware,
  adminMiddleware,
  async (req: AuthRequest, res) => {
    const id = Number(req.params.id);
    const { nameAr, nameEn } = req.body as { nameAr?: string; nameEn?: string };

    if (!nameAr?.trim() || !nameEn?.trim()) {
      return res.status(400).json({ error: "name_ar_and_name_en_required" });
    }

    const [existing] = await db
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.id, id));

    if (!existing) return res.status(404).json({ error: "not_found" });

    const oldCombined = buildCombinedString(existing.nameAr, existing.nameEn);
    const newCombined = buildCombinedString(nameAr.trim(), nameEn.trim());

    const [updated] = await db
      .update(categoriesTable)
      .set({ nameAr: nameAr.trim(), nameEn: nameEn.trim() })
      .where(eq(categoriesTable.id, id))
      .returning();

    if (oldCombined !== newCombined) {
      await db
        .update(videosTable)
        .set({ category: newCombined })
        .where(eq(videosTable.category, oldCombined));
    }

    return res.json(updated);
  }
);

router.delete(
  "/admin/categories/:id",
  authMiddleware,
  adminMiddleware,
  async (req: AuthRequest, res) => {
    const id = Number(req.params.id);
    await db.delete(categoriesTable).where(eq(categoriesTable.id, id));
    return res.json({ ok: true });
  }
);

export default router;
