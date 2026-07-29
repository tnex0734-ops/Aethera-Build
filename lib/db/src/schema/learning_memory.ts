import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const learningMemoryTable = pgTable("learning_memory", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique().references(() => usersTable.id),
  weakTopics: text("weak_topics").array().notNull().default([]),
  strongTopics: text("strong_topics").array().notNull().default([]),
  learningStyle: text("learning_style"),
  preferredLanguage: text("preferred_language").notNull().default("en"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertLearningMemorySchema = createInsertSchema(learningMemoryTable).omit({ id: true, updatedAt: true });
export type InsertLearningMemory = z.infer<typeof insertLearningMemorySchema>;
export type LearningMemory = typeof learningMemoryTable.$inferSelect;
