const mongoose = require("mongoose");
const path = require("path");

require("dotenv").config({
  path: path.join(__dirname, "..", ".env"),
});

const Course = require("../models/Course");

const courses = [
  {
    title: "JavaScript Fundamentals",
    description:
      "Learn variables, functions, arrays and basic problem solving.",
    level: "Beginner",
    skills: ["JavaScript", "Problem Solving"],
  },
  {
    title: "Python for Data Analysis",
    description:
      "Learn Python basics and practice working with data.",
    level: "Beginner",
    skills: ["Python", "Data Analysis"],
  },
  {
    title: "UI/UX Design Basics",
    description:
      "Learn user research, wireframing and interface prototyping.",
    level: "Beginner",
    skills: ["Figma", "Wireframing", "Prototyping"],
  },
];

async function seedCourses() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing in .env");
    }

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    await Course.init();

    for (const course of courses) {
      await Course.updateOne(
        { title: course.title },
        { $setOnInsert: course },
        { upsert: true, runValidators: true }
      );
    }

    console.log("Sample courses added successfully");
  } catch (error) {
    console.error("Course seed failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seedCourses();