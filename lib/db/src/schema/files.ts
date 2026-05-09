import {
  pgTable,
  text,
  serial,
  bigint,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const filesTable = pgTable("files", {
  id: serial("id").primaryKey(),
  path: varchar("path", { length: 512 }).notNull().unique(),
  filename: text("filename").notNull(),
  contentType: text("content_type").notNull(),
  size: bigint("size", { mode: "number" }).notNull(),
  data: text("data").notNull(), // base64 encoded file data
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type FileRecord = typeof filesTable.$inferSelect;
export type InsertFile = typeof filesTable.$inferInsert;
