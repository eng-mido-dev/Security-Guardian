import { Router } from "express";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { db, usersTable, userActivityTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { authMiddleware, type AuthRequest } from "../middlewares/auth";

const router = Router();
const secret = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "horras-fallback-secret-change-in-production",
);

async function signToken(payload: Record<string, unknown>) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .sign(secret);
}

router.post("/auth/register", async (req, res) => {
  const { name, email, password } = req.body as Record<string, string>;
  if (!name || !email || !password) {
    res.status(400).json({ error: "missing_fields" });
    return;
  }

  const normalized = email.trim().toLowerCase();
  const existing = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, normalized))
    .limit(1);

  if (existing.length > 0) {
    res.status(409).json({ error: "email_taken" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const [user] = await db
    .insert(usersTable)
    .values({ name: name.trim(), email: normalized, passwordHash, role: "user" })
    .returning();

  const [activity] = await db
    .insert(userActivityTable)
    .values({ userId: user.id })
    .returning();

  const token = await signToken({
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  });

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      joinDate: user.joinDate,
    },
    activity: {
      quizScore: activity.quizScore,
      linksChecked: activity.linksChecked,
      toolsChecked: activity.toolsChecked,
      failedTopics: activity.failedTopics,
    },
  });
});

router.post("/auth/login", async (req, res) => {
  const { email, password } = req.body as Record<string, string>;
  if (!email || !password) {
    res.status(400).json({ error: "missing_fields" });
    return;
  }

  const normalized = email.trim().toLowerCase();
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, normalized))
    .limit(1);

  if (!user) {
    res.status(401).json({ error: "user_not_found" });
    return;
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatch) {
    res.status(401).json({ error: "wrong_password" });
    return;
  }

  let [activity] = await db
    .select()
    .from(userActivityTable)
    .where(eq(userActivityTable.userId, user.id))
    .limit(1);

  if (!activity) {
    [activity] = await db
      .insert(userActivityTable)
      .values({ userId: user.id })
      .returning();
  }

  const token = await signToken({
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  });

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      joinDate: user.joinDate,
    },
    activity: {
      quizScore: activity.quizScore,
      linksChecked: activity.linksChecked,
      toolsChecked: activity.toolsChecked,
      failedTopics: activity.failedTopics,
    },
  });
});

router.get("/auth/me", authMiddleware, async (req: AuthRequest, res) => {
  const { id } = req.user!;
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, id))
    .limit(1);

  if (!user) {
    res.status(404).json({ error: "not_found" });
    return;
  }

  let [activity] = await db
    .select()
    .from(userActivityTable)
    .where(eq(userActivityTable.userId, user.id))
    .limit(1);

  if (!activity) {
    [activity] = await db
      .insert(userActivityTable)
      .values({ userId: user.id })
      .returning();
  }

  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      joinDate: user.joinDate,
    },
    activity: {
      quizScore: activity.quizScore,
      linksChecked: activity.linksChecked,
      toolsChecked: activity.toolsChecked,
      failedTopics: activity.failedTopics,
    },
  });
});

export default router;
