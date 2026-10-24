
import express from "express";

import {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../controllers/addressController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get all addresses
router.get("/", getAddresses);

// Add a new address
router.post("/", addAddress);

// Update an address
router.put("/:id", updateAddress);

// Delete an address
router.delete("/:id", deleteAddress);

// Set default address
router.patch("/:id/default", setDefaultAddress);

export default router;
