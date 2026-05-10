import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";

const client = new ConvexHttpClient("https://harmless-gazelle-457.convex.cloud");

async function main() {
  try {
    const bots = await client.query(api.bots.list, {});
    
    for (const bot of bots) {
      await client.mutation(api.admin.updateBot, {
        id: bot._id,
        currency: "ZAR",
      });
      console.log(`Updated ${bot.name} to ZAR`);
    }
    
    console.log("✅ All bots updated to ZAR!");
  } catch (err) {
    console.error("Error:", err.message);
  }
}

main();
