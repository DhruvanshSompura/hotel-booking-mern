import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="navbar">
      <Link to="/" className="navbar-logo">
        Haven
      </Link>

      <nav className="navbar-links">
        <Link to="/">Hotels</Link>
        <Link to="/about">About</Link>
        {user && <Link to="/my-bookings">My bookings</Link>}

        {user ? (
          <div className="navbar-user">
            <span>Hi, {user.name.split(" ")[0]}</span>
            <button className="btn-ghost" onClick={handleLogout}>
              Log out
            </button>
          </div>
        ) : (
          <div className="navbar-user">
            <Link to="/login">Log in</Link>
            <Link to="/register" className="btn-solid-sm">
              Sign up
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
