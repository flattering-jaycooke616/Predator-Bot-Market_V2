import {
  pgTable,
  text,
  serial,
  integer,
  decimal,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { botsTable } from "./bots";
import { relations } from "drizzle-orm";

export const purchasesTable = pgTable("purchases", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  botId: integer("bot_id")
    .notNull()
    .references(() => botsTable.id),
  status: text("status", {
    enum: ["pending", "completed", "refunded"],
  })
    .notNull()
    .default("pending"),
  amountPaid: decimal("amount_paid", { precision: 10, scale: 2 }).notNull(),
  paymentReference: text("payment_reference"),
  downloadCount: integer("download_count").notNull().default(0),
  maxDownloads: integer("max_downloads").notNull().default(2),
  secondDownloadExpiresAt: timestamp("second_download_expires_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const purchasesRelations = relations(purchasesTable, ({ one }) => ({
  bot: one(botsTable, {
    fields: [purchasesTable.botId],
    references: [botsTable.id],
  }),
}));

export const botsRelations = relations(botsTable, ({ many }) => ({
  purchases: many(purchasesTable),
}));

export const insertPurchaseSchema = createInsertSchema(purchasesTable).omit({
  id: true,
  createdAt: true,
  downloadCount: true,
  secondDownloadExpiresAt: true,
});
export type InsertPurchase = z.infer<typeof insertPurchaseSchema>;
export type Purchase = typeof purchasesTable.$inferSelect;
