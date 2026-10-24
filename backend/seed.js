// Run this once with: node seed.js

require("dotenv").config();

const mongoose = require("mongoose");
const Hotel = require("./models/Hotel");
const Review = require("./models/Review");
const User = require("./models/User");

// ======================================================
// SAMPLE HOTELS
// ======================================================

const sampleHotels = [
  {
    name: "Sunset Bay Resort",
    city: "Goa",
    address: "Candolim Beach Road, Goa",
    description:
      "A relaxed beachfront resort with a pool and sea-facing rooms.",
    starRating: 5,

    image:
      "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800",

    images: [
      "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
    ],

    rooms: [
      {
        type: "Deluxe",
        description:
          "Spacious sea-facing room with a private balcony.",
        pricePerNight: 6500,
        totalRooms: 4,
        capacity: 3,
        amenities: [
          "AC",
          "Sea view",
          "Free Wi-Fi",
          "Breakfast included",
        ],
        images: [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800",
          "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800",
        ],
      },
      {
        type: "Non-Deluxe",
        description:
          "Cosy standard room, a short walk from the beach.",
        pricePerNight: 4500,
        totalRooms: 8,
        capacity: 2,
        amenities: ["AC", "Free Wi-Fi"],
        images: [
          "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800",
          "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800",
        ],
      },
    ],
  },

  {
    name: "Mountain View Lodge",
    city: "Manali",
    address: "Old Manali Road, Manali",
    description:
      "Cosy wooden cabins with views of the Himalayas.",
    starRating: 3,

    image:
      "https://images.unsplash.com/photo-1518733057094-95b53143d2a7?w=800",

    images: [
      "https://images.unsplash.com/photo-1518733057094-95b53143d2a7?w=800",
      "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800",
      "https://images.unsplash.com/photo-1517320964276-a002fa203177?w=800",
    ],

    rooms: [
      {
        type: "Deluxe",
        description:
          "Wooden cabin with a fireplace and mountain-facing window.",
        pricePerNight: 4200,
        totalRooms: 3,
        capacity: 4,
        amenities: [
          "Fireplace",
          "Mountain view",
          "Free Wi-Fi",
        ],
        images: [
          "https://images.unsplash.com/photo-1595521969144-7ad42ff77ebd?w=800",
          "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800",
        ],
      },
      {
        type: "Non-Deluxe",
        description:
          "Simple cabin room, perfect for a short stay.",
        pricePerNight: 3200,
        totalRooms: 6,
        capacity: 2,
        amenities: [
          "Hot water",
          "Free Wi-Fi",
        ],
        images: [
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
          "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800",
        ],
      },
    ],
  },

  {
    name: "City Central Inn",
    city: "Mumbai",
    address: "Marine Drive, Mumbai",
    description:
      "A modern hotel in the heart of the city, close to everything.",
    starRating: 4,

    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",

    images: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800",
      "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800",
    ],

    rooms: [
      {
        type: "Deluxe",
        description:
          "High-floor room with a skyline view and a work desk.",
        pricePerNight: 8000,
        totalRooms: 6,
        capacity: 2,
        amenities: [
          "AC",
          "City view",
          "Free Wi-Fi",
          "Minibar",
        ],
        images: [
          "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800",
          "https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800",
        ],
      },
      {
        type: "Non-Deluxe",
        description:
          "Comfortable city-facing room for the budget traveller.",
        pricePerNight: 6000,
        totalRooms: 12,
        capacity: 2,
        amenities: ["AC", "Free Wi-Fi"],
        images: [
          "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800",
          "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800",
        ],
      },
    ],
  },

  {
    name: "Palace Heritage Hotel",
    city: "Jaipur",
    address: "Amer Road, Jaipur",
    description:
      "A restored royal palace with courtyards and traditional decor.",
    starRating: 5,

    image:
      "https://images.unsplash.com/photo-1587874522483-b45c94e6b5f7?w=800",

    images: [
      "https://images.unsplash.com/photo-1587874522483-b45c94e6b5f7?w=800",
      "https://images.unsplash.com/photo-1524230659092-07f99a75c013?w=800",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
    ],

    rooms: [
      {
        type: "Deluxe",
        description:
          "Royal suite with hand-painted walls and a courtyard view.",
        pricePerNight: 9500,
        totalRooms: 4,
        capacity: 3,
        amenities: [
          "AC",
          "Courtyard view",
          "Free Wi-Fi",
          "Breakfast included",
        ],
        images: [
          "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800",
          "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800",
        ],
      },
      {
        type: "Non-Deluxe",
        description:
          "Traditionally furnished standard room.",
        pricePerNight: 5500,
        totalRooms: 10,
        capacity: 2,
        amenities: ["AC", "Free Wi-Fi"],
        images: [
          "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800",
          "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800",
        ],
      },
    ],
  },
];

