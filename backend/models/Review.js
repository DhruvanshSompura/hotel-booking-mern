const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userName: {
      type: String, // copied in at review time so we don't need to populate for display
      required: true,
    },
    rating: {
      type: Number, // 1 - 5 stars
      required: true,
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      default: "",
    },
    comment: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// One review per user per hotel - they can edit it instead of adding a new one.
reviewSchema.index({ hotel: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);
