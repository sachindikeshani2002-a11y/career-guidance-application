/**
 * CareerPath University Platform - Course Catalog Import Utility
 *
 * Usage:
 *   node backend/scripts/importCourses.js            # Defaults to DRY-RUN (Read-Only)
 *   node backend/scripts/importCourses.js --apply    # Executes live insert-missing-only write
 *   node backend/scripts/importCourses.js --dry-run  # Explicit dry-run
 *   node backend/scripts/importCourses.js --db-uri=<uri> [--apply]
 *
 * Safety Guarantees:
 *   - Dry-Run by default: Will NOT write to the database unless --apply is explicitly specified.
 *   - Insert-missing-only: Never overwrites, mutates, or deletes existing course documents.
 *   - Referential Integrity: Preserves all existing course IDs, enrollments, and completion histories.
 *   - Duplicate & Conflict Detection: Pre-validates all records and checks for normalized title collisions.
 *   - Idempotent: Can be run repeatedly safely.
 */

const mongoose = require("mongoose");
const path = require("path");

require("dotenv").config({
  path: path.join(__dirname, "..", ".env"),
});

const Course = require("../models/Course");
const { PROPOSED_COURSES } = require("./courseCatalogData");

const VALID_LEVELS = ["Beginner", "Intermediate", "Advanced"];

function parseArgs() {
  const isApply = process.argv.includes("--apply");
  // Default to dry-run unless --apply is explicitly present and --dry-run is not forced
  const isDryRun = !isApply || process.argv.includes("--dry-run");

  const dbUriArg = process.argv.find((arg) => arg.startsWith("--db-uri="));
  const customDbUri = dbUriArg ? dbUriArg.split("=")[1] : null;

  const mongoUri =
    customDbUri ||
    process.env.MONGO_URI_OVERRIDE ||
    process.env.MONGO_URI;

  return { isDryRun, mongoUri };
}

function normalizeTitle(title) {
  return String(title || "")
    .trim()
    .toLowerCase();
}

function validateCourseRecord(course, index) {
  const errors = [];
  const prefix = `[Course #${index + 1} "${course.title || "Untitled"}"]`;

  if (!course.title || typeof course.title !== "string" || !course.title.trim()) {
    errors.push(`${prefix} Title is required and cannot be empty.`);
  } else if (course.title.trim().length < 2 || course.title.trim().length > 100) {
    errors.push(`${prefix} Title must be between 2 and 100 characters.`);
  }

  if (!course.description || typeof course.description !== "string" || !course.description.trim()) {
    errors.push(`${prefix} Description is required and cannot be empty.`);
  } else if (course.description.trim().length < 10 || course.description.trim().length > 1000) {
    errors.push(`${prefix} Description must be between 10 and 1000 characters.`);
  }

  if (!VALID_LEVELS.includes(course.level)) {
    errors.push(`${prefix} Level must be one of: ${VALID_LEVELS.join(", ")} (got "${course.level}").`);
  }

  if (!Array.isArray(course.skills) || course.skills.length === 0) {
    errors.push(`${prefix} Skills must be a non-empty array of strings.`);
  } else if (course.skills.length > 20) {
    errors.push(`${prefix} Cannot specify more than 20 skills.`);
  } else {
    for (const skill of course.skills) {
      if (typeof skill !== "string" || !skill.trim() || skill.trim().length > 60) {
        errors.push(`${prefix} Skill "${skill}" must be a non-empty string under 60 characters.`);
      }
    }
  }

  return errors;
}

