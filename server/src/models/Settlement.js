import "dotenv/config";
import pool from "../config/database.js";

async function getSettlements() {
  const result = await pool.query(
    "SELECT * FROM settlements ORDER BY settlement_time DESC"
  );
  return result.rows;
}

// Create settlement from settled contract (used by settlement jobs)
async function createSettlement(contractData, settlementTime, rtPrice, pnl) {
  try {
    const result = await pool.query(
      "INSERT INTO settlements (contract_id, settlement_time, rt_price, pnl_amount) VALUES ($1, $2, $3, $4) RETURNING *",
      [contractData.id, settlementTime, rtPrice, pnl]
    );
    return result.rows[0];
  } catch (error) {
    console.error("Error creating settlement:", error);
    throw error;
  }
}

async function getTotalPnL(date) {
  try {
    if (date) {
      const result = await pool.query(
        "SELECT COALESCE(SUM(pnl_amount), 0) AS daily_pnl FROM settlements WHERE settlement_time::DATE = $1",
        [date]
      );
      return result.rows[0];
    } else {
      const result = await pool.query(
        "SELECT COALESCE(SUM(pnl_amount), 0) AS total_pnl FROM settlements"
      );
      return result.rows[0];
    }
  } catch (error) {
    console.error("Error calculating total pnl:", error);
    throw error;
  }
}

// Check if settlement already exists for this contract and time
async function checkSettlementExists(contractId, settlementTime) {
  try {
    const result = await pool.query(
      "SELECT id FROM settlements WHERE contract_id = $1 AND settlement_time = $2",
      [contractId, settlementTime]
    );

    return result.rows.length > 0;
  } catch (error) {
    console.error("Error checking settlement existence:", error);
    return false;
  }
}

// Check if contract is fully settled
async function checkFullySettled(contractId) {
  try {
    const result = await pool.query(
      "SELECT id FROM settlements WHERE contract_id = $1",
      [contractId]
    );
    console.log(result.rows);
    return result.rows.length >= 12;
  } catch (error) {
    console.error("Error checking settlement full:", error);
    return false;
  }
}

export default {
  getSettlements,
  createSettlement,
  getTotalPnL,
  checkSettlementExists,
  checkFullySettled,
};
