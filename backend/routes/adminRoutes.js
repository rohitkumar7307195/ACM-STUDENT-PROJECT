
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const Registration = require("../models/Registration");

const router = express.Router();

// Validate admin environment configuration
function checkAdminConfig(req, res, next) {
  if (
    !process.env.ADMIN_USERNAME ||
    !process.env.ADMIN_PASSWORD_HASH ||
    !process.env.JWT_SECRET
  ) {
    return res.status(500).json({
      success: false,
      message: "Admin authentication is not configured correctly.",
    });
  }

  next();
}

// Limit repeated login attempts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login attempts. Try again after 15 minutes.",
  },
});

// POST /api/admin/login
router.post("/login", checkAdminConfig, loginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body || {};

    if (
      typeof username !== "string" ||
      typeof password !== "string" ||
      !username.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required.",
      });
    }

    const usernameMatches =
      username.trim() === process.env.ADMIN_USERNAME;

    let passwordMatches = false;

    try {
      passwordMatches = await bcrypt.compare(
        password,
        process.env.ADMIN_PASSWORD_HASH
      );
    } catch (error) {
      console.error("Password comparison error:", error.message);
    }

    // Temporary diagnostics. Never log passwords, hashes, or tokens.
    

    if (!usernameMatches || !passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password.",
      });
    }

    const token = jwt.sign(
      { role: "admin" },
      process.env.JWT_SECRET,
      {
        expiresIn: "2h",
        issuer: "acm-student-chapter",
        audience: "acm-admin-dashboard",
        algorithm: "HS256",
      }
    );

    return res.json({
      success: true,
      message: "Admin login successful.",
      token,
      expiresIn: 7200,
    });
  } catch (error) {
    console.error("Admin login error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to process admin login.",
    });
  }
});

// Verify JWT for protected dashboard APIs
function verifyAdminToken(req, res, next) {
  const authHeader = req.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authentication required. Please log in.",
    });
  }

  const token = authHeader.slice(7).trim();

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Invalid authorization header.",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: "acm-student-chapter",
      audience: "acm-admin-dashboard",
      algorithms: ["HS256"],
    });

    if (decoded.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required.",
      });
    }

    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token is invalid or expired. Please log in again.",
    });
  }
}

// All routes below this line require a valid JWT
router.use(verifyAdminToken);

// GET /api/admin/stats
router.get("/stats", async (req, res) => {
  try {
    const [total, years, events] = await Promise.all([
      Registration.countDocuments(),
      Registration.aggregate([
        {
          $group: {
            _id: "$year",
            count: { $sum: 1 },
          },
        },
      ]),
      Registration.aggregate([
        {
          $group: {
            _id: "$event",
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    return res.json({
      success: true,
      stats: {
        total,
        years: Object.fromEntries(
          years.map((item) => [
            item._id || "Not specified",
            item.count,
          ])
        ),
        events: Object.fromEntries(
          events.map((item) => [
            item._id || "Not specified",
            item.count,
          ])
        ),
      },
    });
  } catch (error) {
    console.error("Admin stats error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Could not load registration statistics.",
    });
  }
});

// GET /api/admin/registrations?search=&year=&event=
router.get("/registrations", async (req, res) => {
  try {
    const {
      search = "",
      year = "",
      event = "",
    } = req.query;

    if (
      typeof search !== "string" ||
      typeof year !== "string" ||
      typeof event !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid search or filter parameters.",
      });
    }

    const filter = {};

    if (year) filter.year = year;
    if (event) filter.event = event;

    if (search.trim()) {
      const escaped = search
        .trim()
        .slice(0, 100)
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      const searchRegex = new RegExp(escaped, "i");

      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { college: searchRegex },
      ];
    }

    const registrations = await Registration.find(filter)
      .select("-__v")
      .sort({ createdAt: -1 })
      .limit(500)
      .lean();

    return res.json({
      success: true,
      count: registrations.length,
      registrations,
    });
  } catch (error) {
    console.error("Admin registrations error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Could not load registrations.",
    });
  }
});

module.exports = router;
