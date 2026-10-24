import express from "express";

import {
  approveProduct,
  rejectProduct,
} from "../controllers/adminProductController.js";

import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.patch(
  "/:id/approve",
  protect,
  adminOnly,
  approveProduct
);

router.patch(
  "/:id/reject",
  protect,
  adminOnly,
  rejectProduct
);

export default router;