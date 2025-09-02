import "dotenv/config";
import pool from "../config/database.js";

async function getSettlements(date) {
  const result = await pool.query(
    "SELECT * FROM settlements WHERE settlement_time::DATE = $1::DATE ORDER BY settlement_time ASC",
    [date]
  );
  return result.rows;
}

export default {
  getSettlements,
};
