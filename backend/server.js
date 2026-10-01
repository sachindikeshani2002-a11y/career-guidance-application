const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const careerRoutes = require("./routes/careerRoutes");
const courseRoutes = require("./routes/courseRoutes");
const enrollmentRoutes = require("./routes/enrollmentRoutes");
const Enrollment = require("./models/Enrollment");

// Load .env from the backend folder
require("dotenv").config({
  path: path.join(__dirname, ".env"),
});

const authRoutes = require("./routes/authRoutes");
const User = require("./models/User");

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(express.json({ limit: "20kb" }));

app.get("/", (req, res) => {
  res.json({
    message: "Career Guidance API is running",
    databaseConnected: mongoose.connection.readyState === 1,
  });
});

// Register and Login routes
app.use("/api/auth", authRoutes);
app.use("/api/careers", careerRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/enrollments", enrollmentRoutes);
// Unknown routes
app.use((req, res) => {
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Handle invalid JSON and other middleware errors
app.use((error, req, res, next) => {
  if (error.type === "entity.parse.failed") {
    return res.status(400).json({
      message: "Invalid JSON request body",
    });
  }

  if (error.type === "entity.too.large") {
    return res.status(413).json({
      message: "Request body is too large",
    });
  }

  console.error("Request error:", error.message);

  return res.status(500).json({
    message: "Internal server error",
  });
});

const PORT = Number(process.env.PORT || 5001);

async function startServer() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing in .env");
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing in .env");
    }

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    // Ensure the unique email index is ready
    await User.init();
    await Enrollment.init();

    console.log("MongoDB connected successfully");

    const server = app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Backend folder: ${__dirname}`);
    });

    server.on("error", (error) => {
      console.error("Server failed to listen:", error.message);
      process.exit(1);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
}

startServer();