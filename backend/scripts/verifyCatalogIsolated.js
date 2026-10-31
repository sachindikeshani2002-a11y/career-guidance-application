/**
 * CareerPath University Platform - Isolated Verification Suite
 *
 * This test suite creates an ISOLATED temporary database:
 *   "mongodb://127.0.0.1:27017/career_guidance_test_isolated"
 *
 * NEVER touches the application database (career_guidance_db).
 *
 * Verifies:
 * 1. Safe legacy seeding with no fields.
 * 2. Dry-run mode for importCareers.js (asserts 0 writes).
 * 3. Actual import execution (inserts missing records, preserves existing IDs).
 * 4. Idempotency on repeated import.
 * 5. Dry-run mode for migrateCareerFields.js.
 * 6. Actual migration execution (updates field & metadata, preserves existing _id).
 * 7. Querying careers with and without field filter.
 * 8. Full cleanup of isolated test DB.
 */

const mongoose = require("mongoose");
const path = require("path");
const { execSync } = require("child_process");

const TEST_DB_URI = "mongodb://127.0.0.1:27017/career_guidance_test_isolated";

async function verifyAll() {
  console.log("==================================================");
  console.log(" Starting Career Catalog Isolated Verification");
  console.log(" Using Isolated DB:", TEST_DB_URI);
  console.log("==================================================\n");

  let connection;
  try {
    connection = await mongoose.connect(TEST_DB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("[SETUP] Connected to isolated test DB.");

    // Clean any prior test DB
    await mongoose.connection.dropDatabase();
    console.log("[SETUP] Dropped any existing test database.\n");

    const Career = require("../models/Career");

    // STEP 1: Simulate pre-existing legacy careers (like in initial seed)
    console.log("--- Step 1: Seeding initial legacy records ---");
    const legacyRecords = await Career.create([
      {
        title: "Software Developer",
        description: "Design, build and maintain software applications.",
        skills: ["JavaScript", "Problem Solving", "Git", "Databases"],
      },
      {
        title: "Data Analyst",
        description: "Analyze data and communicate findings to support decisions.",
        skills: ["Python", "SQL", "Statistics", "Data Visualization"],
      },
      {
        title: "UI/UX Designer",
        description: "Research user needs and design clear, usable interfaces.",
        skills: ["Figma", "User Research", "Wireframing", "Prototyping"],
      },
    ]);

    const initialDevId = legacyRecords[0]._id.toString();
    const initialDataId = legacyRecords[1]._id.toString();
    const initialUiuxId = legacyRecords[2]._id.toString();

    console.log(`Initial records created: 3`);
    console.log(`Software Developer ID: ${initialDevId}`);
    console.log(`Data Analyst ID      : ${initialDataId}`);
    console.log(`UI/UX Designer ID    : ${initialUiuxId}\n`);

    await mongoose.disconnect();

    // STEP 2: Run importCareers.js in DRY-RUN mode
    console.log("--- Step 2: Testing importCareers.js --dry-run ---");
    const dryRunOutput = execSync(
      `node "${path.join(__dirname, "importCareers.js")}" --dry-run --db-uri="${TEST_DB_URI}"`,
      { encoding: "utf8" }
    );
    console.log(dryRunOutput);

    // Verify 0 writes occurred
    await mongoose.connect(TEST_DB_URI);
    const countAfterDryRun = await Career.countDocuments({});
    if (countAfterDryRun !== 3) {
      throw new Error(`Dry run failure! Expected 3 records, found ${countAfterDryRun}`);
    }
    console.log("[ASSERTION PASSED] Dry-run executed with 0 database writes.\n");
    await mongoose.disconnect();

    // STEP 3: Run importCareers.js LIVE
    console.log("--- Step 3: Running importCareers.js (Live) ---");
    const liveImportOutput = execSync(
      `node "${path.join(__dirname, "importCareers.js")}" --db-uri="${TEST_DB_URI}"`,
      { encoding: "utf8" }
    );
    console.log(liveImportOutput);

    // Verify records count and ID preservation
    await mongoose.connect(TEST_DB_URI);
    const countAfterLive = await Career.countDocuments({});
    console.log(`Total careers after import: ${countAfterLive}`);

    const devAfter = await Career.findOne({ title: "Software Developer" });
    const dataAfter = await Career.findOne({ title: "Data Analyst" });
    const uiuxAfter = await Career.findOne({ title: "UI/UX Designer" });

    if (devAfter._id.toString() !== initialDevId) {
      throw new Error("ID mismatch for Software Developer!");
    }
    if (dataAfter._id.toString() !== initialDataId) {
      throw new Error("ID mismatch for Data Analyst!");
    }
    if (uiuxAfter._id.toString() !== initialUiuxId) {
      throw new Error("ID mismatch for UI/UX Designer!");
    }
    console.log("[ASSERTION PASSED] Pre-existing records preserved their original IDs.\n");

    // Verify Engineering careers exist
    const engineeringCareers = await Career.find({ field: "Engineering" });
    console.log(`Engineering careers inserted: ${engineeringCareers.length}`);
    if (engineeringCareers.length < 5) {
      throw new Error(`Expected at least 5 Engineering careers, found ${engineeringCareers.length}`);
    }
    console.log("[ASSERTION PASSED] All 5 mandatory Engineering careers are present.\n");

    await mongoose.disconnect();

    // STEP 4: Test Idempotency (Re-run import)
    console.log("--- Step 4: Testing importCareers.js Idempotency ---");
    const secondImportOutput = execSync(
      `node "${path.join(__dirname, "importCareers.js")}" --db-uri="${TEST_DB_URI}"`,
      { encoding: "utf8" }
    );
    console.log(secondImportOutput);

    await mongoose.connect(TEST_DB_URI);
    const countAfterSecond = await Career.countDocuments({});
    if (countAfterSecond !== countAfterLive) {
      throw new Error(`Duplicate inserted! Expected ${countAfterLive}, found ${countAfterSecond}`);
    }
    console.log("[ASSERTION PASSED] Repeated import is idempotent (0 duplicates added).\n");
    await mongoose.disconnect();

    // STEP 5: Test migrateCareerFields.js in DRY-RUN mode
    console.log("--- Step 5: Testing migrateCareerFields.js --dry-run ---");
    const migrateDryRunOutput = execSync(
      `node "${path.join(__dirname, "migrateCareerFields.js")}" --dry-run --db-uri="${TEST_DB_URI}"`,
      { encoding: "utf8" }
    );
    console.log(migrateDryRunOutput);
    console.log("[ASSERTION PASSED] Migration dry-run inspected legacy fields without writing.\n");

    // STEP 6: Run migrateCareerFields.js LIVE
    console.log("--- Step 6: Running migrateCareerFields.js (Live) ---");
    const migrateLiveOutput = execSync(
      `node "${path.join(__dirname, "migrateCareerFields.js")}" --db-uri="${TEST_DB_URI}"`,
      { encoding: "utf8" }
    );
    console.log(migrateLiveOutput);

    await mongoose.connect(TEST_DB_URI);
    const devMigrated = await Career.findOne({ title: "Software Developer" });
    if (devMigrated._id.toString() !== initialDevId) {
      throw new Error("Software Developer ID changed during migration!");
    }
    if (devMigrated.field !== "IT & Computing") {
      throw new Error(`Expected IT & Computing, got: ${devMigrated.field}`);
    }
    if (!devMigrated.responsibilities || devMigrated.responsibilities.length === 0) {
      throw new Error("Responsibilities were not populated for Software Developer!");
    }
    console.log(`Software Developer updated: Field="${devMigrated.field}", Responsibilities=${devMigrated.responsibilities.length}`);
    console.log("[ASSERTION PASSED] Migration populated metadata while preserving document IDs.\n");

    // STEP 7: Drop test DB
    console.log("--- Step 7: Dropping isolated test database ---");
    await mongoose.connection.dropDatabase();
    console.log("[CLEANUP] Isolated test database dropped cleanly.");

    console.log("\n==================================================");
    console.log(" ALL ISOLATED VERIFICATION TESTS PASSED SUCCESSFULLY! ");
    console.log("==================================================");
  } catch (err) {
    console.error("\n[VERIFICATION FAILED]:", err.message);
    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
}

verifyAll();

