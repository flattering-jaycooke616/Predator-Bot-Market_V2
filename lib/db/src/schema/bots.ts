import {
  pgTable,
  text,
  serial,
  integer,
  boolean,
  decimal,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const botsTable = pgTable("bots", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  longDescription: text("long_description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("USD"),
  category: text("category").notNull(),
  features: jsonb("features").$type<string[]>().notNull().default([]),
  imageUrl: text("image_url"),
  fileObjectPath: text("file_object_path"),
  featured: boolean("featured").notNull().default(false),
  active: boolean("active").notNull().default(true),
  downloadsCount: integer("downloads_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertBotSchema = createInsertSchema(botsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  downloadsCount: true,
});
export type InsertBot = z.infer<typeof insertBotSchema>;
export type Bot = typeof botsTable.$inferSelect;
