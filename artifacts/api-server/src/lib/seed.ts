import bcrypt from "bcryptjs";
import { db, usersTable, userActivityTable, videosTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const ADMIN_EMAIL = "admin@horras.com";
const ADMIN_PASSWORD = "Admin";

export async function seedAdmin() {
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  const existing = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, ADMIN_EMAIL))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(usersTable)
      .set({ passwordHash, role: "admin", name: "Admin" })
      .where(eq(usersTable.email, ADMIN_EMAIL));
    return;
  }

  const oldAdmin = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, "admin@h.com"))
    .limit(1);

  if (oldAdmin.length > 0) {
    await db
      .update(usersTable)
      .set({ email: ADMIN_EMAIL, passwordHash, role: "admin", name: "Admin" })
      .where(eq(usersTable.email, "admin@h.com"));
    return;
  }

  const [admin] = await db
    .insert(usersTable)
    .values({ name: "Admin", email: ADMIN_EMAIL, passwordHash, role: "admin" })
    .returning();

  await db.insert(userActivityTable).values({ userId: admin.id });
}

const SEED_VIDEOS = [
  {
    url: "https://www.youtube.com/watch?v=aCtAKbGV3VM",
    title: "Password Security – How to Create a Strong Password",
    titleAr: "أمان كلمات المرور - كيف تصنع كلمة مرور قوية",
    category: "أمان كلمات المرور - Password Security",
    duration: "4:30",
    description:
      "Step-by-step guide to crafting strong, unbreakable passwords and managing them securely so your accounts stay protected at all times.",
    descriptionAr: "",
  },
  {
    url: "https://www.youtube.com/watch?v=aEmXaVdG06A",
    title: "How to Protect Yourself from Phishing",
    titleAr: "كيف تحمي نفسك من الفيشينج",
    category: "Phishing - فيشينج",
    duration: "3:12",
    description:
      "Discover how phishing attacks work and learn practical techniques to identify fake websites, suspicious emails, and social engineering traps.",
    descriptionAr: "",
  },
  {
    url: "https://www.youtube.com/watch?v=ZXFYT-BG2So",
    title: "Two-Factor Authentication (2FA) – Why You Need It",
    titleAr: "المصادقة الثنائية 2FA - لماذا تحتاجها",
    category: "مصادقة - 2FA",
    duration: "2:45",
    description:
      "Understand why Two-Factor Authentication (2FA) is essential for your digital security and how to enable it on your most important accounts.",
    descriptionAr: "",
  },
  {
    url: "https://www.youtube.com/watch?v=7EBiHH9sYUs",
    title: "Public Wi-Fi Danger – How to Protect Yourself",
    titleAr: "خطر الواي فاي العام - كيف تحمي نفسك",
    category: "الواي فاي - Public Wi-Fi",
    duration: "3:00",
    description:
      "Public Wi-Fi networks are a major security risk. Learn how attackers exploit open networks and how to stay protected wherever you connect.",
    descriptionAr: "",
  },
];

export async function seedVideos() {
  const existing = await db.select().from(videosTable);
  const existingUrls = new Set(existing.map((v) => v.url));

  for (const video of SEED_VIDEOS) {
    if (existingUrls.has(video.url)) {
      await db
        .update(videosTable)
        .set({
          description: video.description,
          titleAr: video.titleAr,
          category: video.category,
          duration: video.duration,
        })
        .where(eq(videosTable.url, video.url));
    } else {
      await db.insert(videosTable).values(video);
    }
  }
}
