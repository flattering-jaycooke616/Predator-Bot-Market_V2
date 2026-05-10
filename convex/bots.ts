import { query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { category: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.category) {
      return await ctx.db
        .query("bots")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .filter((q) => q.eq(q.field("active"), true))
        .collect();
    }
    return await ctx.db
      .query("bots")
      .withIndex("by_active", (q) => q.eq("active", true))
      .collect();
  },
});

export const getById = query({
  args: { id: v.id("bots") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("bots")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

export const stats = query({
  args: {},
  handler: async (ctx) => {
    const bots = await ctx.db.query("bots").collect();
    const purchases = await ctx.db.query("purchases").collect();

    const totalBots = bots.filter((b) => b.active).length;
    const totalPurchases = purchases.filter((p) => p.status === "completed").length;
    const featuredBots = bots.filter((b) => b.featured && b.active).length;

    const categoryMap = new Map<string, number>();
    for (const bot of bots) {
      if (bot.active) {
        categoryMap.set(bot.category, (categoryMap.get(bot.category) || 0) + 1);
      }
    }
    const categories = Array.from(categoryMap.entries()).map(([name, count]) => ({ name, count }));

    return { totalBots, totalPurchases, featuredBots, categories };
  },
});
