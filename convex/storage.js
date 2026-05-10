import { mutation } from "./_generated/server";
import { v } from "convex/values";
export const generateUploadUrl = mutation({
    args: {},
    handler: async (ctx) => {
        return await ctx.storage.generateUploadUrl();
    },
});
export const storeFile = mutation({
    args: {
        storageId: v.id("_storage"),
        path: v.string(),
        filename: v.string(),
        contentType: v.string(),
        size: v.number(),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("files", {
            path: args.path,
            filename: args.filename,
            contentType: args.contentType,
            size: args.size,
            storageId: args.storageId,
        });
    },
});
export const getFile = mutation({
    args: { path: v.string() },
    handler: async (ctx, args) => {
        const file = await ctx.db
            .query("files")
            .withIndex("by_path", (q) => q.eq("path", args.path))
            .first();
        if (!file)
            throw new Error("File not found");
        const url = await ctx.storage.getUrl(file.storageId);
        if (!url)
            throw new Error("Failed to generate URL");
        return { url, ...file };
    },
});
