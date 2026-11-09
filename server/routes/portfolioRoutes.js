import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { getPortfolio, updatePortfolio } from "../controllers/portfolioController.js";

const router = express.Router();
router.get("/", authMiddleware, getPortfolio);
router.put("/", authMiddleware, updatePortfolio);
export default router;
