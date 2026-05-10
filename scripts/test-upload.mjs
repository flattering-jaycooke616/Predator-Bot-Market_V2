import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import { readFileSync } from "fs";

const client = new ConvexHttpClient("https://harmless-gazelle-457.convex.cloud");

async function testFullFlow() {
  try {
    console.log("Testing full upload flow...\n");

    const filePath = "/home/ntoampi/Downloads/PREDATOR_X9000_EA.mq4";
    const fileName = filePath.split("/").pop();
    const fileBuffer = readFileSync(filePath);
    const blob = new Blob([fileBuffer], { type: "application/octet-stream" });

    console.log("1. Getting upload URL...");
    const uploadUrl = await client.mutation(api.storage.generateUploadUrl);

    console.log("2. Uploading file...");
    const result = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": "application/octet-stream" },
      body: blob,
    });

    if (!result.ok) {
      console.log(`   ✗ Upload failed: ${result.status}`);
      return;
    }

    const { storageId } = await result.json();
    console.log(`   ✓ Storage ID: ${storageId}`);

    console.log("3. Storing file metadata...");
    await client.mutation(api.storage.storeFile, {
      storageId,
      path: `/files/${fileName}`,
      filename: fileName,
      contentType: "application/octet-stream",
      size: fileBuffer.length,
    });
    console.log("   ✓ Metadata stored");

    console.log("4. Getting file URL...");
    const fileData = await client.mutation(api.storage.getFile, { path: `/files/${fileName}` });
    console.log(`   ✓ URL: ${fileData.url ? 'Generated' : 'Missing'}`);

    console.log("\n✅ Full flow working!");
  } catch (err) {
    console.error("Error:", err.message);
    console.error(err);
  }
}

testFullFlow();
