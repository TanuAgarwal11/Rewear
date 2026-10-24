
import express from "express";

import {
  createRental,
  getMyRentals,
  getRentalRequests,
  confirmRental,
  rejectRental,
  cancelRental,
  activateRental,
  completeRental,
  returnRental,
  requestReturn,
  settleDeposit,
} from "../controllers/rentalController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create a rental request
router.post("/", protect, createRental);

// View rentals and incoming requests
router.get("/my", protect, getMyRentals);
router.get("/requests", protect, getRentalRequests);

// Owner actions
router.put("/:id/confirm", protect, confirmRental);
router.put("/:id/reject", protect, rejectRental);
router.put("/:id/activate", protect, activateRental);
router.put("/:id/complete", protect, completeRental);
router.put("/:id/return", protect, returnRental);
router.put("/:id/settle-deposit", protect, settleDeposit);

// Renter actions
router.put("/:id/cancel", protect, cancelRental);
router.put("/:id/request-return", protect, requestReturn);

export default router;
