# Haven — Beginner MERN Hotel Booking System

A simple, full-stack hotel booking app built with MongoDB, Express, React, and Node (MERN).

**Features**
- Browse hotels, search by city
- View hotel details and prices
- Sign up / log in (JWT-based authentication)
- Book a hotel for chosen dates (with basic room-availability checking)
- View and cancel your own bookings

This project intentionally keeps things simple — no TypeScript, no Redux, no Tailwind config, plain CSS and REST calls with axios — so it's easy to read and extend as a learning project.

---

## Project structure

```
hotel-booking-mern/
  backend/     Express API + MongoDB (Mongoose)
  frontend/    React app (Create React App)
```

---

## 1. Prerequisites

- [Node.js](https://nodejs.org) v18 or later
- A MongoDB database — either:
  - a free cluster on [MongoDB Atlas](https://www.mongodb.com/atlas), or
  - MongoDB installed locally

---

## 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Open `.env` and fill in:
- `MONGO_URI` — your MongoDB connection string
- `JWT_SECRET` — any long random string (used to sign login tokens)

Add some sample hotels to your database:

```bash
node seed.js
```

Start the API server:

```bash
npm run dev
```

The backend will run at **http://localhost:5000**. Visit that URL in your browser — you should see "Hotel Booking API is running".

---

## 3. Frontend setup

Open a **second terminal**:

```bash
cd frontend
npm install
npm start
```

The React app will open at **http://localhost:3000** and talk to the API at `http://localhost:5000/api` (configured in `src/api/axios.js`).

---

## 4. Using the app

1. Go to `http://localhost:3000`
2. Click **Sign up** to create an account
3. Browse hotels on the home page, search by city
4. Click a hotel to see details and book it (choose check-in / check-out dates)
5. View your bookings under **My bookings**, and cancel if needed

---

## How it works (for learning)

**Backend (`/backend`)**
- `models/` — Mongoose schemas for `User`, `Hotel`, `Booking`
- `routes/` — REST endpoints (`/api/auth`, `/api/hotels`, `/api/bookings`)
- `middleware/auth.js` — checks the JWT token on protected routes
- Passwords are hashed with `bcryptjs` before being saved — never stored as plain text
- Booking creation checks for overlapping dates against `hotel.totalRooms` to avoid overbooking

**Frontend (`/frontend`)**
- `context/AuthContext.js` — holds the logged-in user + token in React state and `localStorage`
- `api/axios.js` — a shared axios instance that automatically attaches the login token to every request
- `pages/` — one component per screen (Home, HotelDetails, Login, Register, MyBookings)
- `components/PrivateRoute.jsx` — redirects to `/login` if you try to visit a protected page while logged out

---

## Ideas to extend this project

- Add an admin page to create/edit hotels through the UI (the `POST /api/hotels` route already exists)
- Add pagination or filtering by price range
- Add hotel image uploads instead of image URLs
- Add email confirmation for bookings
- Add a star-rating / review system
- Deploy: frontend to Vercel/Netlify, backend to Render/Railway, database on MongoDB Atlas
