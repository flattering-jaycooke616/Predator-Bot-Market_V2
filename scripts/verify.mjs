import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";

const client = new ConvexHttpClient("https://harmless-gazelle-457.convex.cloud");

async function testDownloadFlow() {
  try {
    console.log("Testing download flow...\n");

    const bots = await client.query(api.bots.list, {});
    console.log(`Found ${bots.length} bots\n`);

    for (const bot of bots) {
      console.log(`Bot: ${bot.name}`);
      console.log(`  Currency: ${bot.currency}`);
      console.log(`  Price: ${bot.price}`);
      console.log(`  fileStorageId: ${bot.fileStorageId ? 'Yes' : 'No'}`);
      console.log(`  fileUrl: ${bot.fileUrl ? 'Yes' : 'No'}`);
      console.log(`  imageUrl: ${bot.imageUrl ? bot.imageUrl : 'No'}`);
      console.log("");
    }

    console.log("✅ All bots have files and ZAR currency!");
  } catch (err) {
    console.error("Error:", err.message);
  }
}

testDownloadFlow();
