
import Review from "../models/Review.js";
import Rental from "../models/Rental.js";

// POST: Create a review
export const createReview = async (req, res) => {
  try {
    const { product, rental, rating, comment } = req.body;

    if (!product || !rental || rating === undefined) {
      return res.status(400).json({
        success: false,
        message: "Product, rental, and rating are required",
      });
    }

    const numericRating = Number(rating);

    if (
      !Number.isFinite(numericRating) ||
      numericRating < 1 ||
      numericRating > 5 ||
      !Number.isInteger(numericRating)
    ) {
      return res.status(400).json({
        success: false,
        message: "Rating must be an integer between 1 and 5",
      });
    }

    const rentalRecord = await Rental.findOne({
      _id: rental,
      user: req.user._id,
      product,
      status: "RETURNED",
    });

    if (!rentalRecord) {
      return res.status(403).json({
        success: false,
        message: "You can review only a product from your completed rental",
      });
    }

    const existingReview = await Review.findOne({
      user: req.user._id,
      rental,
    });

    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this rental",
      });
    }

    const newReview = await Review.create({
      user: req.user._id,
      product,
      rental,
      rating: numericRating,
      comment,
    });

    return res.status(201).json({
      success: true,
      message: "Review added successfully",
      review: newReview,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this rental",
      });
    }

    if (error.name === "ValidationError" ||
        error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid review data",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create review",
    });
  }
};

// GET: Get reviews for a product
export const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      product: req.params.productId,
    })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    const status = error.name === "CastError" ? 400 : 500;

    return res.status(status).json({
      success: false,
      message: "Failed to fetch reviews",
    });
  }
};

// PUT: Update your own review
export const updateReview = async (req, res) => {
  try {
    const review = await Review.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    if (req.body.rating !== undefined) {
      const rating = Number(req.body.rating);

      if (
        !Number.isFinite(rating) ||
        !Number.isInteger(rating) ||
        rating < 1 ||
        rating > 5
      ) {
        return res.status(400).json({
          success: false,
          message: "Rating must be an integer between 1 and 5",
        });
      }

      review.rating = rating;
    }

    if (req.body.comment !== undefined) {
      review.comment = req.body.comment;
    }

    await review.save();

    return res.status(200).json({
      success: true,
      message: "Review updated successfully",
      review,
    });
  } catch (error) {
    const status =
      error.name === "CastError" ||
      error.name === "ValidationError"
        ? 400
        : 500;

    return res.status(status).json({
      success: false,
      message: "Failed to update review",
    });
  }
};

// DELETE: Delete your own review
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    const status = error.name === "CastError" ? 400 : 500;

    return res.status(status).json({
      success: false,
      message: "Failed to delete review",
    });
  }
};
