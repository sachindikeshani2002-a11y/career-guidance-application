const mongoose = require("mongoose");
const path = require("path");

require("dotenv").config({
  path: path.join(__dirname, "..", ".env"),
});

const Career = require("../models/Career");

const careers = [
  {
    title: "Software Developer",
    description:
      "Design, build and maintain software applications.",
    skills: ["JavaScript", "Problem Solving", "Git", "Databases"],
  },
  {
    title: "Data Analyst",
    description:
      "Analyze data and communicate findings to support decisions.",
    skills: ["Python", "SQL", "Statistics", "Data Visualization"],
  },
  {
    title: "UI/UX Designer",
    description:
      "Research user needs and design clear, usable interfaces.",
    skills: ["Figma", "User Research", "Wireframing", "Prototyping"],
  },
];

async function seedCareers() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing in .env");
    }

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    await Career.init();

    for (const career of careers) {
      await Career.updateOne(
        { title: career.title },
        { $setOnInsert: career },
        { upsert: true, runValidators: true }
      );
    }

    console.log("Sample careers added successfully");
  } catch (error) {
    console.error("Career seed failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seedCareers();