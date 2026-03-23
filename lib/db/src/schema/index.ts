import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
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
  url: text("url").notNull().default(""),
  category: text("category").notNull().default(""),
  duration: text("duration").notNull().default("60s"),
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

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, joinDate: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;

export const insertVideoSchema = createInsertSchema(videosTable).omit({ id: true, createdAt: true });
export type InsertVideo = z.infer<typeof insertVideoSchema>;
export type Video = typeof videosTable.$inferSelect;

export const insertActivitySchema = createInsertSchema(userActivityTable).omit({ id: true, updatedAt: true });
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type UserActivity = typeof userActivityTable.$inferSelect;
