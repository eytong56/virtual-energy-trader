import { Router } from "express";
import bidsController from "../controllers/bidsController.js";

const router = Router();

router.get("/", bidsController.getBids);
router.post("/", bidsController.createBid);

export default router;