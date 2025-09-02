import gridStatusService from "../services/gridStatusService.js";

// Calculate P&L for a contract given real-time price
function calculatePnL(contract, rtPrice) {
  const { position_type, quantity, clearing_price } = contract;

  let pnlPerMWh;

  if (position_type === "long") {
    // Long = buy, profit when rt_price > clearing_price
    pnlPerMWh = rtPrice - clearing_price;
  } else {
    // Short = sell, profit when rt_price < clearing_price
    pnlPerMWh = clearing_price - rtPrice;
  }

  return pnlPerMWh * quantity;
}


