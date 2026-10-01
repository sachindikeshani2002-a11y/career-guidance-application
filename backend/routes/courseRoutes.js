const express = require("express");
const Course = require("../models/Course");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const courses = await Course.find()
      .sort({ title: 1 })
      .select("title description level skills")
      .lean();

    return res.json({ courses });
  } catch (error) {
    console.error("Course loading error:", error.message);

    return res.status(500).json({
      message: "Unable to load courses",
    });
  }
});

module.exports = router;