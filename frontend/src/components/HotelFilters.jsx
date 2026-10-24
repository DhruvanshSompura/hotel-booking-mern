import React from "react";

const STAR_OPTIONS = [5, 4, 3, 2, 1];

const HotelFilters = ({
  cities,
  selectedStars,
  onToggleStar,
  sort,
  onSortChange,
  city,
  onSelectCity,
  onClear,
}) => {
  const hasActiveFilters = selectedStars.length > 0 || sort !== "" || city !== "";

  return (
    <aside className="filters-panel">
      <div className="filters-panel-header">
        <h3>Filters</h3>
        {hasActiveFilters && (
          <button type="button" className="filters-clear-btn" onClick={onClear}>
            Clear all
          </button>
        )}
      </div>

      <div className="filter-group">
        <p className="filter-group-title">Star rating</p>
        {STAR_OPTIONS.map((stars) => (
          <label key={stars} className="filter-checkbox">
            <input
              type="checkbox"
              checked={selectedStars.includes(stars)}
              onChange={() => onToggleStar(stars)}
            />
            <span className="filter-stars">
              {"★".repeat(stars)}
              {"☆".repeat(5 - stars)}
            </span>
          </label>
        ))}
      </div>

      <div className="filter-group">
        <p className="filter-group-title">Sort by</p>
        <select value={sort} onChange={(e) => onSortChange(e.target.value)} className="filter-select">
          <option value="">Recommended</option>
          <option value="rating_desc">Highest rated</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
        </select>
      </div>

      {cities && cities.length > 0 && (
        <div className="filter-group">
          <p className="filter-group-title">Location</p>
          <div className="filter-city-tags">
            {cities.map((c) => (
              <button
                type="button"
                key={c}
                className={`filter-city-tag ${city === c ? "filter-city-tag-active" : ""}`}
                onClick={() => onSelectCity(city === c ? "" : c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
};

export default HotelFilters;
