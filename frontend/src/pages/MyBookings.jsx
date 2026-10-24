import React, { useEffect, useState } from "react";
import api from "../api/axios";

const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";

  const date = new Date(dateStr);

  if (Number.isNaN(date.getTime())) return "N/A";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await api.get("/bookings/my");

      if (!Array.isArray(res.data)) {
        throw new Error("Unexpected response from bookings API.");
      }

      setBookings(res.data);
    } catch (err) {
      console.error("My Bookings API Error:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });

      setBookings([]);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Could not load your bookings."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (bookingId) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this booking?"
    );

    if (!confirmed) return;

    setCancellingId(bookingId);
    setError("");

    try {
      await api.put(`/bookings/${bookingId}/cancel`);
      await fetchBookings();
    } catch (err) {
      console.error("Cancel Booking Error:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });

      setError(
        err.response?.data?.message ||
          "Could not cancel this booking."
      );
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="page">
      <h1>My bookings</h1>

      {loading && (
        <p className="status-text">Loading your bookings...</p>
      )}

      {!loading && error && (
        <p className="status-text status-error" role="alert">
          {error}
        </p>
      )}

      {!loading && !error && bookings.length === 0 && (
        <p className="status-text">
          You haven't booked anything yet.
        </p>
      )}

      {!loading && !error && bookings.length > 0 && (
        <div className="booking-list">
          {bookings.map((booking) => {
            const paymentMethod = (
              booking.paymentMethod || ""
            ).toLowerCase();

            const paymentStatus = (
              booking.paymentStatus || "pending"
            ).toLowerCase();

            const bookingStatus = (
              booking.status || "pending"
            ).toLowerCase();

            return (
              <div className="booking-item" key={booking._id}>
                <div
                  className="booking-item-image"
                  style={{
                    backgroundImage: booking.hotel?.image
                      ? `url("${booking.hotel.image}")`
                      : "none",
                  }}
                  role="img"
                  aria-label={booking.hotel?.name || "Hotel"}
                />

                <div className="booking-item-body">
                  <h3>
                    {booking.hotel?.name ||
                      "Hotel no longer available"}
                  </h3>

                  {booking.hotel?.city && (
                    <p className="hotel-card-city">
                      {booking.hotel.city}
                    </p>
                  )}

                  <p className="booking-item-room">
                    {booking.roomType || "Standard"} room
                  </p>

                  <p>
                    {formatDate(booking.checkIn)} →{" "}
                    {formatDate(booking.checkOut)} ·{" "}
                    {booking.guests || 1} guest
                    {booking.guests !== 1 ? "s" : ""}
                  </p>

                  <p className="booking-item-price">
                    Total: ₹
                    {Number(booking.totalPrice || 0).toLocaleString(
                      "en-IN"
                    )}
                  </p>

                  <div className="badge-row">
                    <span
                      className={`status-badge status-badge-${bookingStatus}`}
                    >
                      {bookingStatus}
                    </span>

                    <span
                      className={`status-badge status-badge-payment-${paymentStatus}`}
                    >
                      {paymentMethod === "cash"
                        ? "Pay at hotel"
                        : paymentStatus === "paid"
                        ? `Paid via ${
                            paymentMethod === "card"
                              ? "card"
                              : paymentMethod === "upi"
                              ? "UPI"
                              : paymentMethod || "online payment"
                          }`
                        : paymentStatus}
                    </span>
                  </div>
                </div>

                {bookingStatus === "confirmed" && (
                  <button
                    type="button"
                    className="btn-ghost"
                    disabled={cancellingId === booking._id}
                    onClick={() => handleCancel(booking._id)}
                  >
                    {cancellingId === booking._id
                      ? "Cancelling..."
                      : "Cancel"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!loading && error && (
        <button
          type="button"
          className="btn-ghost"
          onClick={fetchBookings}
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export default MyBookings;