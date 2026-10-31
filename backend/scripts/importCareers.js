/**
 * CareerPath University Platform - Career Catalog Import Utility
 *
 * Usage:
 *   node backend/scripts/importCareers.js --dry-run
 *   node backend/scripts/importCareers.js
 *
 * Flags:
 *   --dry-run       Preview missing careers to be inserted without writing to the database
 *   --db-uri=<uri>  Specify custom MongoDB URI (useful for isolated testing)
 *
 * Safety Guarantees:
 *   - Insert-missing-only: Never overwrites or deletes existing career documents
 *   - Preserves all existing career IDs and student targetCareer references
 *   - Idempotent: Can be run multiple times safely
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

async function runImport() {
  const { isDryRun, mongoUri } = parseArgs();

  console.log("==================================================");
  console.log(" CareerPath - Career Catalog Import Utility");
  console.log("==================================================");
  console.log(`Execution Mode : ${isDryRun ? "DRY-RUN (READ-ONLY)" : "LIVE DATABASE WRITE"}`);
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

    // Fetch all existing careers from the database
    const existingRecords = await Career.find({}).lean();
    const existingByTitle = new Map();

    for (const record of existingRecords) {
      existingByTitle.set(normalizeTitle(record.title), record);
    }

    console.log(
      `Catalog defines ${CAREER_CATALOG.length} career pathways across 5 fields.`
    );
    console.log(`Database currently contains ${existingRecords.length} career records.\n`);

    let existingCount = 0;
    let insertedCount = 0;
    let wouldInsertCount = 0;
    const actions = [];

    for (const item of CAREER_CATALOG) {
      const norm = normalizeTitle(item.title);
      const existing = existingByTitle.get(norm);

      if (existing) {
        existingCount++;
        actions.push({
          status: "EXISTS - SKIPPED",
          title: item.title,
          field: existing.field || item.field,
          id: existing._id.toString(),
          action: "Existing document preserved with original ID",
        });
      } else {
        if (isDryRun) {
          wouldInsertCount++;
          actions.push({
            status: "WOULD INSERT",
            title: item.title,
            field: item.field,
            id: "[PENDING]",
            action: "New career will be inserted upon live execution",
          });
        } else {
          const created = await Career.create(item);
          insertedCount++;
          existingByTitle.set(norm, created);
          actions.push({
            status: "INSERTED",
            title: item.title,
            field: item.field,
            id: created._id.toString(),
            action: "Inserted with unique ID",
          });
        }
      }
    }

    // Display summary table
    console.log("Processing Results:");
    console.table(
      actions.map((a) => ({
        Status: a.status,
        Title: a.title,
        Field: a.field,
        "Record ID": a.id,
      }))
    );

    console.log("\n--------------------------------------------------");
    console.log("Import Summary:");
    console.log(`Total Catalog Items : ${CAREER_CATALOG.length}`);
    console.log(`Existing (Preserved): ${existingCount}`);

    if (isDryRun) {
      console.log(`Would Insert        : ${wouldInsertCount}`);
      console.log("\n[DRY RUN COMPLETE] No writes were performed to the database.");
      console.log("To apply these changes, re-run without the --dry-run flag.");
    } else {
      console.log(`Newly Inserted      : ${insertedCount}`);
      console.log("\n[SUCCESS] Live import complete. Existing career references remain intact.");
    }
    console.log("==================================================");
  } catch (error) {
    console.error("\n[IMPORT ERROR]:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log("Database connection closed.");
  }
}

if (require.main === module) {
  runImport();
}

module.exports = { runImport };
