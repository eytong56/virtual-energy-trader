import Bid from "../models/Bid.js";

async function getBids(req, res) {
  try {
    const bids = await Bid.getBids(req.query.date);
    res.json(bids);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function createBid(req, res) {
  try {
    const { market_date, hour_slot, bid_type, price, quantity } = req.body;
    const market_date_iso = new Date(market_date).toISOString();
    const bid = await Bid.createBid({
      market_date: market_date_iso,
      hour_slot,
      bid_type,
      price,
      quantity,
    });
    res.status(201).json(bid);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function updateBidStatusAPI(req, res) {
  try {
    const { bidId } = req.params;
    const { status } = req.body;
    if (!["pending", "filled", "rejected"].includes(status)) {
      return res
        .status(400)
        .json({
          error: "Invalid bid status, must be pending, filled, or rejected",
        });
    }
    const updatedBid = await Bid.updateBidStatus(bidId, status);
    res.json(updatedBid);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function deleteBid(req, res) {
  res.send("Not yet implemented");
}

export default {
  getBids,
  createBid,
  updateBidStatusAPI,
  deleteBid,
};
