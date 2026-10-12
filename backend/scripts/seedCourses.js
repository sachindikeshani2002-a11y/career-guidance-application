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
  {
    title: "Git and Version Control",
    description:
      "Learn repositories, commits, branches and merging.",
    level: "Beginner",
    skills: ["Git"],
  },
  {
    title: "Database Fundamentals",
    description:
      "Learn database concepts, data modeling and basic SQL queries.",
    level: "Beginner",
    skills: ["Databases", "SQL"],
  },
  {
    title: "Statistics for Data Analysis",
    description:
      "Learn descriptive statistics, probability and interpreting data.",
    level: "Beginner",
    skills: ["Statistics"],
  },
  {
    title: "Data Visualization Basics",
    description:
      "Learn how to choose charts and communicate data clearly.",
    level: "Beginner",
    skills: ["Data Visualization"],
  },
  {
    title: "User Research Fundamentals",
    description:
      "Learn interviews, surveys and identifying user needs.",
    level: "Beginner",
    skills: ["User Research"],
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