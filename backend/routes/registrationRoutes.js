
const express = require("express");
const Registration = require("../models/Registration");

const router = express.Router();

// GET: Fetch all registrations
router.get("/", async (req, res) => {
  try {
    const registrations = await Registration.find().sort({
      createdAt: -1
    });

    return res.status(200).json({
      success: true,
      total: registrations.length,
      registrations
    });
  } catch (error) {
    console.error("Fetch registrations error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch registrations."
    });
  }
});

// POST: Submit a new registration
router.post("/", async (req, res) => {
  try {
    const { name, email, college, year, event, interest } = req.body;

    if (!name || !email || !college || !year || !event) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields."
      });
    }

    const registration = await Registration.create({
      name,
      email,
      college,
      year,
      event,
      interest
    });

    return res.status(201).json({
      success: true,
      message: "Registration submitted successfully!",
      registrationId: registration._id
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Invalid registration details.",
        errors: Object.values(error.errors).map(
          (item) => item.message
        )
      });
    }

    console.error("Registration error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to save registration. Please try again."
    });
  }
});

module.exports = router;
