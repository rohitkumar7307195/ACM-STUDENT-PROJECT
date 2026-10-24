
const express = require("express");

const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const registrationRoutes = require("./routes/registrationRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();
app.set("trust proxy", 1);
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Home route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "ACM Student Chapter Backend is running!",
  });
});

// Registration API
app.use("/api/registrations", registrationRoutes);

// Admin Dashboard API
app.use("/api/admin", adminRoutes);

// Start server after MongoDB connection
async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error(
        "MONGODB_URI missing hai. Backend .env file check karo."
      );
    }

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB Atlas connected successfully!");

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server startup error:", error.message);
    process.exit(1);
  }
}

startServer();
