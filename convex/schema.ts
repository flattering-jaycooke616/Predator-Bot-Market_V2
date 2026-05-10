import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  bots: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    longDescription: v.optional(v.string()),
    price: v.number(),
    currency: v.string(),
    category: v.string(),
    features: v.array(v.string()),
    imageUrl: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
    fileStorageId: v.optional(v.id("_storage")),
    featured: v.boolean(),
    active: v.boolean(),
    downloadsCount: v.number(),
  }).index("by_slug", ["slug"])
    .index("by_category", ["category"])
    .index("by_active", ["active"]),

  purchases: defineTable({
    userId: v.string(),
    botId: v.id("bots"),
    status: v.union(v.literal("pending"), v.literal("completed"), v.literal("refunded")),
    amountPaid: v.number(),
    paymentReference: v.optional(v.string()),
    downloadCount: v.number(),
    maxDownloads: v.number(),
    secondDownloadExpiresAt: v.optional(v.number()),
  }).index("by_user", ["userId"])
    .index("by_bot", ["botId"])
    .index("by_user_bot", ["userId", "botId"]),

  files: defineTable({
    path: v.string(),
    filename: v.string(),
    contentType: v.string(),
    size: v.number(),
    storageId: v.id("_storage"),
  }).index("by_path", ["path"]),
});
