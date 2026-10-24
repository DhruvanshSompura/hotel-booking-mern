const express = require("express");
const Review = require("../models/Review");
const Hotel = require("../models/Hotel");
const User = require("../models/User");
const protect = require("../middleware/auth");

const router = express.Router();

// Recalculate and save a hotel's avgRating / numReviews from its reviews.
async function syncHotelRatingSummary(hotelId) {
  const reviews = await Review.find({ hotel: hotelId });
  const numReviews = reviews.length;
  const avgRating =
    numReviews > 0
      ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / numReviews) * 10) / 10
      : 0;
  await Hotel.findByIdAndUpdate(hotelId, { avgRating, numReviews });
}

// @route   GET /api/hotels/:hotelId/reviews
// @desc    Get all reviews for a hotel (newest first)
router.get("/:hotelId/reviews", async (req, res) => {
  try {
    const reviews = await Review.find({ hotel: req.params.hotelId }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: "Something went wrong", error: err.message });
  }
});

// @route   POST /api/hotels/:hotelId/reviews
// @desc    Add a review for a hotel (one per logged-in user; posting again updates it)
router.post("/:hotelId/reviews", protect, async (req, res) => {
  try {
    const { rating, title, comment } = req.body;
    const hotelId = req.params.hotelId;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Please give a rating between 1 and 5 stars" });
    }

    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    const user = await User.findById(req.userId);

    // Upsert: if this user already reviewed this hotel, update it instead of duplicating.
    const review = await Review.findOneAndUpdate(
      { hotel: hotelId, user: req.userId },
      { rating, title, comment, userName: user.name },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    await syncHotelRatingSummary(hotelId);

    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: "Something went wrong", error: err.message });
  }
});

// @route   DELETE /api/hotels/:hotelId/reviews/:reviewId
// @desc    Delete the logged-in user's own review
router.delete("/:hotelId/reviews/:reviewId", protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }
    if (review.user.toString() !== req.userId) {
      return res.status(403).json({ message: "You can only delete your own review" });
    }

    await review.deleteOne();
    await syncHotelRatingSummary(req.params.hotelId);

    res.json({ message: "Review deleted" });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong", error: err.message });
  }
});

module.exports = router;
