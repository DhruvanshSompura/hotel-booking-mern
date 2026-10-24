import React, { useEffect, useState } from "react";
import api from "../api/axios";
import HotelCard from "../components/HotelCard";
import HotelFilters from "../components/HotelFilters";

const Home = () => {
  const [hotels, setHotels] = useState([]);
  const [cities, setCities] = useState([]);
  const [cityInput, setCityInput] = useState("");
  const [city, setCity] = useState("");
  const [selectedStars, setSelectedStars] = useState([]);
  const [sort, setSort] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Server-side pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalHotels, setTotalHotels] = useState(0);

  const itemsPerPage = 3;

  // Load available cities
  useEffect(() => {
    api
      .get("/hotels/meta/cities")
      .then((res) => setCities(res.data))
      .catch(() => {});
  }, []);

  // Fetch hotels from backend
  useEffect(() => {
    const fetchHotels = async () => {
      setLoading(true);
      setError("");

      try {
        const params = {
          page: currentPage,
          limit: itemsPerPage,
        };

        if (city) {
          params.city = city;
        }

        if (selectedStars.length > 0) {
          params.stars = selectedStars.join(",");
        }

        if (sort) {
          params.sort = sort;
        }

        const res = await api.get("/hotels", { params });

        // Backend response contains a hotels array and pagination details
        const data = res.data;

        if (Array.isArray(data)) {
          // Backward compatibility if the backend still returns an array
          setHotels(data);
          setTotalHotels(data.length);
          setTotalPages(Math.ceil(data.length / itemsPerPage));
        } else {
          setHotels(Array.isArray(data.hotels) ? data.hotels : []);
          setTotalHotels(data.totalHotels || 0);
          setTotalPages(data.totalPages || 0);
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Could not load hotels. Is the backend server running?"
        );
        setHotels([]);
        setTotalHotels(0);
        setTotalPages(0);
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, [city, selectedStars, sort, currentPage]);

  // Search hotels
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    setCity(cityInput.trim());
  };

  // Toggle star rating filter
  const handleToggleStar = (stars) => {
    setCurrentPage(1);

    setSelectedStars((prev) =>
      prev.includes(stars)
        ? prev.filter((s) => s !== stars)
        : [...prev, stars]
    );
  };

  // Select city
  const handleSelectCity = (selectedCity) => {
    setCurrentPage(1);
    setCityInput(selectedCity);
    setCity(selectedCity);
  };

  // Change sorting
  const handleSortChange = (value) => {
    setCurrentPage(1);
    setSort(value);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setCurrentPage(1);
    setSelectedStars([]);
    setSort("");
    setCity("");
    setCityInput("");
  };

  // Previous page
  const handlePrevious = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  // Next page
  const handleNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <div className="page">
      <section className="hero">
        <h1>Find your next stay</h1>

        <p>
          Search hotels by city, filter by star rating, and book a room in a
          few clicks.
        </p>

        <form className="search-bar" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search by city or area, e.g. Goa"
            value={cityInput}
            onChange={(e) => setCityInput(e.target.value)}
          />

          <button type="submit" className="btn-solid">
            Search
          </button>
        </form>
      </section>

      <div className="home-layout">
        <HotelFilters
          cities={cities}
          selectedStars={selectedStars}
          onToggleStar={handleToggleStar}
          sort={sort}
          onSortChange={handleSortChange}
          city={city}
          onSelectCity={handleSelectCity}
          onClear={handleClearFilters}
        />

        <div className="home-results">
          {loading && (
            <p className="status-text">Loading hotels...</p>
          )}

          {!loading && error && (
            <p className="status-text status-error">{error}</p>
          )}

          {!loading && !error && hotels.length === 0 && (
            <p className="status-text">
              No hotels found. Try different filters, or run the seed
              script to add sample data.
            </p>
          )}

          {!loading && !error && hotels.length > 0 && (
            <>
              <p className="results-count">
                {totalHotels} hotel{totalHotels !== 1 ? "s" : ""} found
              </p>

              <div className="hotel-grid">
                {hotels.map((hotel) => (
                  <HotelCard key={hotel._id} hotel={hotel} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    type="button"
                    onClick={handlePrevious}
                    disabled={currentPage === 1 || loading}
                    className="pagination-button"
                  >
                    Previous
                  </button>

                  <span className="page-indicator">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={currentPage >= totalPages || loading}
                    className="pagination-button"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
