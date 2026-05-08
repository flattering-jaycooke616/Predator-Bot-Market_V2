import { Router } from "express";
import { db } from "@lintshiwe/db";
import { botsTable, purchasesTable } from "@lintshiwe/db";
import { eq, and } from "drizzle-orm";
import { getAuth } from "@clerk/express";
import { CreatePurchaseBody, GetPurchaseParams, DownloadBotParams } from "@lintshiwe/api-zod";
import { getObjectStorageClient } from "../lib/objectStorage";

const DOWNLOAD_EXPIRY_HOURS = 5;

const router = Router();

function requireAuth(req: any, res: any, next: any) {
  const { userId } = getAuth(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  (req as any).userId = userId;
  return next();
}

router.get("/purchases", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId as string;

    const purchases = await db.query.purchasesTable.findMany({
      where: eq(purchasesTable.userId, userId),
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

router.post("/purchases", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId as string;
    const parsed = CreatePurchaseBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid request body" });

    const { botId, paymentReference } = parsed.data;

    const [bot] = await db.select().from(botsTable).where(eq(botsTable.id, botId));
    if (!bot) return res.status(404).json({ error: "Bot not found" });

    const [existing] = await db
      .select()
      .from(purchasesTable)
      .where(
        and(
          eq(purchasesTable.userId, userId),
          eq(purchasesTable.botId, botId),
          eq(purchasesTable.status, "completed")
        )
      );
    if (existing) return res.status(400).json({ error: "Already purchased this bot" });

    const [existingPending] = await db
      .select()
      .from(purchasesTable)
      .where(
        and(
          eq(purchasesTable.userId, userId),
          eq(purchasesTable.botId, botId),
          eq(purchasesTable.status, "pending")
        )
      );
    if (existingPending) return res.status(400).json({ error: "Purchase already pending verification" });

    const [purchase] = await db
      .insert(purchasesTable)
      .values({
        userId,
        botId,
        status: "pending",
        amountPaid: bot.price,
        paymentReference,
        maxDownloads: 2,
      })
      .returning();

    return res.status(201).json({
      ...purchase,
      amountPaid: parseFloat(purchase.amountPaid),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to create purchase");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/purchases/:id", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId as string;
    const parsed = GetPurchaseParams.safeParse({ id: Number(req.params.id) });
    if (!parsed.success) return res.status(400).json({ error: "Invalid id" });

    const purchase = await db.query.purchasesTable.findFirst({
      where: and(
        eq(purchasesTable.id, parsed.data.id),
        eq(purchasesTable.userId, userId)
      ),
      with: { bot: true },
    });

    if (!purchase) return res.status(404).json({ error: "Purchase not found" });

    return res.json({
      ...purchase,
      amountPaid: parseFloat(purchase.amountPaid),
      bot: purchase.bot ? { ...purchase.bot, price: parseFloat(purchase.bot.price), features: purchase.bot.features ?? [] } : undefined,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get purchase");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/downloads/:purchaseId", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId as string;
    const parsed = DownloadBotParams.safeParse({ purchaseId: Number(req.params.purchaseId) });
    if (!parsed.success) return res.status(400).json({ error: "Invalid purchase id" });

    const purchase = await db.query.purchasesTable.findFirst({
      where: and(
        eq(purchasesTable.id, parsed.data.purchaseId),
        eq(purchasesTable.userId, userId)
      ),
      with: { bot: true },
    });

    if (!purchase) return res.status(404).json({ error: "Purchase not found" });
    if (purchase.status !== "completed") return res.status(400).json({ error: "Purchase not yet verified by admin. Please wait for confirmation." });

    if (purchase.downloadCount >= purchase.maxDownloads) {
      return res.status(400).json({ error: "Download limit reached. You have used all 2 downloads for this bot." });
    }

    if (purchase.downloadCount === 1 && purchase.secondDownloadExpiresAt) {
      const now = new Date();
      if (now > purchase.secondDownloadExpiresAt) {
        return res.status(400).json({ error: `Your download window has expired. Download links expire ${DOWNLOAD_EXPIRY_HOURS} hours after first download.` });
      }
    }

    let secondDownloadExpiresAt = purchase.secondDownloadExpiresAt;
    if (purchase.downloadCount === 0) {
      const expiry = new Date();
      expiry.setHours(expiry.getHours() + DOWNLOAD_EXPIRY_HOURS);
      secondDownloadExpiresAt = expiry;
    }

    const newCount = purchase.downloadCount + 1;
    await db
      .update(purchasesTable)
      .set({
        downloadCount: newCount,
        secondDownloadExpiresAt,
      })
      .where(eq(purchasesTable.id, purchase.id));

    if (!purchase.bot?.fileObjectPath) {
      return res.status(400).json({ error: "Bot file not available yet. Contact support." });
    }

    let downloadUrl: string;
    const expiresAt = secondDownloadExpiresAt?.toISOString() ?? null;

    try {
      const storageClient = getObjectStorageClient();
      const parts = purchase.bot.fileObjectPath.slice(1).split("/");
      const entityId = parts.slice(1).join("/");
      let entityDir = process.env.PRIVATE_OBJECT_DIR || "";
      if (!entityDir.endsWith("/")) entityDir = `${entityDir}/`;
      const fullPath = `${entityDir}${entityId}`;
      const pathParts = fullPath.startsWith("/") ? fullPath.slice(1).split("/") : fullPath.split("/");
      const bucketName = pathParts[0];
      const objectName = pathParts.slice(1).join("/");

      const bucket = storageClient.bucket(bucketName);
      const file = bucket.file(objectName);
      const [signedUrl] = await file.getSignedUrl({
        version: "v4",
        action: "read",
        expires: Date.now() + DOWNLOAD_EXPIRY_HOURS * 60 * 60 * 1000,
      });
      downloadUrl = signedUrl;
    } catch {
      downloadUrl = `/api/storage/objects${purchase.bot.fileObjectPath.replace(/^\/objects/, "")}`;
    }

    return res.json({
      downloadUrl,
      downloadsRemaining: purchase.maxDownloads - newCount,
      expiresAt,
      expiryNotice: `This download link will expire in ${DOWNLOAD_EXPIRY_HOURS} hours.`,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to initiate download");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
