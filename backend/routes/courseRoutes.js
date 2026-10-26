const express = require("express");
const mongoose = require("mongoose");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

const ALLOWED_COURSE_FIELDS = ["title", "description", "level", "skills"];
const VALID_LEVELS = ["Beginner", "Intermediate", "Advanced"];

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function cleanSkillsList(skills) {
  if (!Array.isArray(skills)) return [];
  const seen = new Set();

  return skills
    .map((s) => (typeof s === "string" ? s.trim() : ""))
    .filter(Boolean)
    .filter((s) => {
      const lower = s.toLowerCase();
      if (seen.has(lower)) return false;
      seen.add(lower);
      return true;
    });
}

function validateCoursePayload(body, isUpdate = false) {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return "Request body must be a valid JSON object";
  }

  const keys = Object.keys(body);

  const disallowed = keys.filter((k) => !ALLOWED_COURSE_FIELDS.includes(k));
  if (disallowed.length > 0) {
    return `Disallowed field(s): ${disallowed.join(", ")}. Allowed fields are title, description, level, skills`;
  }

  if (isUpdate && keys.length === 0) {
    return "Provide at least one field to update";
  }

  const { title, description, level, skills } = body;

  // Title validation
  if (!isUpdate || title !== undefined) {
    if (typeof title !== "string" || !title.trim()) {
      return "Course title is required and cannot be empty";
    }
    const cleanTitle = title.trim();
    if (cleanTitle.length < 2 || cleanTitle.length > 100) {
      return "Title must contain between 2 and 100 characters";
    }
  }

  // Description validation
  if (!isUpdate || description !== undefined) {
    if (typeof description !== "string" || !description.trim()) {
      return "Course description is required and cannot be empty";
    }
    const cleanDesc = description.trim();
    if (cleanDesc.length < 10 || cleanDesc.length > 1000) {
      return "Description must contain between 10 and 1000 characters";
    }
  }

  // Level validation
  if (!isUpdate || level !== undefined) {
    if (typeof level !== "string" || !VALID_LEVELS.includes(level)) {
      return `Level must be one of: ${VALID_LEVELS.join(", ")}`;
    }
  }

  // Skills validation
  if (skills !== undefined) {
    if (!Array.isArray(skills)) {
      return "Skills must be an array of strings";
    }
    if (skills.length > 20) {
      return "A course can list at most 20 skills";
    }
    for (const skill of skills) {
      if (
        typeof skill !== "string" ||
        !skill.trim() ||
        skill.trim().length > 60
      ) {
        return "Each skill must be a string between 1 and 60 characters";
      }
    }
  }

  return null;
}

// GET /api/courses - List all active courses (Any authenticated user)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const courses = await Course.find({ isDeleting: { $ne: true } })
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

// GET /api/courses/:id - View course details (Any authenticated user)
router.get("/:id", authMiddleware, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({
      message: "Invalid course ID",
    });
  }

  try {
    const course = await Course.findOne({
      _id: req.params.id,
      isDeleting: { $ne: true },
    })
      .select("title description level skills createdAt updatedAt")
      .lean();

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    return res.json({ course });
  } catch (error) {
    console.error("Course detail error:", error.message);
    return res.status(500).json({
      message: "Unable to load course details",
    });
  }
});

// POST /api/courses - Create a new course (Admin only)
router.post("/", authMiddleware, adminMiddleware, async (req, res) => {
  const validationError = validateCoursePayload(req.body, false);
  if (validationError) {
    return res.status(400).json({
      message: validationError,
    });
  }

  const cleanTitle = req.body.title.trim();
  const cleanDescription = req.body.description.trim();
  const cleanLevel = req.body.level || "Beginner";
  const cleanedSkills = cleanSkillsList(req.body.skills || []);

  try {
    const existing = await Course.findOne({
      title: new RegExp(`^${escapeRegex(cleanTitle)}$`, "i"),
    });

    if (existing) {
      return res.status(409).json({
        message: "A course with this title already exists",
      });
    }

    const course = await Course.create({
      title: cleanTitle,
      description: cleanDescription,
      level: cleanLevel,
      skills: cleanedSkills,
    });

    return res.status(201).json({
      message: "Course created successfully",
      course: {
        _id: course._id,
        title: course.title,
        description: course.description,
        level: course.level,
        skills: course.skills,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "A course with this title already exists",
      });
    }

    console.error("Course creation error:", error.message);
    return res.status(500).json({
      message: "Unable to create course",
    });
  }
});

