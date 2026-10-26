const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },
    skills: {
      type: [String],
      default: [],
    },
    isDeleting: {
      type: Boolean,
      default: false,
      select: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", courseSchema);
