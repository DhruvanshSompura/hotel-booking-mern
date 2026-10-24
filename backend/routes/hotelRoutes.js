const express = require("express");
const Hotel = require("../models/Hotel");
const { getHotelSummary } = require("../controllers/HotelController");

const router = express.Router();

// @route   GET /api/hotels
// @desc    Get hotels with filters, sorting and pagination
// @query   ?page=1&limit=6
// @query   ?city=Goa
// @query   ?stars=5,4,3
// @query   ?minRating=4
// @query   ?sort=price_asc|price_desc|rating_desc

router.get("/", async (req, res) => {
  try {
    // 1. Build filters
    const filter = {};

    // Filter by city or address
    if (req.query.city) {
      const locationRegex = {
        $regex: req.query.city,
        $options: "i",
      };

      filter.$or = [
        { city: locationRegex },
        { address: locationRegex },
      ];
    }

    // Filter by star rating
    if (req.query.stars) {
      const starList = req.query.stars
        .split(",")
        .map((s) => Number(s))
        .filter(
          (n) =>
            Number.isInteger(n) &&
            n >= 1 &&
            n <= 5
        );

      if (starList.length > 0) {
        filter.starRating = { $in: starList };
      }
    }

    // Filter by minimum average rating
    if (req.query.minRating !== undefined) {
      const minRating = Number(req.query.minRating);

      if (
        Number.isFinite(minRating) &&
        minRating >= 0 &&
        minRating <= 5
      ) {
        filter.avgRating = { $gte: minRating };
      }
    }

    // 2. Sorting
    let sort = { createdAt: -1 };

    if (req.query.sort === "price_asc") {
      sort = { pricePerNight: 1 };
    } else if (req.query.sort === "price_desc") {
      sort = { pricePerNight: -1 };
    } else if (req.query.sort === "rating_desc") {
      sort = { avgRating: -1 };
    }

    // 3. Validate pagination query parameters

    const requestedPage =
      req.query.page !== undefined
        ? Number(req.query.page)
        : NaN;

    const requestedLimit =
      req.query.limit !== undefined
        ? Number(req.query.limit)
        : NaN;

    // Page must be a positive integer.
    // Default page = 1.
    const page =
      Number.isInteger(requestedPage) &&
      requestedPage >= 1
        ? requestedPage
        : 1;

    // Limit must be an integer between 1 and 50.
    // Default limit = 6.
    const limit =
      Number.isInteger(requestedLimit) &&
      requestedLimit >= 1 &&
      requestedLimit <= 50
        ? requestedLimit
        : 6;

    const skip = (page - 1) * limit;

    // 4. Fetch paginated hotels and count total matching records
    const [hotels, totalRecords] = await Promise.all([
      Hotel.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit),

      Hotel.countDocuments(filter),
    ]);

    // 5. Calculate total pages
    const totalPages = Math.ceil(totalRecords / limit);

    // 6. Send response
    res.status(200).json({
      success: true,
      currentPage: page,
      totalPages,
      totalRecords,
      limit,
      hotels,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error: err.message,
    });
  }
});

// @route   GET /api/hotels/meta/cities
// @desc    Get distinct cities for the city filter

router.get("/meta/cities", async (req, res) => {
  try {
    const cities = await Hotel.distinct("city");

    res.status(200).json(cities.sort());
  } catch (err) {
    res.status(500).json({
      message: "Something went wrong",
      error: err.message,
    });
  }
});

// @route   GET /api/hotels/summary
// @desc    Get hotel summary

router.get("/summary", getHotelSummary);

// @route   GET /api/hotels/:id/rooms/:roomId/availability
// @desc    Check room availability

router.get("/:id/rooms/:roomId/availability", async (req, res) => {
  try {
    const Booking = require("../models/Booking");
    const { checkIn, checkOut } = req.query;

    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).json({
        message: "Hotel not found",
      });
    }

    const room = hotel.rooms.id(req.params.roomId);

    if (!room) {
      return res.status(404).json({
        message: "Room type not found",
      });
    }

    let bookedCount = 0;

    if (checkIn && checkOut) {
      const startDate = new Date(checkIn);
      const endDate = new Date(checkOut);

      if (
        Number.isNaN(startDate.getTime()) ||
        Number.isNaN(endDate.getTime()) ||
        startDate >= endDate
      ) {
        return res.status(400).json({
          message: "Please provide valid check-in and check-out dates",
        });
      }

      bookedCount = await Booking.countDocuments({
        hotel: req.params.id,
        roomId: req.params.roomId,
        status: "confirmed",
        checkIn: { $lt: endDate },
        checkOut: { $gt: startDate },
      });
    }

    res.status(200).json({
      totalRooms: room.totalRooms,
      available: Math.max(
        0,
        room.totalRooms - bookedCount
      ),
    });
  } catch (err) {
    res.status(500).json({
      message: "Something went wrong",
      error: err.message,
    });
  }
});

// @route   GET /api/hotels/:id
// @desc    Get a single hotel by ID

router.get("/:id", async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).json({
        message: "Hotel not found",
      });
    }

    res.status(200).json(hotel);
  } catch (err) {
    res.status(500).json({
      message: "Something went wrong",
      error: err.message,
    });
  }
});

// @route   POST /api/hotels
// @desc    Create a hotel

router.post("/", async (req, res) => {
  try {
    const hotel = await Hotel.create(req.body);

    res.status(201).json(hotel);
  } catch (err) {
    res.status(400).json({
      message: "Could not create hotel",
      error: err.message,
    });
  }
});

module.exports = router;
