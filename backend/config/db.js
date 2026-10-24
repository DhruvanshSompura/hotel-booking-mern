const mongoose = require("mongoose");
console.log("MONGO_URI =", process.env.MONGO_URI);

// Connects to MongoDB using the connection string in .env
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1); // stop the app if we can't connect to the database
  }
};

module.exports = connectDB;
