/**
 * Isolated Unit Test for importCourses.js
 * Verifies validation, normalization, and simulated repeat-run idempotency
 * without touching the live MongoDB database.
 */

const assert = require("assert");
const { validateCourseRecord, normalizeTitle } = require("./importCourses");
const { PROPOSED_COURSES } = require("./courseCatalogData");

console.log("=== Running Isolated Unit Tests for importCourses.js ===");

// Test 1: Normalization
console.log("Test 1: Title normalization...");
assert.strictEqual(normalizeTitle("  JavaScript Fundamentals  "), "javascript fundamentals");
assert.strictEqual(normalizeTitle("Cloud Computing"), "cloud computing");
console.log("  ✓ Title normalization passed.");

// Test 2: Validation of all 17 proposed courses
console.log("Test 2: Schema validation of all proposed catalog courses...");
PROPOSED_COURSES.forEach((course, idx) => {
  const errors = validateCourseRecord(course, idx);
  assert.strictEqual(errors.length, 0, `Validation failed for ${course.title}: ${errors.join(", ")}`);
});
console.log(`  ✓ All ${PROPOSED_COURSES.length} proposed courses passed validation.`);

// Test 3: Validation catches invalid course records
console.log("Test 3: Schema validation error detection...");
const badCourse = {
  title: "X", // too short (<2 chars)
  description: "Short", // too short (<10 chars)
  level: "Expert", // invalid level
  skills: [], // empty skills
};
const badErrors = validateCourseRecord(badCourse, 0);
assert(badErrors.length >= 4, `Expected at least 4 errors, got: ${badErrors.length}`);
console.log("  ✓ Validation correctly rejects invalid records.");

// Test 4: Simulated repeat-run idempotency
console.log("Test 4: Simulated repeat-run idempotency...");
const simulatedDb = new Map();
// Existing baseline
const baseline = ["JavaScript Fundamentals", "Python for Data Analysis", "Introduction to Cloud Computing"];
baseline.forEach(t => simulatedDb.set(normalizeTitle(t), { title: t }));

// Run 1 simulation
let wouldInsert1 = 0;
let wouldSkip1 = 0;
PROPOSED_COURSES.forEach(c => {
  const norm = normalizeTitle(c.title);
  if (simulatedDb.has(norm)) {
    wouldSkip1++;
  } else {
    wouldInsert1++;
    simulatedDb.set(norm, c); // simulate insert
  }
});
assert.strictEqual(wouldInsert1, 17, "Run 1 should insert all 17 courses");
assert.strictEqual(wouldSkip1, 0, "Run 1 should skip 0 courses");

// Run 2 simulation (repeat run)
let wouldInsert2 = 0;
let wouldSkip2 = 0;
PROPOSED_COURSES.forEach(c => {
  const norm = normalizeTitle(c.title);
  if (simulatedDb.has(norm)) {
    wouldSkip2++;
  } else {
    wouldInsert2++;
  }
});
assert.strictEqual(wouldInsert2, 0, "Run 2 must insert 0 courses (idempotent)");
assert.strictEqual(wouldSkip2, 17, "Run 2 must skip all 17 courses as already existing");
console.log("  ✓ Simulated repeat-run is completely idempotent (0 inserts on second run).");

console.log("\n✓ ALL UNIT TESTS PASSED SUCCESSFULLY.\n");

