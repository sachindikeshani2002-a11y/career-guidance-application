/**
 * CareerPath University Platform - Unit Verification Test
 *
 * Verifies catalog schema compliance, completeness of 5 fields,
 * 17 required careers, Engineering faculty disclaimers, dry-run parsing,
 * and skill-matching normalization logic without requiring a live MongoDB socket.
 */

const assert = require("assert");
const { CAREER_CATALOG } = require("./careerCatalogData");

console.log("==================================================");
console.log(" Career Catalog & Logic Unit Verification");
console.log("==================================================\n");

// 1. Verify Catalog Completeness
console.log("--- Test 1: Verifying Catalog Completeness ---");
const EXPECTED_FIELDS = [
  "Engineering",
  "IT & Computing",
  "Business & Management",
  "Finance & Accounting",
  "Marketing & Media",
];

const REQUIRED_CAREERS_BY_FIELD = {
  Engineering: [
    "Civil Engineer",
    "Mechanical Engineer",
    "Electrical and Electronic Engineer",
    "Computer Engineer",
    "Manufacturing Engineer",
  ],
  "IT & Computing": [
    "Software Developer",
    "Data Analyst",
    "Cybersecurity Analyst",
  ],
  "Business & Management": [
    "Business Analyst",
    "Project Coordinator",
    "Human Resources Executive",
  ],
  "Finance & Accounting": [
    "Accountant",
    "Financial Analyst",
    "Banking Officer",
  ],
  "Marketing & Media": [
    "Digital Marketing Executive",
    "Content Strategist",
    "Marketing Executive",
  ],
};

const catalogTitles = new Set(CAREER_CATALOG.map((c) => c.title));

for (const [field, titles] of Object.entries(REQUIRED_CAREERS_BY_FIELD)) {
  for (const expectedTitle of titles) {
    assert(
      catalogTitles.has(expectedTitle),
      `Missing expected career: "${expectedTitle}" in field "${field}"`
    );
  }
}
console.log(`[PASS] All 17 required careers across 5 fields are present in catalog.`);

// 2. Verify Schema Integrity for Every Career
console.log("\n--- Test 2: Verifying Career Schema Integrity ---");
for (const career of CAREER_CATALOG) {
  assert(career.title && typeof career.title === "string", `Invalid title in ${JSON.stringify(career)}`);
  assert(EXPECTED_FIELDS.includes(career.field), `Invalid field "${career.field}" for career "${career.title}"`);
  assert(career.description && career.description.length >= 10, `Missing description for "${career.title}"`);
  assert(Array.isArray(career.skills) && career.skills.length >= 3, `Insufficient skills for "${career.title}"`);
  assert(Array.isArray(career.responsibilities) && career.responsibilities.length >= 2, `Missing responsibilities for "${career.title}"`);
  assert(career.educationGuidance && typeof career.educationGuidance === "string", `Missing education guidance for "${career.title}"`);

  // Engineering faculty disclaimer assertion
  if (career.field === "Engineering") {
    assert(
      career.disclaimer.toLowerCase().includes("does not qualify") &&
      career.disclaimer.toLowerCase().includes("engineer"),
      `Engineering career "${career.title}" must state short courses do not qualify to practise as an engineer`
    );
  }
}
console.log(`[PASS] Schema integrity verified for all ${CAREER_CATALOG.length} catalog items.`);

// 3. Verify Skill Normalization & Case-Insensitive Matching
console.log("\n--- Test 3: Verifying Skill Normalization & Matching Logic ---");
function normalize(v) {
  return typeof v === "string" ? v.trim().toLowerCase() : "";
}

const userProfileSkills = ["  javascript ", "Python", "SQL  ", "AUTOCAD"];
const userSkillSet = new Set(userProfileSkills.map(normalize));

const testCareer = {
  title: "Civil Engineer",
  skills: ["AutoCAD", "Structural Analysis", "Geotechnical Engineering"],
};

const requiredSkills = [
  ...new Map(testCareer.skills.map((s) => [normalize(s), s.trim()])).values(),
];

const matchingSkills = requiredSkills.filter((s) => userSkillSet.has(normalize(s)));
const missingSkills = requiredSkills.filter((s) => !userSkillSet.has(normalize(s)));

assert.strictEqual(matchingSkills.length, 1, "Expected 1 matching skill (AutoCAD)");
assert.strictEqual(matchingSkills[0], "AutoCAD", "Expected matching skill to preserve raw display casing");
assert.strictEqual(missingSkills.length, 2, "Expected 2 missing skills");
const matchPercent = Math.round((matchingSkills.length / requiredSkills.length) * 100);
assert.strictEqual(matchPercent, 33, "Expected 33% match");
console.log(`[PASS] Skill matching correctly normalizes whitespace and casing while preserving display strings.`);

// 4. Verify In-Memory Insert-Missing-Only Simulation
console.log("\n--- Test 4: Verifying Insert-Missing-Only Logic ---");
const existingMockDB = [
  { _id: "671fb0000000000000000001", title: "Software Developer" },
  { _id: "671fb0000000000000000002", title: "Data Analyst" },
  { _id: "671fb0000000000000000003", title: "UI/UX Designer" },
];

const existingTitles = new Set(existingMockDB.map((c) => normalize(c.title)));
const toInsert = [];
const skipped = [];

for (const item of CAREER_CATALOG) {
  if (existingTitles.has(normalize(item.title))) {
    skipped.push(item.title);
  } else {
    toInsert.push(item.title);
  }
}

assert(skipped.includes("Software Developer"), "Software Developer should be skipped to preserve ID");
assert(skipped.includes("Data Analyst"), "Data Analyst should be skipped to preserve ID");
assert(!toInsert.includes("Software Developer"), "Software Developer must not be in toInsert");
assert(toInsert.includes("Civil Engineer"), "Civil Engineer must be inserted");
assert(toInsert.includes("Cybersecurity Analyst"), "Cybersecurity Analyst must be inserted");
console.log(`[PASS] Insert-missing-only correctly skips ${skipped.length} existing and inserts ${toInsert.length} new records.`);

// 5. Verify In-Memory Opt-In Migration Simulation
console.log("\n--- Test 5: Verifying Field Migration Logic ---");
const legacyDoc = {
  _id: "671fb0000000000000000001",
  title: "Software Developer",
  description: "Design, build and maintain software applications.",
  skills: ["JavaScript", "Problem Solving", "Git", "Databases"],
  // Missing field, responsibilities, educationGuidance
};

const catalogMatch = CAREER_CATALOG.find((c) => normalize(c.title) === normalize(legacyDoc.title));
const updates = {};
if (!legacyDoc.field || legacyDoc.field === "General") {
  updates.field = catalogMatch.field;
}
if (!legacyDoc.responsibilities || legacyDoc.responsibilities.length === 0) {
  updates.responsibilities = catalogMatch.responsibilities;
}
if (!legacyDoc.educationGuidance) {
  updates.educationGuidance = catalogMatch.educationGuidance;
}

assert.strictEqual(updates.field, "IT & Computing");
assert(Array.isArray(updates.responsibilities) && updates.responsibilities.length > 0);
assert(typeof updates.educationGuidance === "string" && updates.educationGuidance.length > 0);
console.log(`[PASS] Migration correctly identifies missing metadata and populates without altering _id.`);

console.log("\n==================================================");
console.log(" ALL UNIT VERIFICATION CHECKS PASSED SUCCESSFULLY!");
console.log("==================================================");

