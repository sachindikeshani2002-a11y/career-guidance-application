const express = require("express");
const Career = require("../models/Career");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// GET /api/careers
router.get("/", authMiddleware, async (req, res) => {
  try {
    const careers = await Career.find()
      .sort({ title: 1 })
      .select("title description skills")
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