// ======================================================
// SAMPLE REVIEWS
// ======================================================

const sampleReviewTemplates = [
  {
    rating: 5,
    title: "Wonderful stay",
    comment:
      "Everything was spotless and the staff went out of their way to help. Would book again.",
  },
  {
    rating: 4,
    title: "Great value",
    comment:
      "Comfortable room and a good location. Breakfast could have had more variety.",
  },
  {
    rating: 5,
    title: "Exceeded expectations",
    comment:
      "The room was bigger than the photos suggested and check-in was quick and friendly.",
  },
  {
    rating: 3,
    title: "Decent but noisy",
    comment:
      "Bed was comfortable, but we could hear traffic at night. Otherwise a fine stay.",
  },
  {
    rating: 4,
    title: "Would recommend",
    comment:
      "Nice amenities and a helpful front desk. Parking was a little tight.",
  },
];

// ======================================================
// SEED DATABASE
// ======================================================

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("Connected to MongoDB");

    await Hotel.deleteMany({});
    await Review.deleteMany({});

    console.log("Old hotels and reviews removed");

    // Create / reuse demo users
    let demoUsers = await User.find({
      email: { $regex: "^demo-reviewer" },
    });

    const neededDemoUsers = 3;

    for (let i = demoUsers.length; i < neededDemoUsers; i++) {
      const createdUser = await User.create({
        name:
          ["Priya Sharma", "Rahul Verma", "Ananya Iyer"][i] ||
          `Demo Reviewer ${i + 1}`,

        email: `demo-reviewer-${i + 1}@example.com`,

        password: "password123",
      });

      demoUsers.push(createdUser);
    }

    // ==================================================
    // ADD HOTELS
    // ==================================================

    for (const hotelData of sampleHotels) {

      // IMPORTANT:
      // Hotel.js requires pricePerNight and totalRooms.
      // So calculate them BEFORE save/validation.
      const hotel = new Hotel(hotelData);

      if (hotel.rooms && hotel.rooms.length > 0) {

        hotel.pricePerNight = Math.min(
          ...hotel.rooms.map(
            (room) => room.pricePerNight
          )
        );

        hotel.totalRooms = hotel.rooms.reduce(
          (sum, room) => sum + room.totalRooms,
          0
        );
      }

      await hotel.save();

      console.log(
        `Hotel added: ${hotel.name} | Starting price: ₹${hotel.pricePerNight}`
      );

      // ==================================================
      // ADD REVIEWS
      // ==================================================

      const reviewCount =
        2 + (hotel.name.length % 2);

      const chosenTemplates =
        sampleReviewTemplates
          .slice()
          .sort(() => 0.5 - Math.random())
          .slice(0, reviewCount);

      for (
        let i = 0;
        i < chosenTemplates.length;
        i++
      ) {

        const reviewer =
          demoUsers[i % demoUsers.length];

        await Review.create({
          hotel: hotel._id,
          user: reviewer._id,
          userName: reviewer.name,
          rating: chosenTemplates[i].rating,
          title: chosenTemplates[i].title,
          comment: chosenTemplates[i].comment,
        });
      }

      // ==================================================
      // UPDATE RATING
      // ==================================================

      const reviews = await Review.find({
        hotel: hotel._id,
      });

      const numReviews = reviews.length;

      const avgRating =
        numReviews > 0
          ? Math.round(
              (
                reviews.reduce(
                  (sum, review) =>
                    sum + review.rating,
                  0
                ) / numReviews
              ) * 10
            ) / 10
          : 0;

      await Hotel.findByIdAndUpdate(
        hotel._id,
        {
          avgRating,
          numReviews,
        }
      );
    }

    console.log(
      "Sample hotels (with rooms, photos & reviews) added successfully!"
    );

  } catch (err) {

    console.error(
      "Error seeding database:",
      err.message
    );

  } finally {

    await mongoose.connection.close();

  }
};

// Start seeding
seedDatabase();