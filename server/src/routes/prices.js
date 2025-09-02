import { Router } from "express";
import pricesController from "../controllers/pricesController.js";

const router = Router();

router.get("/current", pricesController.getCurrentPrice);

export default router;