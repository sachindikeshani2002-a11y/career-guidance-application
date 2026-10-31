/**
 * CareerPath University Platform - Career Fields Migration Utility
 *
 * Usage:
 *   node backend/scripts/migrateCareerFields.js --dry-run
 *   node backend/scripts/migrateCareerFields.js
 *
 * Flags:
 *   --dry-run       Preview metadata updates without modifying database records
 *   --db-uri=<uri>  Specify custom MongoDB URI (useful for isolated testing)
 *
 * Purpose:
 *   Opt-in migration script to update legacy career documents (e.g. Software Developer,
 *   Data Analyst, UI/UX Designer) with their designated field, typical responsibilities,
 *   educational guidance, and disclaimers.
 *
 * Safety Guarantees:
 *   - NEVER alters or recreates document _id values.
 *   - Preserves existing student targetCareer ObjectId references.
 *   - Never overwrites custom user-assigned skills unless absent.
 */

const mongoose = require("mongoose");
const path = require("path");

require("dotenv").config({
  path: path.join(__dirname, "..", ".env"),
});

const Career = require("../models/Career");
const { CAREER_CATALOG } = require("./careerCatalogData");

function parseArgs() {
  const isDryRun = process.argv.includes("--dry-run");

  const dbUriArg = process.argv.find((arg) =>
    arg.startsWith("--db-uri=")
  );
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

async function runMigration() {
  const { isDryRun, mongoUri } = parseArgs();

  console.log("==================================================");
  console.log(" CareerPath - Career Fields Opt-In Migration");
  console.log("==================================================");
  console.log(`Execution Mode : ${isDryRun ? "DRY-RUN (READ-ONLY)" : "LIVE DATABASE UPDATE"}`);
  console.log(
    `Target DB URI  : ${mongoUri ? mongoUri.replace(/\/\/([^:]+):([^@]+)@/, "//***:***@") : "NONE"}`
  );
  console.log("--------------------------------------------------");

  if (!mongoUri) {
    console.error("Error: MONGO_URI is missing. Please configure .env or pass --db-uri=<uri>");
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log("Connected to MongoDB successfully.\n");

    const catalogByTitle = new Map();
    for (const item of CAREER_CATALOG) {
      catalogByTitle.set(normalizeTitle(item.title), item);
    }

    const existingCareers = await Career.find({});
    console.log(`Found ${existingCareers.length} existing careers in database.\n`);

    let updatedCount = 0;
    let unchangedCount = 0;
    let unmatchedCount = 0;
    const actions = [];

    for (const career of existingCareers) {
      const norm = normalizeTitle(career.title);
      const catalogEntry = catalogByTitle.get(norm);

      if (!catalogEntry) {
        unmatchedCount++;
        actions.push({
          status: "CUSTOM/UNMATCHED",
          id: career._id.toString(),
          title: career.title,
          field: career.field || "Uncategorized",
          action: "No matching catalog entry; preserved as-is",
        });
        continue;
      }

      // Check what fields need updating
      const updates = {};

      if (!career.field || career.field === "General" || career.field === "Uncategorized") {
        if (career.field !== catalogEntry.field) {
          updates.field = catalogEntry.field;
        }
      }

      if (
        !career.responsibilities ||
        career.responsibilities.length === 0
      ) {
        updates.responsibilities = catalogEntry.responsibilities;
      }

      if (!career.educationGuidance) {
        updates.educationGuidance = catalogEntry.educationGuidance;
      }

      if (!career.disclaimer) {
        updates.disclaimer = catalogEntry.disclaimer;
      }

      const updateKeys = Object.keys(updates);

      if (updateKeys.length === 0) {
        unchangedCount++;
        actions.push({
          status: "UP-TO-DATE",
          id: career._id.toString(),
          title: career.title,
          field: career.field,
          action: "Already has required field & metadata",
        });
      } else {
        updatedCount++;
        if (isDryRun) {
          actions.push({
            status: "WOULD MIGRATE",
            id: career._id.toString(),
            title: career.title,
            field: updates.field || career.field,
            action: `Would add: ${updateKeys.join(", ")} (ID preserved)`,
          });
        } else {
          await Career.updateOne(
            { _id: career._id },
            { $set: updates }
          );
          actions.push({
            status: "MIGRATED",
            id: career._id.toString(),
            title: career.title,
            field: updates.field || career.field,
            action: `Updated: ${updateKeys.join(", ")} (ID preserved)`,
          });
        }
      }
    }

    console.log("Migration Results:");
    console.table(
      actions.map((a) => ({
        Status: a.status,
        Title: a.title,
        Field: a.field,
        "Record ID": a.id,
        Action: a.action,
      }))
    );

    console.log("\n--------------------------------------------------");
    console.log("Migration Summary:");
    console.log(`Total Existing Careers : ${existingCareers.length}`);
    console.log(`Already Up-to-date      : ${unchangedCount}`);
    console.log(`Unmatched (Preserved)  : ${unmatchedCount}`);

    if (isDryRun) {
      console.log(`Would Migrate          : ${updatedCount}`);
      console.log("\n[DRY RUN COMPLETE] No writes were performed to the database.");
      console.log("To apply these migrations, re-run without the --dry-run flag.");
    } else {
      console.log(`Successfully Migrated  : ${updatedCount}`);
      console.log("\n[SUCCESS] Migration complete. All existing _id values were preserved.");
    }
    console.log("==================================================");
  } catch (error) {
    console.error("\n[MIGRATION ERROR]:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log("Database connection closed.");
  }
}

if (require.main === module) {
  runMigration();
}

module.exports = { runMigration };
