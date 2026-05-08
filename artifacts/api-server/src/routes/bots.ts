import { Router } from "express";
import { db } from "@workspace/db";
import { botsTable } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { ListBotsQueryParams, GetBotParams } from "@workspace/api-zod";

const router = Router();

router.get("/bots/stats", async (req, res) => {
  try {
    const [totalBots] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(botsTable)
      .where(eq(botsTable.active, true));

    const totalPurchasesResult = await db.execute(
      sql`SELECT COUNT(*)::int as count FROM purchases WHERE status = 'completed'`
    );
    const totalPurchases = (totalPurchasesResult as any).rows?.[0]?.count ?? 0;

    const [featuredBots] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(botsTable)
      .where(and(eq(botsTable.featured, true), eq(botsTable.active, true)));

    const categoriesResult = await db.execute(
      sql`SELECT category as name, COUNT(*)::int as count FROM bots WHERE active = true GROUP BY category ORDER BY count DESC`
    );
    const categories = ((categoriesResult as any).rows ?? []).map((c: any) => ({ name: c.name, count: Number(c.count) }));

    return res.json({
      totalBots: totalBots?.count ?? 0,
      totalPurchases,
      featuredBots: featuredBots?.count ?? 0,
      categories,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get bot stats");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/bots", async (req, res) => {
  try {
    const parsed = ListBotsQueryParams.safeParse(req.query);
    const params = parsed.success ? parsed.data : {};

    const conditions = [eq(botsTable.active, true)];
    if (params.category) conditions.push(eq(botsTable.category, params.category));
    if (params.featured !== undefined) conditions.push(eq(botsTable.featured, params.featured));

    const bots = await db
      .select()
      .from(botsTable)
      .where(and(...conditions))
      .orderBy(botsTable.createdAt);

    return res.json(
      bots.map((b) => ({
        ...b,
        price: parseFloat(b.price),
        features: b.features ?? [],
      }))
    );
  } catch (err) {
    req.log.error({ err }, "Failed to list bots");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/bots/:id", async (req, res) => {
  try {
    const parsed = GetBotParams.safeParse({ id: Number(req.params.id) });
    if (!parsed.success) return res.status(400).json({ error: "Invalid id" });

    const [bot] = await db
      .select()
      .from(botsTable)
      .where(eq(botsTable.id, parsed.data.id));

    if (!bot) return res.status(404).json({ error: "Bot not found" });

    return res.json({ ...bot, price: parseFloat(bot.price), features: bot.features ?? [] });
  } catch (err) {
    req.log.error({ err }, "Failed to get bot");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
