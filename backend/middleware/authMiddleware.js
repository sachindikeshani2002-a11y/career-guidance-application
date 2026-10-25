const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");


async function authMiddleware(req, res, next) {
  const authorization = req.headers.authorization || "";
  const match = /^Bearer ([^\s]+)$/i.exec(authorization);

  if (!match) {
    return res.status(401).json({
      message: "Please log in to continue",
    });
  }

  let payload;

  try {
    payload = jwt.verify(match[1], process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });
  } catch {
    return res.status(401).json({
      message: "Your session is invalid or expired. Please log in again",
    });
  }

  if (
    typeof payload !== "object" ||
    typeof payload.sub !== "string" ||
    !mongoose.isValidObjectId(payload.sub)
  ) {
    return res.status(401).json({
      message: "Invalid authentication token",
    });
  }

  try {
   const user = await User.findById(payload.sub)
  .select("_id name email role interests skills targetCareer")
  .populate("targetCareer", "title description skills");

    if (!user) {
      return res.status(401).json({
        message: "User account not found",
      });
    }

    req.user = user;
    return next();
  } catch (error) {
    console.error("Authentication error:", error.message);

    return res.status(500).json({
      message: "Unable to verify your account",
    });
  }
}


module.exports = authMiddleware;