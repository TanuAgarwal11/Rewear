
import Rental from "../models/Rental.js";
import Product from "../models/Product.js";

// CREATE RENTAL
// POST /api/rentals

export const createRental = async (req, res) => {
  try {
    const { productId, startDate, endDate } = req.body;

    // 1. Check required fields
    if (!productId || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Product, start date and end date are required",
      });
    }

    // 2. Find product
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // 3. Product must be approved
    if (!product.isApproved) {
      return res.status(400).json({
        success: false,
        message: "Product is not approved for rental",
      });
    }

    // 4. User cannot rent their own product
    if (product.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot rent your own product",
      });
    }

    // 5. Convert dates
    const rentalStart = new Date(startDate);
    const rentalEnd = new Date(endDate);

    // 6. Validate dates
    if (
      isNaN(rentalStart.getTime()) ||
      isNaN(rentalEnd.getTime())
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid rental dates",
      });
    }

    if (rentalEnd <= rentalStart) {
      return res.status(400).json({
        success: false,
        message: "End date must be after start date",
      });
    }

    // 7. Prevent overlapping bookings
    const existingRental = await Rental.findOne({
      product: productId,
      status: {
        $in: [
          "PENDING",
          "CONFIRMED",
          "ACTIVE",
          "COMPLETED",
          "RETURN_REQUESTED",
        ],
      },
      startDate: { $lt: rentalEnd },
      endDate: { $gt: rentalStart },
    });

    if (existingRental) {
      return res.status(400).json({
        success: false,
        message: "Product is already rented for these dates",
      });
    }

    // 8. Calculate rental days
    const millisecondsPerDay = 1000 * 60 * 60 * 24;

    const rentalDays = Math.ceil(
      (rentalEnd - rentalStart) / millisecondsPerDay
    );

    // 9. Calculate total rental price
    const totalPrice = rentalDays * product.pricePerDay;

    // 10. Create rental
    const rental = await Rental.create({
      product: productId,
      renter: req.user._id,
      owner: product.owner,
      startDate: rentalStart,
      endDate: rentalEnd,
      totalPrice,
      securityDeposit: product.securityDeposit,
      status: "PENDING",
    });

    // 11. Send response
    res.status(201).json({
      success: true,
      message: "Rental request created successfully",
      rental,
    });
  } catch (error) {
    console.error("Create rental error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// GET MY RENTALS
// GET /api/rentals/my

export const getMyRentals = async (req, res) => {
  try {
    const rentals = await Rental.find({
      renter: req.user._id,
    })
      .populate("product", "name brand images pricePerDay")
      .populate("owner", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: rentals.length,
      rentals,
    });
  } catch (error) {
    console.error("Get my rentals error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// GET RENTAL REQUESTS FOR MY PRODUCTS
// GET /api/rentals/requests

export const getRentalRequests = async (req, res) => {
  try {
    const rentals = await Rental.find({
      owner: req.user._id,
    })
      .populate("product", "name images pricePerDay")
      .populate("renter", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: rentals.length,
      rentals,
    });
  } catch (error) {
    console.error("Get rental requests error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// CONFIRM RENTAL
// PUT /api/rentals/:id/confirm

export const confirmRental = async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id);

    if (!rental) {
      return res.status(404).json({
        success: false,
        message: "Rental not found",
      });
    }

    // Only owner can confirm
    if (rental.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the owner can confirm this rental",
      });
    }

    // Only PENDING can be confirmed
    if (rental.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: "Only pending rentals can be confirmed",
      });
    }

    rental.status = "CONFIRMED";
    await rental.save();

    res.status(200).json({
      success: true,
      message: "Rental confirmed successfully",
      rental,
    });
  } catch (error) {
    console.error("Confirm rental error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// REJECT RENTAL
// PUT /api/rentals/:id/reject

export const rejectRental = async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id);

    if (!rental) {
      return res.status(404).json({
        success: false,
        message: "Rental not found",
      });
    }

    // Only owner can reject
    if (rental.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the owner can reject this rental",
      });
    }

    if (rental.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: "Only pending rentals can be rejected",
      });
    }

    rental.status = "REJECTED";
    await rental.save();

    res.status(200).json({
      success: true,
      message: "Rental rejected successfully",
      rental,
    });
  } catch (error) {
    console.error("Reject rental error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// CANCEL RENTAL
// PUT /api/rentals/:id/cancel

export const cancelRental = async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id);

    if (!rental) {
      return res.status(404).json({
        success: false,
        message: "Rental not found",
      });
    }

    // Only renter can cancel
    if (rental.renter.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the renter can cancel this rental",
      });
    }

    // Only PENDING or CONFIRMED can be cancelled
    if (
      rental.status !== "PENDING" &&
      rental.status !== "CONFIRMED"
    ) {
      return res.status(400).json({
        success: false,
        message: "Only pending or confirmed rentals can be cancelled",
      });
    }

    rental.status = "CANCELLED";
    await rental.save();

    res.status(200).json({
      success: true,
      message: "Rental cancelled successfully",
      rental,
    });
  } catch (error) {
    console.error("Cancel rental error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ACTIVATE RENTAL
// PUT /api/rentals/:id/activate

export const activateRental = async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id);

    if (!rental) {
      return res.status(404).json({
        success: false,
        message: "Rental not found",
      });
    }

    // Only owner can activate
    if (rental.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the owner can activate this rental",
      });
    }

    // Only CONFIRMED can become ACTIVE
    if (rental.status !== "CONFIRMED") {
      return res.status(400).json({
        success: false,
        message: "Only confirmed rentals can become active",
      });
    }

    rental.status = "ACTIVE";
    await rental.save();

    res.status(200).json({
      success: true,
      message: "Rental activated successfully",
      rental,
    });
  } catch (error) {
    console.error("Activate rental error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// COMPLETE RENTAL
// PUT /api/rentals/:id/complete

export const completeRental = async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id);

    if (!rental) {
      return res.status(404).json({
        success: false,
        message: "Rental not found",
      });
    }

    // Only owner can complete
    if (rental.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the owner can complete this rental",
      });
    }

    // Only ACTIVE can become COMPLETED
    if (rental.status !== "ACTIVE") {
      return res.status(400).json({
        success: false,
        message: "Only active rentals can be completed",
      });
    }

    rental.status = "COMPLETED";
    await rental.save();

    res.status(200).json({
      success: true,
      message: "Rental completed successfully",
      rental,
    });
  } catch (error) {
    console.error("Complete rental error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// REQUEST RETURN
// PUT /api/rentals/:id/request-return

export const requestReturn = async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id);

    if (!rental) {
      return res.status(404).json({
        success: false,
        message: "Rental not found",
      });
    }

    // Only renter can request return
    if (rental.renter.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the renter can request a return",
      });
    }

    // Only COMPLETED rentals can request return
    if (rental.status !== "COMPLETED") {
      return res.status(400).json({
        success: false,
        message: "Return can only be requested for completed rentals",
      });
    }

    rental.status = "RETURN_REQUESTED";
    rental.returnRequestedAt = new Date();

    await rental.save();

    res.status(200).json({
      success: true,
      message: "Return request submitted successfully",
      rental,
    });
  } catch (error) {
    console.error("Request return error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// RETURN RENTAL
// PUT /api/rentals/:id/return

export const returnRental = async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id);

    if (!rental) {
      return res.status(404).json({
        success: false,
        message: "Rental not found",
      });
    }

    // Only owner can approve the return
    if (rental.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the owner can mark this rental as returned",
      });
    }

    // Renter must request return first
    if (rental.status !== "RETURN_REQUESTED") {
      return res.status(400).json({
        success: false,
        message: "Renter must request a return first",
      });
    }

    rental.status = "RETURNED";
    rental.returnedAt = new Date();

    await rental.save();

    res.status(200).json({
      success: true,
      message: "Rental returned successfully",
      rental,
    });
  } catch (error) {
    console.error("Return rental error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};


// settleDeposit function

export const settleDeposit = async (req, res) => {
  try {
    const { depositDeduction = 0, damageDescription = "" } = req.body;

    const rental = await Rental.findById(req.params.id);

    if (!rental) {
      return res.status(404).json({
        success: false,
        message: "Rental not found",
      });
    }

    // Only the owner can settle the deposit
    if (rental.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the owner can settle the security deposit",
      });
    }

    // Item must be marked as returned first
    if (rental.status !== "RETURNED") {
      return res.status(400).json({
        success: false,
        message: "Deposit can only be settled after the item is returned",
      });
    }

    // Prevent duplicate settlement
    if (rental.depositRefundStatus !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: "Security deposit has already been settled",
      });
    }

    const deposit = Number(rental.securityDeposit);
    const deduction = Number(depositDeduction);

    if (
      !Number.isFinite(deposit) ||
      deposit < 0 ||
      !Number.isFinite(deduction) ||
      deduction < 0 ||
      deduction > deposit
    ) {
      return res.status(400).json({
        success: false,
        message: "Deduction must be between zero and the security deposit",
      });
    }

    const description =
      typeof damageDescription === "string"
        ? damageDescription.trim()
        : "";

    if (deduction > 0 && !description) {
      return res.status(400).json({
        success: false,
        message: "Provide a damage description when deducting the deposit",
      });
    }

    const refundAmount = deposit - deduction;

    let refundStatus;

    if (deduction === 0) {
      refundStatus = "REFUNDED";
    } else if (refundAmount === 0) {
      refundStatus = "FORFEITED";
    } else {
      refundStatus = "PARTIALLY_REFUNDED";
    }

    // Save settlement details
    rental.depositDeduction = deduction;
    rental.depositRefundAmount = refundAmount;
    rental.depositRefundStatus = refundStatus;
    rental.damageDescription = description;
    rental.returnApprovedBy = req.user._id;

    await rental.save();

    return res.status(200).json({
      success: true,
      message: "Security deposit settlement recorded successfully",
      settlement: {
        rentalId: rental._id,
        securityDeposit: deposit,
        depositDeduction: deduction,
        depositRefundAmount: refundAmount,
        depositRefundStatus: refundStatus,
        damageDescription: description,
      },
    });
  } catch (error) {
    console.error("Settle deposit error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
