
import Payment from "../models/Payment.js";
import Rental from "../models/Rental.js";

// @desc    Create a payment record
// @route   POST /api/payments
// @access  Private
export const createPayment = async (req, res) => {
  try {
    const { rentalId, method } = req.body;

    // 1. Validate input
    if (!rentalId || !method) {
      return res.status(400).json({
        message: "Rental ID and payment method are required",
      });
    }

    // 2. Find rental
    const rental = await Rental.findById(rentalId);

    if (!rental) {
      return res.status(404).json({
        message: "Rental not found",
      });
    }

    // 3. Only renter can make payment
    if (rental.renter.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You are not authorized to pay for this rental",
      });
    }

    // 4. Check rental status
    if (rental.status !== "CONFIRMED") {
      return res.status(400).json({
        message: "Payment is only allowed for confirmed rentals",
      });
    }

    // 5. Get rental amount and deposit
    const rentalAmount = rental.totalPrice;
    const securityDeposit = rental.securityDeposit || 0;

    // 6. Calculate Rewear commission
    const commissionRate = 10;

    const platformFee =
      rentalAmount * (commissionRate / 100);

    // 7. Calculate lender earnings
    const lenderAmount = rentalAmount - platformFee;

    // 8. Calculate total payment
    const amount = rentalAmount + securityDeposit;

    // 9. Create payment record
    const payment = await Payment.create({
      rental: rental._id,
      user: rental.renter,
      amount,
      rentalAmount,
      platformFee,
      commissionRate,
      lenderAmount,
      securityDeposit,
      method,
      status: "PENDING",
    });

    // 10. Send response
    res.status(201).json({
      message: "Payment record created successfully",
      payment,
    });
  } catch (error) {
    console.error("Create payment error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Mark payment success
export const markPaymentSuccess = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await Payment.findById(id);

    if (!payment) {
      return res.status(404).json({
        message: "Payment not found",
      });
    }

    // Only the renter who made the payment can mark it successful
    if (payment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You are not authorized to update this payment",
      });
    }

    if (payment.status === "SUCCESS") {
      return res.status(400).json({
        message: "Payment is already successful",
      });
    }

    if (payment.status !== "PENDING") {
      return res.status(400).json({
        message: "Only pending payments can be marked successful",
      });
    }

    // Update payment status
    payment.status = "SUCCESS";
    payment.transactionId = `TEST_TXN_${Date.now()}`;

    await payment.save();

    // Find related rental
    const rental = await Rental.findById(payment.rental);

    if (!rental) {
      return res.status(404).json({
        message: "Related rental not found",
      });
    }

    // Rental must be confirmed before payment success
    if (rental.status !== "CONFIRMED") {
      return res.status(400).json({
        message: "Only confirmed rentals can be activated",
      });
    }

    rental.status = "ACTIVE";
    await rental.save();

    return res.status(200).json({
      message: "Payment marked as successful",
      payment,
      rental,
    });
  } catch (error) {
    console.error("Mark payment success error:", error);

    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Get payment details by id
export const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await Payment.findById(id)
      .populate("rental")
      .populate("user", "name email");

    if (!payment) {
      return res.status(404).json({
        message: "Payment not found",
      });
    }

    if (payment.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You are not authorized to view this payment",
      });
    }

    return res.status(200).json(payment);
  } catch (error) {
    console.error("Get payment error:", error);

    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};