async function runImport() {
  const { isDryRun, mongoUri } = parseArgs();

  console.log("==================================================");
  console.log(" CareerPath - Course Catalog Import Utility");
  console.log("==================================================");
  console.log(
    `Execution Mode : ${
      isDryRun
        ? "DRY-RUN (READ-ONLY PREVIEW - NO WRITES)"
        : "LIVE DATABASE WRITE (--apply SPECIFIED)"
    }`
  );
  console.log(
    `Target DB URI  : ${
      mongoUri ? mongoUri.replace(/\/\/([^:]+):([^@]+)@/, "//***:***@") : "NONE"
    }`
  );
  console.log("--------------------------------------------------");

  if (!mongoUri) {
    console.error("Error: MONGO_URI is missing. Please configure .env or pass --db-uri=<uri>");
    process.exit(1);
  }

  // Step 1: Pre-validate all proposed course definitions in memory
  console.log(`Pre-validating ${PROPOSED_COURSES.length} proposed course definitions...`);
  const validationErrors = [];
  const proposedSeen = new Map();

  for (let i = 0; i < PROPOSED_COURSES.length; i++) {
    const course = PROPOSED_COURSES[i];
    const itemErrors = validateCourseRecord(course, i);
    if (itemErrors.length > 0) {
      validationErrors.push(...itemErrors);
    }

    const norm = normalizeTitle(course.title);
    if (proposedSeen.has(norm)) {
      validationErrors.push(
        `Duplicate title in proposed catalog: "${course.title}" conflicts with index ${proposedSeen.get(norm)}.`
      );
    } else {
      proposedSeen.set(norm, i);
    }
  }

  if (validationErrors.length > 0) {
    console.error("\n[ABORT] Proposed catalog failed schema validation:");
    validationErrors.forEach((err) => console.error(`  - ${err}`));
    process.exit(1);
  }
  console.log("✓ All proposed courses passed schema validation.\n");

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("Connected to MongoDB successfully.\n");

    // Step 2: Fetch all existing courses from MongoDB
    const existingRecords = await Course.find({}).lean();
    const existingByTitle = new Map();
    const existingConflicts = [];

    for (const record of existingRecords) {
      const norm = normalizeTitle(record.title);
      if (existingByTitle.has(norm)) {
        existingConflicts.push(
          `Collision in existing DB: Multiple courses share normalized title "${norm}" (IDs: ${existingByTitle.get(norm)._id}, ${record._id})`
        );
      } else {
        existingByTitle.set(norm, record);
      }
    }

    if (existingConflicts.length > 0) {
      console.warn("[WARNING] Existing database contains duplicate course titles:");
      existingConflicts.forEach((c) => console.warn(`  ! ${c}`));
    }

    console.log(`Existing Database Courses: ${existingRecords.length}`);
    console.log(`Proposed Catalog Courses : ${PROPOSED_COURSES.length}\n`);

    // Step 3: Analyze which proposed courses exist vs. are missing
    const skippedCourses = [];
    const missingCourses = [];

    for (const item of PROPOSED_COURSES) {
      const norm = normalizeTitle(item.title);
      const existing = existingByTitle.get(norm);

      if (existing) {
        skippedCourses.push({
          title: item.title,
          level: item.level,
          existingId: existing._id,
        });
      } else {
        missingCourses.push(item);
      }
    }

    console.log("==================================================");
    console.log(" Import Analysis Summary");
    console.log("==================================================");
    console.log(`Existing Database Count       : ${existingRecords.length}`);
    console.log(`Proposed Catalog Count        : ${PROPOSED_COURSES.length}`);
    console.log(`Skipped (Already in Database) : ${skippedCourses.length}`);
    console.log(`Missing (Ready to Insert)     : ${missingCourses.length}`);
    console.log(`Conflicts Detected            : ${existingConflicts.length}`);
    console.log("--------------------------------------------------");

    if (skippedCourses.length > 0) {
      console.log("\nSkipped Courses (Already Exist):");
      skippedCourses.forEach((c) => {
        console.log(`  [EXISTS] "${c.title}" (${c.level}) -> ID: ${c.existingId}`);
      });
    }

    if (missingCourses.length > 0) {
      console.log(`\nMissing Courses (${isDryRun ? "Would Be Inserted" : "Inserting"}):`);
      missingCourses.forEach((c) => {
        console.log(`  [MISSING] "${c.title}" [${c.level}] - Skills: ${c.skills.join(", ")}`);
      });
    } else {
      console.log("\n✓ All proposed courses are already present in the database. No insertions needed.");
    }

    // Step 4: Execute database operations if --apply is set
    if (!isDryRun) {
      console.log("\nExecuting live database insertion...");
      let insertedCount = 0;

      for (const course of missingCourses) {
        const cleanPayload = {
          title: course.title.trim(),
          description: course.description.trim(),
          level: course.level,
          skills: course.skills.map((s) => s.trim()),
        };

        const res = await Course.updateOne(
          { title: cleanPayload.title },
          { $setOnInsert: cleanPayload },
          { upsert: true, runValidators: true }
        );

        if (res.upsertedCount > 0) {
          insertedCount++;
        }
      }

      const finalCount = await Course.countDocuments();
      console.log("\n==================================================");
      console.log(" Live Apply Finished Successfully");
      console.log("==================================================");
      console.log(`Courses Inserted : ${insertedCount}`);
      console.log(`Total DB Courses : ${finalCount}`);
    } else {
      console.log("\n==================================================");
      console.log(" Dry-Run Complete: No Database Writes Performed");
      console.log("==================================================");
      console.log(`To write missing courses to MongoDB, execute:`);
      console.log(`  node backend/scripts/importCourses.js --apply\n`);
    }
  } catch (error) {
    console.error("\n[ERROR] Course import failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

if (require.main === module) {
  runImport();
}

module.exports = {
  runImport,
  validateCourseRecord,
  normalizeTitle,
};

