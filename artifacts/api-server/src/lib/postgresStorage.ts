import { db } from "@lintshiwe/db";
import { filesTable } from "@lintshiwe/db";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

export class ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
    Object.setPrototypeOf(this, ObjectNotFoundError.prototype);
  }
}

export class PostgresStorageService {
  async uploadFile(
    filename: string,
    contentType: string,
    data: Buffer,
  ): Promise<string> {
    const id = randomUUID();
    const path = `/files/${id}/${filename}`;

    await db.insert(filesTable).values({
      path,
      filename,
      contentType,
      size: data.length,
      data: data.toString("base64"),
    });

    return path;
  }

  async getFile(path: string) {
    const [file] = await db
      .select()
      .from(filesTable)
      .where(eq(filesTable.path, path));

    if (!file) {
      throw new ObjectNotFoundError();
    }

    return file;
  }

  async getFileResponse(path: string, cacheTtlSec: number = 3600): Promise<Response> {
    const file = await this.getFile(path);
    const buffer = Buffer.from(file.data, "base64");

    const headers: Record<string, string> = {
      "Content-Type": file.contentType,
      "Cache-Control": `public, max-age=${cacheTtlSec}`,
      "Content-Length": String(file.size),
    };

    return new Response(buffer, { headers });
  }

  async deleteFile(path: string): Promise<void> {
    await db.delete(filesTable).where(eq(filesTable.path, path));
  }
}
