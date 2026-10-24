import React, { useState } from "react";

// A clickable row of 5 stars for picking a 1-5 rating, e.g. when writing a review.
const StarRatingInput = ({ value, onChange }) => {
  const [hovered, setHovered] = useState(0);

  return (
    <span className="star-rating-input" onMouseLeave={() => setHovered(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          type="button"
          key={n}
          className={`star-input-btn ${(hovered || value) >= n ? "star-input-filled" : ""}`}
          onMouseEnter={() => setHovered(n)}
          onClick={() => onChange(n)}
          aria-label={`Rate ${n} star${n > 1 ? "s" : ""}`}
        >
          ★
        </button>
      ))}
    </span>
  );
};

export default StarRatingInput;
