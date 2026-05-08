import { db } from "./src/index";
import { botsTable } from "./src/schema/bots";

const sampleBots = [
  {
    name: "Predator Scalper Pro",
    slug: "predator-scalper-pro",
    description: "High-frequency scalping bot optimized for tight spreads and low latency execution.",
    longDescription: "The Predator Scalper Pro is designed for traders who want to capitalize on small price movements. Using advanced algorithms, it enters and exits trades within seconds, maximizing profit from market volatility while maintaining strict risk management.",
    price: "149.99",
    currency: "USD",
    category: "Scalping",
    features: ["Sub-second execution", "Multi-pair support", "Dynamic stop-loss", "News filter"],
    imageUrl: "",
    featured: true,
    active: true,
  },
  {
    name: "Predator Trend Follower",
    slug: "predator-trend-follower",
    description: "Swing trading bot that identifies and follows strong market trends across multiple timeframes.",
    longDescription: "This bot uses a combination of moving averages, ADX, and custom indicators to identify strong trending markets. It holds positions for hours to days, capturing the bulk of market moves while avoiding choppy conditions.",
    price: "199.99",
    currency: "USD",
    category: "Swing Trading",
    features: ["Multi-timeframe analysis", "Trailing stop", "Trend strength filter", "Auto lot sizing"],
    imageUrl: "",
    featured: true,
    active: true,
  },
  {
    name: "Predator Grid Master",
    slug: "predator-grid-master",
    description: "Grid trading bot that profits from ranging markets with intelligent order placement.",
    longDescription: "The Grid Master creates a network of buy and sell orders at predefined intervals. When the market ranges, it captures profit from each oscillation. Smart grid spacing adapts to market volatility for optimal performance.",
    price: "99.99",
    currency: "USD",
    category: "Grid Trading",
    features: ["Adaptive grid spacing", "Hedging mode", "Drawdown protection", "Profit target"],
    imageUrl: "",
    featured: false,
    active: true,
  },
  {
    name: "Predator News Trader",
    slug: "predator-news-trader",
    description: "Event-driven bot that trades high-impact news releases with precision timing.",
    longDescription: "This bot monitors economic calendars and executes trades milliseconds after major news releases. Built-in spread protection and slippage control ensure safe execution during high-volatility events.",
    price: "249.99",
    currency: "USD",
    category: "News Trading",
    features: ["Economic calendar integration", "Spread protection", "Slippage control", "Multiple strategies"],
    imageUrl: "",
    featured: true,
    active: true,
  },
  {
    name: "Predator Arbitrage",
    slug: "predator-arbitrage",
    description: "Cross-broker arbitrage bot that exploits price discrepancies between liquidity providers.",
    longDescription: "The Arbitrage bot monitors price feeds from multiple brokers and executes trades when significant price differences are detected. Requires two MT4 terminals running simultaneously for optimal performance.",
    price: "349.99",
    currency: "USD",
    category: "Arbitrage",
    features: ["Cross-broker execution", "Latency monitoring", "Auto-sync", "Risk management"],
    imageUrl: "",
    featured: false,
    active: true,
  },
  {
    name: "Predator Breakout Hunter",
    slug: "predator-breakout-hunter",
    description: "Breakout detection bot that catches explosive moves from key support and resistance levels.",
    longDescription: "This bot identifies consolidation zones and places pending orders above and below key levels. When price breaks out with volume confirmation, it enters the trade with a tight stop-loss for optimal risk-reward.",
    price: "179.99",
    currency: "USD",
    category: "Breakout",
    features: ["Support/resistance detection", "Volume confirmation", "Pending order management", "Breakout retest entry"],
    imageUrl: "",
    featured: false,
    active: true,
  },
];

async function seed() {
  console.log("Seeding database...");

  const existing = await db.select().from(botsTable);
  if (existing.length > 0) {
    console.log("Database already seeded, skipping.");
    return;
  }

  await db.insert(botsTable).values(sampleBots);
  console.log(`Inserted ${sampleBots.length} bots.`);
}

seed()
  .then(() => {
    console.log("Seed complete.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
