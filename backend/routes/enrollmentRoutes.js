const express = require("express");
const mongoose = require("mongoose");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

// Get only the logged-in user's enrollments
router.get("/", async (req, res) => {
  try {
    const enrollments = await Enrollment.find({
      user: req.user._id,
    })
      .populate("course", "title description level")
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ enrollments });
  } catch (error) {
    console.error("Enrollment loading error:", error.message);
    return res.status(500).json({
      message: "Unable to load your enrollments",
    });
  }
});

// Enroll in a course (with referential integrity protection against concurrent deletion)
router.post("/", async (req, res) => {
  const { courseId } = req.body || {};

  if (
    typeof courseId !== "string" ||
    !/^[a-f0-9]{24}$/i.test(courseId)
  ) {
    return res.status(400).json({ message: "Invalid course ID" });
  }

  try {
    const course = await Course.findOne({
      _id: courseId,
      isDeleting: { $ne: true },
    });

    if (!course) {
      return res.status(404).json({
        message: "Course not found or is no longer available",
      });
    }

    const enrollment = await Enrollment.create({
      user: req.user._id,
      course: course._id,
    });

    // Referential integrity verification: ensure course was not deleted concurrently
    const courseStillActive = await Course.exists({
      _id: courseId,
      isDeleting: { $ne: true },
    });

    if (!courseStillActive) {
      await Enrollment.findByIdAndDelete(enrollment._id);
      return res.status(404).json({
        message: "Course is no longer available",
      });
    }

    return res.status(201).json({
      message: "Enrollment successful",
      enrollment,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "You are already enrolled in this course",
      });
    }

    console.error("Enrollment error:", error.message);
    return res.status(500).json({
      message: "Unable to enroll in this course",
    });
  }
});

// Mark the logged-in user's enrollment as completed
router.patch("/:id/complete", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid enrollment ID" });
  }

  try {
    const enrollment = await Enrollment.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!enrollment) {
      return res.status(404).json({
        message: "Enrollment not found",
      });
    }

    if (enrollment.status !== "Completed") {
      enrollment.status = "Completed";
      enrollment.completedAt = new Date();
      await enrollment.save();
    }

    return res.json({
      message: "Course marked as completed",
      enrollment,
    });
  } catch (error) {
    console.error("Completion error:", error.message);
    return res.status(500).json({
      message: "Unable to update your progress",
    });
  }
});

module.exports = router;
