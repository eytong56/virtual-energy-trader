import pool from "../config/database.js";
import gridStatusService from "./gridStatusService.js";

// Fetch clearing prices for specific date and store in database
async function fetchAndStoreClearingPrices(marketDate) {
  try {
    console.log(`Fetching clearing prices for ${marketDate}`);

    const dayAheadPrices = await gridStatusService.getDayAheadPrices(
      marketDate
    );

    for (const hourData of dayAheadPrices) {
      await pool.query(
        `
          INSERT INTO clearing_prices (market_date, hour_slot, clearing_price)
          VALUES ($1, $2, $3)
          ON CONFLICT (market_date, hour_slot)
          DO NOTHING
        `,
        [marketDate, hourData.hourSlot, hourData.clearingPrice]
      );
    }
    console.log(
      `Stored ${dayAheadPrices.length} clearing prices for ${marketDate}`
    );
  } catch (error) {
    console.error(`Error fetching clearing prices for ${marketDate}:`, error);
    throw error;
  }
}

// Get clearing price from database
async function getClearingPrice(marketDate, hourSlot) {
  try {
    const result = await pool.query(
      "SELECT clearing_price FROM clearing_prices WHERE market_date = $1 AND hour_slot = $2",
      [marketDate, hourSlot]
    );
    return result.rows.length > 0
      ? parseFloat(result.rows[0].clearing_price)
      : null;
  } catch (error) {
    console.error("Error getting clearing price from database:", error);
    return null;
  }
}

async function backfillMissingPrices() {
  try {
    // Find dates with pending bids that don't have clearing prices
    const result = await pool.query(`
        SELECT DISTINCT b.market_date, b.hour_slot
        FROM bids b
        LEFT JOIN clearing_prices cp ON b.market_date = cp.market_date 
                                   AND b.hour_slot = cp.hour_slot
        WHERE b.status = 'pending' 
          AND cp.clearing_price IS NULL
        ORDER BY b.market_date, b.hour_slot
      `);

    const missingPrices = result.rows;
    console.log(`Found ${missingPrices.length} missing clearing prices`);

    // Get only unique dates to minimize API calls
    const missingDates = new Set();
    missingPrices.forEach(({ market_date, hour_slot }) => {
      const dateStr = market_date.toISOString().split("T")[0];
      missingDates.add(dateStr);
    });

    // Fetch missing prices one day at a time
    for (const dateStr of missingDates) {
      try {
        await this.fetchAndStoreClearingPrices(dateStr);
        // Add delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`Failed to backfill prices for ${dateStr}:`, error);
        // Continue with other dates even if one fails
      }
    }
  } catch (error) {
    console.error("Error in backfill process:", error);
  }
}

export default {
  fetchAndStoreClearingPrices,
  getClearingPrice,
  backfillMissingPrices,
};
