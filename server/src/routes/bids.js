import { Router } from "express";
import bidsController from "../controllers/bidsController.js";

const router = Router();

router.get("/", bidsController.getBids);
router.post("/", bidsController.createBid);
router.put("/:bidId", bidsController.updateBidStatusAPI); // For testing
router.delete("/:bidId", bidsController.deleteBid);

export default router;