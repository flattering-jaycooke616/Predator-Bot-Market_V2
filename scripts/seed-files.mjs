import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";
import { readFileSync } from "fs";

const client = new ConvexHttpClient("https://harmless-gazelle-457.convex.cloud");

async function uploadFile(filePath) {
  const fileName = filePath.split("/").pop();
  console.log(`Uploading: ${fileName}`);

  const fileBuffer = readFileSync(filePath);
  const blob = new Blob([fileBuffer], { type: "application/octet-stream" });

  const uploadUrl = await client.mutation(api.storage.generateUploadUrl);
  
  const result = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": "application/octet-stream" },
    body: blob,
  });

  if (!result.ok) {
    throw new Error(`Upload failed: ${result.status} ${result.statusText}`);
  }

  const { storageId } = await result.json();
  console.log(`  ✓ Storage ID: ${storageId}`);
  return storageId;
}

async function main() {
  try {
    const fileMap = {
      "predator-x9000-ea": "/home/ntoampi/Downloads/PREDATOR_X9000_EA.mq4",
      "predator-x9000-ea-v2": "/home/ntoampi/Downloads/PREDATOR_X9000_EA_V2.mq4",
      "nasdaq-trend-follower-ea": "/home/ntoampi/Downloads/NASDAQ_TREND_FOLLOWER_EA.mq4",
    };

    for (const [slug, filePath] of Object.entries(fileMap)) {
      try {
        const fileStorageId = await uploadFile(filePath);
        
        await client.mutation(api.seedfiles.seedBotFiles, {
          botSlug: slug,
          fileStorageId,
        });
        
        console.log(`  ✓ Updated ${slug} with file\n`);
      } catch (err) {
        console.error(`  ✗ Failed for ${slug}: ${err.message}\n`);
      }
    }

    console.log("✅ Done!");
  } catch (err) {
    console.error("Error:", err.message);
  }
}

main();
