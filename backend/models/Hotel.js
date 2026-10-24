const mongoose = require("mongoose");

// One room "type" belonging to a hotel, e.g. Deluxe / Standard (Non-Deluxe).
const roomSchema = new mongoose.Schema({
  type: {
    type: String, // e.g. "Deluxe", "Standard", "Non-Deluxe", "Suite"
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  pricePerNight: {
    type: Number,
    required: true,
  },
  totalRooms: {
    type: Number, // how many rooms of this type the hotel has
    required: true,
    default: 5,
  },
  capacity: {
    type: Number, // max guests per room
    default: 2,
  },
  amenities: {
    type: [String], // e.g. ["AC", "Wi-Fi", "Sea view"]
    default: [],
  },
  images: {
    type: [String], // photos of this specific room type
    default: [],
  },
});

const hotelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    image: {
      type: String, // main cover photo of the hotel (used on cards)
      default: "https://placehold.co/600x400?text=Hotel",
    },
    images: {
      type: [String], // extra gallery photos of the hotel itself
      default: [],
    },
    pricePerNight: {
      type: Number, // "starting from" price, kept in sync with cheapest room
      required: true,
    },
    totalRooms: {
      type: Number, // kept in sync with the sum of all room types
      required: true,
      default: 10,
    },
    rooms: {
      type: [roomSchema],
      default: [],
    },
    starRating: {
      type: Number, // the hotel's official star class, e.g. 3-star / 5-star
      min: 1,
      max: 5,
      default: 3,
    },
    avgRating: {
      type: Number, // average of all customer review ratings, kept in sync by reviewRoutes
      default: 0,
    },
    numReviews: {
      type: Number, // how many customer reviews this hotel has
      default: 0,
    },
  },
  { timestamps: true }
);

// Keep the summary fields (pricePerNight / totalRooms) in sync with the
// rooms array whenever a hotel is saved, so old parts of the app that only
// look at hotel.pricePerNight still show something sensible.
hotelSchema.pre("save", function (next) {
  if (this.rooms && this.rooms.length > 0) {
    this.pricePerNight = Math.min(...this.rooms.map((r) => r.pricePerNight));
    this.totalRooms = this.rooms.reduce((sum, r) => sum + r.totalRooms, 0);
  }
  next();
});

module.exports = mongoose.model("Hotel", hotelSchema);
