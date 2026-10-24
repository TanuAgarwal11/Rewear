import express from "express";

import {
  createPayment,
  markPaymentSuccess,
  getPaymentById,
} from "../controllers/paymentController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createPayment);

router.get("/:id", protect, getPaymentById);

router.put("/:id/success", protect, markPaymentSuccess);

export default router;