
import mongoose from "mongoose";

const rentalSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    renter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    securityDeposit: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Rental status
    status: {
      type: String,
      enum: [
        "PENDING",
        "CONFIRMED",
        "ACTIVE",
        "COMPLETED",
        "CANCELLED",
        "REJECTED",
        "RETURN_REQUESTED",
        "RETURNED",
      ],
      default: "PENDING",
    },

    // Return details
    returnRequestedAt: {
      type: Date,
    },

    returnedAt: {
      type: Date,
    },

    // Security deposit settlement
    depositRefundStatus: {
      type: String,
      enum: [
        "PENDING",
        "REFUNDED",
        "PARTIALLY_REFUNDED",
        "FORFEITED",
      ],
      default: "PENDING",
    },

    depositRefundAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    depositDeduction: {
      type: Number,
      default: 0,
      min: 0,
    },

    damageDescription: {
      type: String,
      trim: true,
    },

    returnApprovedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const Rental = mongoose.model("Rental", rentalSchema);

export default Rental;