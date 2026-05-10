import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
const DOWNLOAD_EXPIRY_HOURS = 5;
export const list = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity)
            throw new Error("Unauthorized");
        const userId = identity.subject;
        const purchases = await ctx.db
            .query("purchases")
            .withIndex("by_user", (q) => q.eq("userId", userId))
            .collect();
        const result = [];
        for (const purchase of purchases) {
            const bot = await ctx.db.get(purchase.botId);
            result.push({ ...purchase, bot });
        }
        return result;
    },
});
export const getById = query({
    args: { id: v.id("purchases") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity)
            throw new Error("Unauthorized");
        const purchase = await ctx.db.get(args.id);
        if (!purchase || purchase.userId !== identity.subject) {
            throw new Error("Purchase not found");
        }
        const bot = await ctx.db.get(purchase.botId);
        return { ...purchase, bot };
    },
});
export const create = mutation({
    args: {
        botId: v.id("bots"),
        paymentReference: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity)
            throw new Error("Unauthorized");
        const userId = identity.subject;
        const bot = await ctx.db.get(args.botId);
        if (!bot)
            throw new Error("Bot not found");
        const existing = await ctx.db
            .query("purchases")
            .withIndex("by_user_bot", (q) => q.eq("userId", userId).eq("botId", args.botId))
            .collect();
        if (existing.some((p) => p.status === "completed")) {
            throw new Error("Already purchased this bot");
        }
        if (existing.some((p) => p.status === "pending")) {
            throw new Error("Purchase already pending verification");
        }
        return await ctx.db.insert("purchases", {
            userId,
            botId: args.botId,
            status: "pending",
            amountPaid: bot.price,
            paymentReference: args.paymentReference,
            downloadCount: 0,
            maxDownloads: 2,
        });
    },
});
export const download = mutation({
    args: { purchaseId: v.id("purchases") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity)
            throw new Error("Unauthorized");
        const userId = identity.subject;
        const purchase = await ctx.db.get(args.purchaseId);
        if (!purchase || purchase.userId !== userId) {
            throw new Error("Purchase not found");
        }
        if (purchase.status !== "completed") {
            throw new Error("Purchase not yet verified by admin");
        }
        if (purchase.downloadCount >= purchase.maxDownloads) {
            throw new Error("Download limit reached");
        }
        if (purchase.downloadCount === 1 && purchase.secondDownloadExpiresAt) {
            const now = Date.now();
            if (now > purchase.secondDownloadExpiresAt) {
                throw new Error("Download window has expired");
            }
        }
        let secondDownloadExpiresAt = purchase.secondDownloadExpiresAt;
        if (purchase.downloadCount === 0) {
            secondDownloadExpiresAt = Date.now() + DOWNLOAD_EXPIRY_HOURS * 60 * 60 * 1000;
        }
        const newCount = purchase.downloadCount + 1;
        await ctx.db.patch(args.purchaseId, {
            downloadCount: newCount,
            secondDownloadExpiresAt,
        });
        const bot = await ctx.db.get(purchase.botId);
        if (!bot?.fileStorageId) {
            throw new Error("Bot file not available");
        }
        const downloadUrl = await ctx.storage.getUrl(bot.fileStorageId);
        if (!downloadUrl) {
            throw new Error("Failed to generate download URL");
        }
        return {
            downloadUrl,
            downloadsRemaining: purchase.maxDownloads - newCount,
            expiresAt: secondDownloadExpiresAt,
        };
    },
});
