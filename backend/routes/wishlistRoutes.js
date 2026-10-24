import express from "express";

import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  clearWishlist,
} from "../controllers/wishlistController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get user's wishlist
router.get("/", protect, getWishlist);

// Add product to wishlist
router.post("/:productId", protect, addToWishlist);

// Remove product from wishlist
router.delete("/:productId", protect, removeFromWishlist);

// Clear entire wishlist
router.delete("/", protect, clearWishlist);

export default router;