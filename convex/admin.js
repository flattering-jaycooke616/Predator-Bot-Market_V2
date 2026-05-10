import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
async function requireAdmin(ctx) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity)
        throw new Error("Unauthorized");
    const role = identity.role;
    if (role !== "admin")
        throw new Error("Forbidden: admin only");
    return identity.subject;
}
export const listPurchases = query({
    args: {},
    handler: async (ctx) => {
        await requireAdmin(ctx);
        const purchases = await ctx.db.query("purchases").collect();
        const result = [];
        for (const purchase of purchases) {
            const bot = await ctx.db.get(purchase.botId);
            result.push({ ...purchase, bot });
        }
        return result;
    },
});
export const verifyPurchase = mutation({
    args: { id: v.id("purchases") },
    handler: async (ctx, args) => {
        await requireAdmin(ctx);
        await ctx.db.patch(args.id, { status: "completed" });
        return await ctx.db.get(args.id);
    },
});
export const rejectPurchase = mutation({
    args: { id: v.id("purchases") },
    handler: async (ctx, args) => {
        await requireAdmin(ctx);
        await ctx.db.patch(args.id, { status: "refunded" });
        return await ctx.db.get(args.id);
    },
});
export const createBot = mutation({
    args: {
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
        featured: v.optional(v.boolean()),
        active: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        await requireAdmin(ctx);
        const { featured, active, ...rest } = args;
        return await ctx.db.insert("bots", {
            ...rest,
            featured: featured ?? false,
            active: active ?? true,
            downloadsCount: 0,
        });
    },
});
export const updateBot = mutation({
    args: {
        id: v.id("bots"),
        name: v.optional(v.string()),
        slug: v.optional(v.string()),
        description: v.optional(v.string()),
        longDescription: v.optional(v.string()),
        price: v.optional(v.number()),
        currency: v.optional(v.string()),
        category: v.optional(v.string()),
        features: v.optional(v.array(v.string())),
        imageUrl: v.optional(v.string()),
        imageStorageId: v.optional(v.id("_storage")),
        fileStorageId: v.optional(v.id("_storage")),
        featured: v.optional(v.boolean()),
        active: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        await requireAdmin(ctx);
        const { id, ...updates } = args;
        await ctx.db.patch(id, updates);
        return await ctx.db.get(id);
    },
});
export const deleteBot = mutation({
    args: { id: v.id("bots") },
    handler: async (ctx, args) => {
        await requireAdmin(ctx);
        await ctx.db.delete(args.id);
    },
});
