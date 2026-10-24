const Hotel = require("../models/Hotel");

// Get hotel summary
const getHotelSummary = async (req, res) => {
  try {
    const hotels = await Hotel.find();

    const totalHotels = hotels.length;

    const cities = [...new Set(hotels.map((hotel) => hotel.city))];

    const totalCities = cities.length;

    const averageRating =
      totalHotels > 0
        ? (
            hotels.reduce(
              (sum, hotel) => sum + (hotel.avgRating || 0),
              0
            ) / totalHotels
          ).toFixed(1)
        : 0;

    const averagePrice =
      totalHotels > 0
        ? Math.round(
            hotels.reduce(
              (sum, hotel) => sum + (hotel.pricePerNight || 0),
              0
            ) / totalHotels
          )
        : 0;

    res.json({
      totalHotels,
      totalCities,
      cities,
      averageRating: Number(averageRating),
      averagePricePerNight: averagePrice,
      hotels,
    });
  } catch (err) {
    res.status(500).json({
      message: "Something went wrong",
      error: err.message,
    });
  }
};

module.exports = {
  getHotelSummary,
};