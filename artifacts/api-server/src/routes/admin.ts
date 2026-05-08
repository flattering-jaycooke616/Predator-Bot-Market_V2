import { Router } from "express";
import { db } from "@lintshiwe/db";
import { botsTable, purchasesTable } from "@lintshiwe/db";
import { eq } from "drizzle-orm";
import { getAuth, clerkClient } from "@clerk/express";
import { AdminCreateBotBody, AdminUpdateBotBody, AdminUpdateBotParams, AdminDeleteBotParams, AdminVerifyPurchaseParams } from "@lintshiwe/api-zod";

const router = Router();

async function requireAdmin(req: any, res: any, next: any) {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const user = await clerkClient.users.getUser(userId);
    const role = user.publicMetadata?.role;
    if (role !== "admin") return res.status(403).json({ error: "Forbidden: admin only" });
    (req as any).userId = userId;
    return next();
  } catch (err) {
    return res.status(403).json({ error: "Forbidden" });
  }
}

router.post("/admin/bots", requireAdmin, async (req, res) => {
  try {
    const parsed = AdminCreateBotBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid request body" });

    const data = parsed.data;
    const [bot] = await db
      .insert(botsTable)
      .values({
        ...data,
        price: String(data.price),
        features: data.features ?? [],
        featured: data.featured ?? false,
        active: data.active ?? true,
      })
      .returning();

    return res.status(201).json({ ...bot, price: parseFloat(bot.price), features: bot.features ?? [] });
  } catch (err) {
    req.log.error({ err }, "Failed to create bot");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/admin/bots/:id", requireAdmin, async (req, res) => {
  try {
    const paramParsed = AdminUpdateBotParams.safeParse({ id: Number(req.params.id) });
    if (!paramParsed.success) return res.status(400).json({ error: "Invalid id" });

    const bodyParsed = AdminUpdateBotBody.safeParse(req.body);
    if (!bodyParsed.success) return res.status(400).json({ error: "Invalid request body" });

    const data = bodyParsed.data;
    const [bot] = await db
      .update(botsTable)
      .set({
        ...data,
        price: String(data.price),
        features: data.features ?? [],
        updatedAt: new Date(),
      })
      .where(eq(botsTable.id, paramParsed.data.id))
      .returning();

    if (!bot) return res.status(404).json({ error: "Bot not found" });

    return res.json({ ...bot, price: parseFloat(bot.price), features: bot.features ?? [] });
  } catch (err) {
    req.log.error({ err }, "Failed to update bot");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/admin/bots/:id", requireAdmin, async (req, res) => {
  try {
    const parsed = AdminDeleteBotParams.safeParse({ id: Number(req.params.id) });
    if (!parsed.success) return res.status(400).json({ error: "Invalid id" });

    await db.delete(botsTable).where(eq(botsTable.id, parsed.data.id));

    return res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete bot");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/admin/purchases", requireAdmin, async (req, res) => {
  try {
    const purchases = await db.query.purchasesTable.findMany({
      with: { bot: true },
      orderBy: (p, { desc }) => [desc(p.createdAt)],
    });

    return res.json(
      purchases.map((p) => ({
        ...p,
        amountPaid: parseFloat(p.amountPaid),
        bot: p.bot ? { ...p.bot, price: parseFloat(p.bot.price), features: p.bot.features ?? [] } : undefined,
      }))
    );
  } catch (err) {
    req.log.error({ err }, "Failed to list purchases");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/admin/purchases/:id/verify", requireAdmin, async (req, res) => {
  try {
    const parsed = AdminVerifyPurchaseParams.safeParse({ id: Number(req.params.id) });
    if (!parsed.success) return res.status(400).json({ error: "Invalid purchase id" });

    const [purchase] = await db
      .update(purchasesTable)
      .set({ status: "completed" })
      .where(eq(purchasesTable.id, parsed.data.id))
      .returning();

    if (!purchase) return res.status(404).json({ error: "Purchase not found" });

    return res.json({
      ...purchase,
      amountPaid: parseFloat(purchase.amountPaid),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to verify purchase");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/admin/purchases/:id/reject", requireAdmin, async (req, res) => {
  try {
    const parsed = AdminVerifyPurchaseParams.safeParse({ id: Number(req.params.id) });
    if (!parsed.success) return res.status(400).json({ error: "Invalid purchase id" });

    const [purchase] = await db
      .update(purchasesTable)
      .set({ status: "refunded" })
      .where(eq(purchasesTable.id, parsed.data.id))
      .returning();

    if (!purchase) return res.status(404).json({ error: "Purchase not found" });

    return res.json({
      ...purchase,
      amountPaid: parseFloat(purchase.amountPaid),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to reject purchase");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
