import express from "express";
import {
  register,
  login,
  demoLogin
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/demo", demoLogin);

export default router;