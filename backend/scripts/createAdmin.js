const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const path = require("path");

require("dotenv").config({
  path: path.join(__dirname, "..", ".env"),
});

const User = require("../models/User");

async function createAdmin() {
  const rawArgs = process.argv.slice(2);
  let isPromoteOnly = false;
  const filteredArgs = [];

  for (const arg of rawArgs) {
    if (arg === "--promote" || arg === "-p") {
      isPromoteOnly = true;
    } else {
      filteredArgs.push(arg);
    }
  }

  let email = filteredArgs[0] || process.env.ADMIN_EMAIL;
  let name = "";
  let password = "";

  if (filteredArgs.length === 1) {
    // Only email provided -> promote existing account without touching password
    isPromoteOnly = true;
  } else if (filteredArgs.length === 2) {
    // node createAdmin.js <email> <password>
    password = filteredArgs[1];
    name = "System Administrator";
  } else if (filteredArgs.length >= 3) {
    // node createAdmin.js <email> <name> <password>
    name = filteredArgs[1];
    password = filteredArgs[2];
  } else {
    password = process.env.ADMIN_PASSWORD;
    name = process.env.ADMIN_NAME || "System Administrator";
  }

  if (!email) {
    console.log("==================================================");
    console.log("  CareerPath - Administrator Setup Utility");
    console.log("==================================================");
    console.log("Usage:");
    console.log("  1. Promote existing user without changing password:");
    console.log("     node scripts/createAdmin.js <email>");
    console.log("     node scripts/createAdmin.js --promote <email>");
    console.log("\n  2. Create a new admin account (or reset password):");
    console.log("     node scripts/createAdmin.js <email> <password>");
    console.log("     node scripts/createAdmin.js <email> <name> <password>");
    console.log("\nExamples:");
    console.log("  node scripts/createAdmin.js user@example.com");
    console.log("  node scripts/createAdmin.js admin@example.com \"SecurePassword123\"");
    process.exit(1);
  }

  const cleanEmail = String(email).trim().toLowerCase();
  const cleanName = String(name || "").trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    console.error("Error: Please provide a valid email address.");
    process.exit(1);
  }

  if (!isPromoteOnly && (!password || password.length < 8)) {
    console.error("Error: Password must be at least 8 characters.");
    process.exit(1);
  }

  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing in .env");
    }

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    await User.init();

    const existingUser = await User.findOne({ email: cleanEmail });

    if (existingUser) {
      existingUser.role = "admin";

      if (password && password.length >= 8) {
        existingUser.password = await bcrypt.hash(password, 12);
      }

      if (cleanName && cleanName !== "System Administrator") {
        existingUser.name = cleanName;
      }

      await existingUser.save();

      if (!password) {
        console.log(`[Success] Existing account (${cleanEmail}) has been promoted to 'admin'.`);
        console.log(`[Security] Existing password was NOT changed.`);
      } else {
        console.log(`[Success] Existing account (${cleanEmail}) promoted to 'admin' and password updated.`);
      }
    } else {
      if (!password || password.length < 8) {
        console.error(
          `[Error] Account '${cleanEmail}' does not exist in the database.\n` +
          `To create a new administrator account, please provide a password (min 8 characters):\n` +
          `  node scripts/createAdmin.js ${cleanEmail} <password>`
        );
        process.exitCode = 1;
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      await User.create({
        name: cleanName || "Administrator",
        email: cleanEmail,
        password: hashedPassword,
        role: "admin",
      });
      console.log(`[Success] New admin account (${cleanEmail}) created successfully.`);
    }
  } catch (error) {
    console.error("[Failure] Admin setup failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}
createAdmin();
