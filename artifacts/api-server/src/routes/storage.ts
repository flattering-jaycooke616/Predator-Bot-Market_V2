import { Router, type IRouter, type Request, type Response } from "express";
import { PostgresStorageService, ObjectNotFoundError } from "../lib/postgresStorage";

const router: IRouter = Router();
const storageService = new PostgresStorageService();

/**
 * POST /storage/uploads
 *
 * Upload a file directly to PostgreSQL.
 * The client sends multipart/form-data with the file.
 */
router.post("/storage/uploads", async (req: Request, res: Response) => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    const file = req.files[0] as Express.Multer.File;
    const path = await storageService.uploadFile(
      file.originalname,
      file.mimetype,
      file.buffer,
    );

    res.json({ path, filename: file.originalname });
  } catch (error) {
    req.log.error({ err: error }, "Error uploading file");
    res.status(500).json({ error: "Failed to upload file" });
  }
});

/**
 * GET /storage/files/*
 *
 * Serve files from PostgreSQL.
 */
router.get("/storage/files/*filePath", async (req: Request, res: Response) => {
  try {
    const raw = req.params.filePath;
    const filePath = Array.isArray(raw) ? raw.join("/") : raw;

    const response = await storageService.getFileResponse(filePath);

    res.status(response.status);
    response.headers.forEach((value, key) => res.setHeader(key, value));

    if (response.body) {
      const nodeStream = require("stream").Readable.fromWeb(response.body as ReadableStream<Uint8Array>);
      nodeStream.pipe(res);
    } else {
      res.end();
    }
  } catch (error) {
    if (error instanceof ObjectNotFoundError) {
      res.status(404).json({ error: "File not found" });
      return;
    }
    req.log.error({ err: error }, "Error serving file");
    res.status(500).json({ error: "Failed to serve file" });
  }
});

/**
 * DELETE /storage/files/*
 *
 * Delete a file from PostgreSQL (admin only).
 */
router.delete("/storage/files/*filePath", async (req: Request, res: Response) => {
  try {
    const raw = req.params.filePath;
    const filePath = Array.isArray(raw) ? raw.join("/") : raw;

    await storageService.deleteFile(filePath);
    res.status(204).send();
  } catch (error) {
    if (error instanceof ObjectNotFoundError) {
      res.status(404).json({ error: "File not found" });
      return;
    }
    req.log.error({ err: error }, "Error deleting file");
    res.status(500).json({ error: "Failed to delete file" });
  }
});

export default router;
