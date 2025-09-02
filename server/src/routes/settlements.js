import { Router } from "express";
import settlementsController from "../controllers/settlementsController.js";

const router = Router();

router.get("/", settlementsController.getSettlements);
router.get("/pnl", settlementsController.getTotalPnL);

export default router;