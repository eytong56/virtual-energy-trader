import { Router } from "express";
import settlementsController from "../controllers/settlementsController.js";

const router = Router();

router.get("/", settlementsController.getSettlements);

export default router;