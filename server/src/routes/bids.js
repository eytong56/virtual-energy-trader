import { Router } from "express";
import bidsController from "../controllers/bidsController.js";

const router = Router();

router.get("/", bidsController.getBids);
router.post("/", bidsController.createBid);
router.put("/:id", bidsController.updateBid);
router.delete("/:id", bidsController.deleteBid);

export default router;