import React from "react";
import { Link } from "react-router-dom";
import StarRating from "./StarRating";

const HotelCard = ({ hotel }) => {
  return (
    <Link to={`/hotels/${hotel._id}`} className="hotel-card">
      <div
        className="hotel-card-image"
        style={{ backgroundImage: `url(${hotel.image})` }}
      >
        {hotel.starRating > 0 && (
          <span className="hotel-card-stars-badge">
            {hotel.starRating}★ hotel
          </span>
        )}
      </div>
      <div className="hotel-card-body">
        <p className="hotel-card-city">{hotel.city}</p>
        <h3>{hotel.name}</h3>
        <p className="hotel-card-address">{hotel.address}</p>

        <div className="hotel-card-rating-row">
          <StarRating value={hotel.avgRating || 0} size="sm" />
          {hotel.numReviews > 0 ? (
            <span className="hotel-card-review-count">
              {hotel.avgRating.toFixed(1)} ({hotel.numReviews} review{hotel.numReviews > 1 ? "s" : ""})
            </span>
          ) : (
            <span className="hotel-card-review-count">No reviews yet</span>
          )}
        </div>

        <div className="hotel-card-footer">
          <span className="hotel-card-price-label">From </span>
          <span className="hotel-card-price">₹{hotel.pricePerNight}</span>
          <span className="hotel-card-price-label"> / night</span>
          {hotel.rooms && hotel.rooms.length > 0 && (
            <span className="hotel-card-room-count">
              {hotel.rooms.length} room type{hotel.rooms.length > 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default HotelCard;
