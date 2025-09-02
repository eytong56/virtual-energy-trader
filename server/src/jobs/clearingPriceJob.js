import cron from "node-cron";
import clearingPriceService from "../services/clearingPriceService.js";

async function start() {
  cron.schedule("0 9 * * *", async () => {
    try {
      // Fetch today's prices
      const today = new Date().toISOString().split("T")[0];
      await clearingPriceService.fetchAndStoreClearingPrices(today);

      // Add delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Also backfill any missing prices
      await clearingPriceService.backfillMissingPrices();
    } catch (error) {
      console.error("Clearing price fetch job failed:", error);
    }
  });
}

async function runOnce() {
  try {
    // Fetch today's prices
    const today = new Date().toISOString().split("T")[0];
    await clearingPriceService.fetchAndStoreClearingPrices(today);

    // Add delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Also backfill any missing prices
    await clearingPriceService.backfillMissingPrices();
  } catch (error) {
    console.error("Clearing price fetch job failed:", error);
  }
}

export default { start, runOnce };
