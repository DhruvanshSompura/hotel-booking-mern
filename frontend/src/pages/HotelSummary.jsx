import React, { useEffect, useState } from "react";
import axios from "axios";

function HotelSummary() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHotelSummary = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/hotels/summary"
        );

        setSummary(response.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load hotel summary");
      } finally {
        setLoading(false);
      }
    };

    fetchHotelSummary();
  }, []);

  if (loading) {
    return <h2>Loading hotel summary...</h2>;
  }

  if (error) {
    return <h2>{error}</h2>;
  }

  return (
    <div>
      <h1>Hotel Summary</h1>

      <h3>Total Hotels</h3>
      <p>{summary.totalHotels}</p>

      <h3>Total Cities</h3>
      <p>{summary.totalCities}</p>

      <h3>Average Rating</h3>
      <p>{summary.averageRating}</p>

      <h3>Average Price Per Night</h3>
      <p>₹{summary.averagePricePerNight}</p>

      <h2>Hotels</h2>

      {summary.hotels.map((hotel) => (
        <div key={hotel._id}>
          <h3>{hotel.name}</h3>
          <p>City: {hotel.city}</p>
          <p>Star Rating: {hotel.starRating}</p>
          <p>Price: ₹{hotel.pricePerNight}</p>
        </div>
      ))}
    </div>
  );
}

export default HotelSummary;