const express = require("express");
const Booking = require("../models/Booking");
const Hotel = require("../models/Hotel");
const protect = require("../middleware/auth");

const router = express.Router();

// ---------------------------------------------------------------------
// This project doesn't wire up a real payment gateway (Stripe/Razorpay
// etc. need real API keys). Instead, we "simulate" a payment: we run
// some basic validation on the details the user typed in, then mark the
// booking as paid. Card numbers/CVVs are only used for validation and
// are never saved - only a masked last-4 reference is stored.
// ---------------------------------------------------------------------
function processMockPayment({ paymentMethod, card, upiId }) {
  if (paymentMethod === "card") {
    const digits = (card?.number || "").replace(/\s/g, "");
    if (!/^\d{13,16}$/.test(digits)) {
      return { ok: false, message: "Enter a valid 13-16 digit card number" };
    }
    if (!/^\d{2}\/\d{2}$/.test(card?.expiry || "")) {
      return { ok: false, message: "Enter card expiry as MM/YY" };
    }
    if (!/^\d{3,4}$/.test(card?.cvv || "")) {
      return { ok: false, message: "Enter a valid CVV" };
    }
    return { ok: true, status: "paid", cardLast4: digits.slice(-4) };
  }

  if (paymentMethod === "upi") {
    if (!/^[\w.\-]{2,}@[a-zA-Z]{2,}$/.test(upiId || "")) {
      return { ok: false, message: "Enter a valid UPI ID, e.g. name@bank" };
    }
    return { ok: true, status: "paid", upiId };
  }

  if (paymentMethod === "cash") {
    // Pay at the hotel - nothing to charge now.
    return { ok: true, status: "pending" };
  }

  return { ok: false, message: "Please choose a payment method" };
}

// @route   POST /api/bookings
// @desc    Create a new booking for the logged-in user (room + payment)
router.post("/", protect, async (req, res) => {
  try {
    const {
      hotelId,
      roomId,
      checkIn,
      checkOut,
      guests,
      paymentMethod,
      card, // { number, name, expiry, cvv }
      upiId,
    } = req.body;

    if (!hotelId || !roomId || !checkIn || !checkOut) {
      return res.status(400).json({
        message: "Please provide hotel, room, check-in and check-out dates",
      });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkOutDate <= checkInDate) {
      return res.status(400).json({ message: "Check-out date must be after check-in date" });
    }

    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    const room = hotel.rooms.id(roomId);
    if (!room) {
      return res.status(404).json({ message: "Room type not found for this hotel" });
    }

    if (guests && guests > room.capacity) {
      return res.status(400).json({
        message: `This room type fits up to ${room.capacity} guest(s)`,
      });
    }

    // Availability check: only look at bookings for this specific room type
    const overlappingBookings = await Booking.countDocuments({
      hotel: hotelId,
      roomId,
      status: "confirmed",
      checkIn: { $lt: checkOutDate },
      checkOut: { $gt: checkInDate },
    });

    if (overlappingBookings >= room.totalRooms) {
      return res.status(400).json({ message: "No rooms of this type are available for these dates" });
    }

    // Run the (simulated) payment before confirming the booking
    const payment = processMockPayment({ paymentMethod, card, upiId });
    if (!payment.ok) {
      return res.status(400).json({ message: payment.message });
    }

    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const totalPrice = nights * room.pricePerNight;

    const booking = await Booking.create({
      user: req.userId,
      hotel: hotelId,
      roomId,
      roomType: room.type,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests: guests || 1,
      totalPrice,
      paymentMethod,
      paymentStatus: payment.status,
      cardLast4: payment.cardLast4 || "",
      upiId: payment.upiId || "",
    });

    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: "Something went wrong", error: err.message });
  }
});

// @route   GET /api/bookings/my
// @desc    Get all bookings made by the logged-in user
router.get("/my", protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.userId })
      .populate("hotel", "name city image pricePerNight")
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Something went wrong", error: err.message });
  }
});

// @route   PUT /api/bookings/:id/cancel
// @desc    Cancel one of the logged-in user's bookings
router.put("/:id/cancel", protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.user.toString() !== req.userId) {
      return res.status(403).json({ message: "You can only cancel your own bookings" });
    }

    booking.status = "cancelled";
    await booking.save();

    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: "Something went wrong", error: err.message });
  }
});

module.exports = router;
