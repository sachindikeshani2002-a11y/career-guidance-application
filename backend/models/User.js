const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student",
    },
    interests: {
  type: [String],
  default: [],
},
skills: {
  type: [String],
  default: [],
},
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);