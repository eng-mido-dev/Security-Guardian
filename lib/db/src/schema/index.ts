import { pgTable, serial, text, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("user"),
  joinDate: timestamp("join_date").defaultNow().notNull(),
});

export const videosTable = pgTable("videos", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  titleAr: text("title_ar").notNull().default(""),
  url: text("url").notNull().default(""),
  category: text("category").notNull().default(""),
  duration: text("duration").notNull().default("60s"),
  description: text("description").notNull().default(""),
  descriptionAr: text("description_ar").notNull().default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userActivityTable = pgTable("user_activity", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => usersTable.id)
    .notNull()
    .unique(),
  quizScore: integer("quiz_score"),
  linksChecked: integer("links_checked").notNull().default(0),
  toolsChecked: text("tools_checked").array().notNull().default([]),
  failedTopics: text("failed_topics").array().notNull().default([]),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const scanHistoryTable = pgTable("scan_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  score: integer("score").notNull(),
  status: text("status").notNull(),
  report: text("report").notNull(),
  scannedAt: timestamp("scanned_at").defaultNow().notNull(),
});

export const reportsTable = pgTable("reports", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  userEmail: text("user_email").notNull(),
  fraudType: text("fraud_type").notNull(),
  url: text("url").notNull().default(""),
  description: text("description").notNull().default(""),
  attachmentUrl: text("attachment_url").notNull().default(""),
  isAnonymous: text("is_anonymous").notNull().default("false"),
  status: text("status").notNull().default("pending"),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
});

export const categoriesTable = pgTable("categories", {
  id: serial("id").primaryKey(),
  nameAr: text("name_ar").notNull(),
  nameEn: text("name_en").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const notificationsTable = pgTable("notifications", {
  id: serial("id").primaryKey(),
  titleAr: text("title_ar").notNull().default(""),
  titleEn: text("title_en").notNull().default(""),
  bodyAr: text("body_ar").notNull(),
  bodyEn: text("body_en").notNull().default(""),
  isActive: boolean("is_active").notNull().default(true),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
});

export const adminLogsTable = pgTable("admin_logs", {
  id: serial("id").primaryKey(),
  adminEmail: text("admin_email").notNull(),
  actionAr: text("action_ar").notNull(),
  actionEn: text("action_en").notNull(),
  entityType: text("entity_type").notNull().default(""),
  entityId: text("entity_id").notNull().default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, joinDate: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;

export const insertVideoSchema = createInsertSchema(videosTable).omit({ id: true, createdAt: true });
export type InsertVideo = z.infer<typeof insertVideoSchema>;
export type Video = typeof videosTable.$inferSelect;

export const insertActivitySchema = createInsertSchema(userActivityTable).omit({ id: true, updatedAt: true });
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type UserActivity = typeof userActivityTable.$inferSelect;
