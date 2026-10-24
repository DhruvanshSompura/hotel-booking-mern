import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import StarRating from "../components/StarRating";
import StarRatingInput from "../components/StarRatingInput";

const HotelDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [hotel, setHotel] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [activeImage, setActiveImage] = useState(0);

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);

  const [paymentMethod, setPaymentMethod] = useState("card");
  const [card, setCard] = useState({ name: "", number: "", expiry: "", cvv: "" });
  const [upiId, setUpiId] = useState("");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success" or "error"
  const [submitting, setSubmitting] = useState(false);

  // ---------- Reviews ----------
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewMessage, setReviewMessage] = useState("");
  const [reviewMessageType, setReviewMessageType] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const fetchReviews = async () => {
    setReviewsLoading(true);
    try {
      const res = await api.get(`/hotels/${id}/reviews`);
      setReviews(res.data);
    } catch (err) {
      // Non-critical - just leave the reviews list empty
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    const fetchHotel = async () => {
      try {
        const res = await api.get(`/hotels/${id}`);
        setHotel(res.data);
        if (res.data.rooms && res.data.rooms.length > 0) {
          setSelectedRoom(res.data.rooms[0]);
        }
      } catch (err) {
        setMessage("Could not load this hotel.");
        setMessageType("error");
      }
    };
    fetchHotel();
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setReviewMessage("");

    if (!user) {
      navigate("/login");
      return;
    }
    if (reviewRating < 1) {
      setReviewMessage("Please pick a star rating first.");
      setReviewMessageType("error");
      return;
    }

    setReviewSubmitting(true);
    try {
      await api.post(`/hotels/${id}/reviews`, {
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment,
      });
      setReviewMessage("Thanks! Your review has been posted.");
      setReviewMessageType("success");
      setReviewTitle("");
      setReviewComment("");
      setReviewRating(0);
      await fetchReviews();
      // Refresh the hotel so its avgRating/numReviews stay in sync
      const res = await api.get(`/hotels/${id}`);
      setHotel(res.data);
    } catch (err) {
      setReviewMessage(err.response?.data?.message || "Could not post your review. Please try again.");
      setReviewMessageType("error");
    } finally {
      setReviewSubmitting(false);
    }
  };

  // Work out how many nights and the total price, purely for display
  const nights =
    checkIn && checkOut
      ? Math.max(
          0,
          Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24))
        )
      : 0;
  const totalPrice = selectedRoom ? nights * selectedRoom.pricePerNight : 0;

  const handleSelectRoom = (room) => {
    setSelectedRoom(room);
    setActiveImage(0);
    setMessage("");
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!user) {
      navigate("/login");
      return;
    }

    if (!selectedRoom) {
      setMessage("Please select a room type first.");
      setMessageType("error");
      return;
    }

    if (!checkIn || !checkOut) {
      setMessage("Please choose both check-in and check-out dates.");
      setMessageType("error");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/bookings", {
        hotelId: id,
        roomId: selectedRoom._id,
        checkIn,
        checkOut,
        guests,
        paymentMethod,
        card: paymentMethod === "card" ? card : undefined,
        upiId: paymentMethod === "upi" ? upiId : undefined,
      });
      setMessage(
        paymentMethod === "cash"
          ? "Booking confirmed! Please pay at the hotel. See it under My bookings."
          : "Payment successful and booking confirmed! You can view it under My bookings."
      );
      setMessageType("success");
    } catch (err) {
      setMessage(err.response?.data?.message || "Booking failed. Please try again.");
      setMessageType("error");
    } finally {
      setSubmitting(false);
    }
  };

  if (!hotel) {
    return <div className="page"><p className="status-text">{message || "Loading..."}</p></div>;
  }

  // Photos shown in the big gallery: whichever room is selected shows its
  // own photos, otherwise fall back to the hotel's own gallery.
  const galleryImages =
    (selectedRoom && selectedRoom.images && selectedRoom.images.length > 0
      ? selectedRoom.images
      : hotel.images && hotel.images.length > 0
      ? hotel.images
      : [hotel.image]) || [hotel.image];

  return (
    <div className="page">
      <div className="details-layout">
        <div className="details-main">
          <div
            className="details-image"
            style={{ backgroundImage: `url(${galleryImages[activeImage] || hotel.image})` }}
          />
          {galleryImages.length > 1 && (
            <div className="thumb-row">
              {galleryImages.map((src, i) => (
                <button
                  type="button"
                  key={src + i}
                  className={`thumb ${i === activeImage ? "thumb-active" : ""}`}
                  style={{ backgroundImage: `url(${src})` }}
                  onClick={() => setActiveImage(i)}
                  aria-label={`Photo ${i + 1}`}
                />
              ))}
            </div>
          )}

          <p className="hotel-card-city">{hotel.city}</p>
          <div className="details-title-row">
            <h1>{hotel.name}</h1>
            {hotel.starRating > 0 && (
              <span className="details-star-class">{hotel.starRating}★ hotel</span>
            )}
          </div>
          <div className="details-rating-row">
            <StarRating value={hotel.avgRating || 0} />
            {hotel.numReviews > 0 ? (
              <a href="#reviews" className="details-rating-count">
                {hotel.avgRating.toFixed(1)} · {hotel.numReviews} review
                {hotel.numReviews > 1 ? "s" : ""}
              </a>
            ) : (
              <span className="details-rating-count">No reviews yet</span>
            )}
          </div>
          <p className="details-address">{hotel.address}</p>
          <p className="details-description">{hotel.description}</p>

          <h2 className="rooms-heading">Choose a room</h2>
          <div className="room-list">
            {hotel.rooms && hotel.rooms.length > 0 ? (
              hotel.rooms.map((room) => (
                <div
                  key={room._id}
                  className={`room-card ${selectedRoom && selectedRoom._id === room._id ? "room-card-selected" : ""}`}
                  onClick={() => handleSelectRoom(room)}
                >
                  <div
                    className="room-card-image"
                    style={{ backgroundImage: `url(${(room.images && room.images[0]) || hotel.image})` }}
                  />
                  <div className="room-card-body">
                    <div className="room-card-top">
                      <h3>{room.type}</h3>
                      <span className="room-card-price">
                        ₹{room.pricePerNight}<span> / night</span>
                      </span>
                    </div>
                    <p className="room-card-desc">{room.description}</p>
                    <div className="room-card-meta">
                      <span>Up to {room.capacity} guests</span>
                      {room.amenities && room.amenities.length > 0 && (
                        <span> · {room.amenities.join(", ")}</span>
                      )}
                    </div>
                    <button
                      type="button"
                      className={`btn-${selectedRoom && selectedRoom._id === room._id ? "solid" : "ghost"} btn-solid-sm room-select-btn`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectRoom(room);
                      }}
                    >
                      {selectedRoom && selectedRoom._id === room._id ? "Selected" : "Select room"}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="status-text">No room types have been added for this hotel yet.</p>
            )}
          </div>

          <section id="reviews" className="reviews-section">
            <h2 className="rooms-heading">Guest reviews</h2>

            {reviewsLoading && <p className="status-text">Loading reviews...</p>}

            {!reviewsLoading && reviews.length === 0 && (
              <p className="status-text">No reviews yet. Be the first to share your stay.</p>
            )}

            {!reviewsLoading && reviews.length > 0 && (
              <div className="review-list">
                {reviews.map((r) => (
                  <div key={r._id} className="review-card">
                    <div className="review-card-header">
                      <StarRating value={r.rating} size="sm" />
                      <span className="review-author">{r.userName}</span>
                      <span className="review-date">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {r.title && <p className="review-title">{r.title}</p>}
                    {r.comment && <p className="review-comment">{r.comment}</p>}
                  </div>
                ))}
              </div>
            )}

            <div className="review-form-card">
              <h3>Write a review</h3>
              <form onSubmit={handleSubmitReview} className="review-form">
                <label>
                  Your rating
                  <StarRatingInput value={reviewRating} onChange={setReviewRating} />
                </label>
                <label>
                  Title (optional)
                  <input
                    type="text"
                    placeholder="Sum up your stay"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    maxLength={80}
                  />
                </label>
                <label>
                  Your review (optional)
                  <textarea
                    placeholder="What did you like or dislike?"
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    rows={4}
                    maxLength={1000}
                  />
                </label>
                <button type="submit" className="btn-solid" disabled={reviewSubmitting}>
                  {reviewSubmitting ? "Posting..." : user ? "Post review" : "Log in to review"}
                </button>
              </form>
              {reviewMessage && (
                <p className={`status-text ${reviewMessageType === "error" ? "status-error" : "status-success"}`}>
                  {reviewMessage}
                </p>
              )}
            </div>
          </section>
        </div>

        <aside className="booking-box">
          <p className="booking-price">
            ₹{selectedRoom ? selectedRoom.pricePerNight : hotel.pricePerNight} <span>/ night</span>
          </p>
          {selectedRoom && <p className="booking-room-label">{selectedRoom.type} room</p>}

          <form onSubmit={handleBooking}>
            <label>
              Check-in
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                required
              />
            </label>

            <label>
              Check-out
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                required
              />
            </label>

            <label>
              Guests
              <input
                type="number"
                min="1"
                max={selectedRoom ? selectedRoom.capacity : undefined}
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
              />
            </label>

            {nights > 0 && (
              <p className="booking-total">
                {nights} night{nights > 1 ? "s" : ""} · Total ₹{totalPrice}
              </p>
            )}

            <div className="payment-section">
              <p className="payment-heading">Payment method</p>
              <div className="payment-methods">
                <label className={`payment-option ${paymentMethod === "card" ? "payment-option-active" : ""}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={paymentMethod === "card"}
                    onChange={() => setPaymentMethod("card")}
                  />
                  Card
                </label>
                <label className={`payment-option ${paymentMethod === "upi" ? "payment-option-active" : ""}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="upi"
                    checked={paymentMethod === "upi"}
                    onChange={() => setPaymentMethod("upi")}
                  />
                  UPI
                </label>
                <label className={`payment-option ${paymentMethod === "cash" ? "payment-option-active" : ""}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked={paymentMethod === "cash"}
                    onChange={() => setPaymentMethod("cash")}
                  />
                  Pay at hotel
                </label>
              </div>

              {paymentMethod === "card" && (
                <div className="card-form">
                  <label>
                    Name on card
                    <input
                      type="text"
                      placeholder="Asha Patel"
                      value={card.name}
                      onChange={(e) => setCard({ ...card, name: e.target.value })}
                      required
                    />
                  </label>
                  <label>
                    Card number
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="4242 4242 4242 4242"
                      maxLength={19}
                      value={card.number}
                      onChange={(e) => setCard({ ...card, number: e.target.value })}
                      required
                    />
                  </label>
                  <div className="card-form-row">
                    <label>
                      Expiry
                      <input
                        type="text"
                        placeholder="MM/YY"
                        maxLength={5}
                        value={card.expiry}
                        onChange={(e) => setCard({ ...card, expiry: e.target.value })}
                        required
                      />
                    </label>
                    <label>
                      CVV
                      <input
                        type="password"
                        placeholder="123"
                        maxLength={4}
                        value={card.cvv}
                        onChange={(e) => setCard({ ...card, cvv: e.target.value })}
                        required
                      />
                    </label>
                  </div>
                  <p className="payment-note">This is a demo payment form - no real charge is made.</p>
                </div>
              )}

              {paymentMethod === "upi" && (
                <div className="card-form">
                  <label>
                    UPI ID
                    <input
                      type="text"
                      placeholder="yourname@bank"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      required
                    />
                  </label>
                  <p className="payment-note">This is a demo payment form - no real charge is made.</p>
                </div>
              )}

              {paymentMethod === "cash" && (
                <p className="payment-note">You'll pay the full amount directly at the hotel at check-in.</p>
              )}
            </div>

            <button type="submit" className="btn-solid" disabled={submitting || !selectedRoom}>
              {submitting
                ? "Processing..."
                : !user
                ? "Log in to book"
                : paymentMethod === "cash"
                ? "Reserve room"
                : "Pay & book"}
            </button>
          </form>

          {message && (
            <p className={`status-text ${messageType === "error" ? "status-error" : "status-success"}`}>
              {message}
            </p>
          )}
        </aside>
      </div>
    </div>
  );
};

export default HotelDetails;
