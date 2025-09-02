import "dotenv/config";
import pool from "../config/database.js";

// Get all contracts (API endpoint)
async function getContracts(date, status) {
  const result = await pool.query(
    "SELECT * FROM contracts WHERE market_date = $1 AND status = $2 ORDER BY hour_slot ASC",
    [date, status]
  );
  return result.rows;
}

// Get active contracts (used by settlement jobs)
async function getActiveContracts() {
  try {
    const result = await pool.query(
      "SELECT * FROM contracts WHERE status = 'active' ORDER BY market_date ASC, hour_slot ASC"
    );
    return result.rows;
  } catch (error) {
    console.error("Error fetching active contracts:", error);
    throw error;
  }
}

// Create contract from filled bid (used by bid clearing jobs)
async function createContract(bidData, clearingPrice) {
  try {
    const userId = process.env.SAMPLE_USER;
    if (!userId) {
      throw new Error("SAMPLE_USER environment variable is not set");
    }
    const positionType = bidData.bid_type === "buy" ? "long" : "short";
    const { market_date, hour_slot, quantity } = bidData;
    const result = await pool.query(
      "INSERT INTO contracts (user_id, market_date, hour_slot, position_type, quantity, clearing_price",
      [userId, market_date, hour_slot, positionType, quantity, clearingPrice]
    );
    return result.rows[0];
  } catch (error) {
    console.error("Error creating contract:", error);
    throw error;
  }
}

// Update contract status when settled
async function updateContractStatus(contractId, status) {
  try {
    const result = await pool.query(
      "UPDATE contracts SET status = $1 WHERE id = $2 RETURNING *",
      [status, contractId]
    );
    if (result.rows.length === 0) {
      throw new Error(`Contract with id ${contractId} not found`)
    }
    return result.rows[0];
  } catch (error) {
    console.error("Error updating contract status:", error);
    throw error;
  }
}



export default {
  getContracts,
  getActiveContracts,
  createContract,
  updateContractStatus
};
