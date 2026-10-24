import React from "react";

// Displays a row of 5 stars, filled up to `value` (supports halves, e.g. 3.5).
// Pass `size="sm" | "md" | "lg"` to control star size.
const StarRating = ({ value = 0, size = "md" }) => {
  const stars = [1, 2, 3, 4, 5].map((n) => {
    if (value >= n) return "full";
    if (value >= n - 0.5) return "half";
    return "empty";
  });

  return (
    <span className={`star-rating star-rating-${size}`} aria-label={`${value} out of 5 stars`}>
      {stars.map((state, i) => (
        <span key={i} className={`star star-${state}`}>
          ★
        </span>
      ))}
    </span>
  );
};

export default StarRating;
