const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
     interests: user.interests || [],
    skills: user.skills || [],
  };
}

// Check that this router is loaded
// GET /api/auth/test
router.get("/test", (req, res) => {
  res.json({
    message: "Career Guidance auth routes are working",
  });
});

// REGISTER: POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body || {};

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName || cleanName.length > 100) {
      return res.status(400).json({
        message: "Name must contain between 1 and 100 characters",
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return res.status(400).json({
        message: "Enter a valid email address",
      });
    }

    if (
      password.length < 8 ||
      Buffer.byteLength(password, "utf8") > 72
    ) {
      return res.status(400).json({
        message:
          "Password must have at least 8 characters and at most 72 bytes",
      });
    }

    const existingUser = await User.findOne({
      email: cleanEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "This email is already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Users cannot register themselves as admins
    const user = await User.create({
      name: cleanName,
      email: cleanEmail,
      password: hashedPassword,
      role: "student",
    });

    return res.status(201).json({
      message: "Registration successful",
      user: publicUser(user),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "This email is already registered",
      });
    }

    console.error("Registration error:", error.message);

    return res.status(500).json({
      message: "Registration failed",
    });
  }
});

// LOGIN: POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    if (Buffer.byteLength(password, "utf8") > 72) {
      return res.status(400).json({
        message: "Password must not exceed 72 bytes",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      { sub: user._id.toString() },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
        algorithm: "HS256",
      }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: publicUser(user),
    });
  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      message: "Login failed",
    });
  }
});
// GET /api/auth/me
router.get("/me", authMiddleware, (req, res) => {
  return res.json({
    user: publicUser(req.user),
  });
});
// PATCH /api/auth/profile
router.patch("/profile", authMiddleware, async (req, res) => {
  const { name, interests, skills } = req.body || {};

  function validList(value) {
    return (
      Array.isArray(value) &&
      value.length <= 20 &&
      value.every(
        (item) =>
          typeof item === "string" &&
          item.trim().length > 0 &&
          item.trim().length <= 60
      )
    );
  }

  if (
    typeof name !== "string" ||
    !name.trim() ||
    name.trim().length > 100 ||
    !validList(interests) ||
    !validList(skills)
  ) {
    return res.status(400).json({
      message:
        "Enter a valid name and up to 20 interests and skills, each at most 60 characters",
    });
  }

  function cleanList(items) {
    const seen = new Set();

    return items
      .map((item) => item.trim())
      .filter((item) => {
        const key = item.toLowerCase();

        if (seen.has(key)) return false;

        seen.add(key);
        return true;
      });
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          name: name.trim(),
          interests: cleanList(interests),
          skills: cleanList(skills),
        },
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(401).json({
        message: "User account not found",
      });
    }

    return res.json({
      message: "Profile updated successfully",
      user: publicUser(user),
    });
  } catch (error) {
    console.error("Profile update error:", error.message);

    return res.status(500).json({
      message: "Unable to update your profile",
    });
  }
});

module.exports = router;