// PUT /api/courses/:id - Update an existing course (Admin only)
router.put("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({
      message: "Invalid course ID",
    });
  }

  const validationError = validateCoursePayload(req.body, true);
  if (validationError) {
    return res.status(400).json({
      message: validationError,
    });
  }

  try {
    const course = await Course.findOne({
      _id: req.params.id,
      isDeleting: { $ne: true },
    });

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    const updates = {};

    if (req.body.title !== undefined) {
      const cleanTitle = req.body.title.trim();
      const duplicate = await Course.findOne({
        _id: { $ne: req.params.id },
        title: new RegExp(`^${escapeRegex(cleanTitle)}$`, "i"),
      });

      if (duplicate) {
        return res.status(409).json({
          message: "A course with this title already exists",
        });
      }

      updates.title = cleanTitle;
    }

    if (req.body.description !== undefined) {
      updates.description = req.body.description.trim();
    }

    if (req.body.level !== undefined) {
      updates.level = req.body.level;
    }

    if (req.body.skills !== undefined) {
      updates.skills = cleanSkillsList(req.body.skills);
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { returnDocument: "after", runValidators: true }
    )
      .select("title description level skills createdAt updatedAt")
      .lean();

    return res.json({
      message: "Course updated successfully",
      course: updatedCourse,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "A course with this title already exists",
      });
    }

    console.error("Course update error:", error.message);
    return res.status(500).json({
      message: "Unable to update course",
    });
  }
});

// DELETE /api/courses/:id - Delete a course safely (Admin only)
router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({
      message: "Invalid course ID",
    });
  }

  try {
    const course = await Course.findOne({
      _id: req.params.id,
      isDeleting: { $ne: true },
    });

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    // Step 1: Enforce referential integrity - student learning history must be preserved
    const enrollmentCount = await Enrollment.countDocuments({
      course: req.params.id,
    });

    if (enrollmentCount > 0) {
      return res.status(409).json({
        message: `Cannot delete course: ${enrollmentCount} student enrollment record(s) exist. Student learning history must be preserved.`,
        enrollmentCount,
      });
    }

    // Step 2: Atomic lock to mark course as deleting against concurrent operations
    const lockedCourse = await Course.findOneAndUpdate(
      { _id: req.params.id, isDeleting: { $ne: true } },
      { $set: { isDeleting: true } },
      { returnDocument: "after" }
    );

    if (!lockedCourse) {
      return res.status(404).json({
        message: "Course not found or already being deleted",
      });
    }

    // Step 3: Double-check to catch any enrollment that slipped in before atomic lock
    const raceEnrollments = await Enrollment.countDocuments({
      course: req.params.id,
    });

    if (raceEnrollments > 0) {
      await Course.updateOne(
        { _id: req.params.id },
        { $set: { isDeleting: false } }
      );

      return res.status(409).json({
        message:
          "Cannot delete course: a student enrolled during this operation. Student learning history must be preserved.",
        enrollmentCount: raceEnrollments,
      });
    }

    // Step 4: Safely delete the unreferenced course
    await Course.findByIdAndDelete(req.params.id);

    return res.json({
      message: "Course deleted successfully",
      course: {
        _id: lockedCourse._id,
        title: lockedCourse.title,
        description: lockedCourse.description,
        level: lockedCourse.level,
      },
    });
  } catch (error) {
    console.error("Course deletion error:", error.message);
    return res.status(500).json({
      message: "Unable to delete course",
    });
  }
});

module.exports = router;
