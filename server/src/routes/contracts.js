import { Router } from "express";
import contractsController from "../controllers/contractsController.js";

const router = Router();

router.get("/", contractsController.getContracts);

export default router;