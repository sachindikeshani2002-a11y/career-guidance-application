const express = require("express");
const Career = require("../models/Career");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// GET /api/careers
router.get("/", authMiddleware, async (req, res) => {
  try {
    const filter = {};
    if (
      typeof req.query.field === "string" &&
      req.query.field.trim() &&
      req.query.field !== "All" &&
      req.query.field !== "All Fields"
    ) {
      filter.field = new RegExp(`^${escapeRegex(req.query.field.trim())}$`, "i");
    }

    const careers = await Career.find(filter)
      .sort({ title: 1 })
      .select(
        "title field description skills responsibilities educationGuidance disclaimer"
      )
      .lean();

    return res.json({ careers });
  } catch (error) {
    console.error("Career loading error:", error.message);

    return res.status(500).json({
      message: "Unable to load career paths",
    });
  }
});

module.exports = router;
