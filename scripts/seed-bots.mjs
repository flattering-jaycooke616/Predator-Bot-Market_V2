import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api.js";

const CONVEX_URL = "https://harmless-gazelle-457.convex.cloud";
const client = new ConvexHttpClient(CONVEX_URL);

const bots = [
  {
    name: "PREDATOR X9000 EA",
    slug: "predator-x9000-ea",
    price: 97,
    currency: "USD",
    category: "Trend & Momentum EA",
    description: "A high-precision MetaTrader 4 Expert Advisor engineered for Indices, Gold, and Forex on the H1 timeframe. Powered by a 4-step signal gate and 5-indicator confluence engine, it only fires when market conditions are genuinely aligned — blocking noise before it becomes a loss.",
    longDescription: `<h2>The Hunter Doesn't Miss Twice</h2>
<p>PREDATOR X9000 EA is a fully automated MetaTrader 4 Expert Advisor built for serious traders who demand precision over frequency.</p>
<h3>4-Step Signal Gate</h3>
<p>Every trade must pass all four gates: Daily ATR Gate, Market Regime Gate, 5/5 Full Confluence, and M15 Sniper Mode.</p>
<h3>5-Indicator Confluence Engine</h3>
<p>Trend (MA200), SuperTrend, EMA 21/50 crossover, RSI, and ADX must all agree before the bot acts.</p>
<h3>Adaptive Risk Management</h3>
<p>ATR-based stop loss and take profit with multi-stage trailing stop. Intelligent loss defence and adaptive memory system.</p>`,
    features: [
      "4-Step signal gate (ATR Gate → Regime Gate → 5/5 Confluence → M15 Sniper)",
      "Market Regime Score (0–100) blocks low-quality market conditions",
      "5-indicator confluence: MA200, SuperTrend, EMA 21/50, RSI, ADX",
      "ATR-based SL/TP with 2:1 minimum risk-reward",
      "Multi-stage adaptive trailing stop",
      "Anti-loss automation and adaptive memory",
      "Works on Indices, Gold, and Forex — H1 timeframe",
    ],
    featured: true,
    active: true,
  },
  {
    name: "PREDATOR X9000 EA V2",
    slug: "predator-x9000-ea-v2",
    price: 127,
    currency: "USD",
    category: "Trend & Momentum EA",
    description: "The evolved version of the PREDATOR X9000. V2 retains the full 4-step signal gate but adds an Immediate Growth Buy system for early breakout entries and an Auto Credit Upgrade that progressively scales lot sizes as the account grows.",
    longDescription: `<h2>Same Predator. Sharper Instincts.</h2>
<p>PREDATOR X9000 EA V2 builds on the proven 4-step signal gate architecture, adding two powerful new growth systems.</p>
<h3>Immediate Growth Buy System</h3>
<p>Early-breakout entry mode that triggers at a lower ATR threshold, confirmed by RSI, ADX, and Regime Score.</p>
<h3>Auto Credit Upgrade</h3>
<p>Automatic lot size escalation system that rewards winning streaks — up to 1.5x. Credits reset on drawdown.</p>`,
    features: [
      "All features from PREDATOR X9000 EA V1",
      "NEW: Immediate Growth Buy — early breakout entry",
      "NEW: Auto Credit Upgrade — automatic lot scaling (up to 1.5x)",
      "4-Step signal gate with Market Regime Score",
      "5-indicator confluence engine",
      "ATR-based SL/TP with multi-stage trailing stop",
      "Adaptive memory with live win-rate tracking",
    ],
    featured: true,
    active: true,
  },
  {
    name: "NASDAQ Trend Follower EA",
    slug: "nasdaq-trend-follower-ea",
    price: 67,
    currency: "USD",
    category: "Trend Following EA",
    description: "A clean, rules-based MetaTrader 4 EA that trades five major markets — NAS100, US30, SP500, XAUUSD, and GER40 — on the H4 timeframe. Four indicators must fully agree before any trade is placed. No grid. No martingale.",
    longDescription: `<h2>Trend First. Always.</h2>
<p>Only trade when the trend is undeniable. Four independent indicators must all point in the same direction simultaneously.</p>
<h3>4/4 Full Confluence Required</h3>
<p>EMA 20/50/200, MACD, ADX, and RSI must all agree. ATR-based risk control with 1:2 minimum risk-reward ratio.</p>
<h3>Multi-Market Coverage</h3>
<p>One EA, five markets. Run on NAS100, US30, SP500, XAUUSD, and GER40 simultaneously.</p>`,
    features: [
      "4/4 full confluence: EMA 20/50/200 + MACD + ADX + RSI",
      "Trades 5 markets: NAS100, US30, SP500, XAUUSD, GER40",
      "Optimised for H4 timeframe",
      "ATR-based stop loss (2x) and take profit (4x)",
      "1:2 minimum risk-reward ratio",
      "Live black & gold on-chart dashboard",
      "No grid, no martingale — pure trend following",
    ],
    featured: false,
    active: true,
  },
];

async function main() {
  console.log("Seeding Convex database with bots...\n");

  for (const bot of bots) {
    console.log(`\n--- ${bot.name} ---`);

    try {
      await client.mutation(api.admin.createBot, {
        name: bot.name,
        slug: bot.slug,
        description: bot.description,
        longDescription: bot.longDescription,
        price: bot.price,
        currency: bot.currency,
        category: bot.category,
        features: bot.features,
        imageUrl: "",
        featured: bot.featured,
        active: bot.active,
      });

      console.log(`  ✓ Created bot: ${bot.name}`);
    } catch (err) {
      console.error(`  ✗ Failed: ${err.message}`);
    }
  }

  console.log("\n✅ Done!");
}

main().catch(console.error);
