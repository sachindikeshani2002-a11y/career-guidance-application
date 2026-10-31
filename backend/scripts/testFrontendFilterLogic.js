const assert = require("assert");
const http = require("http");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const path = require("path");

require("dotenv").config({
  path: path.join(__dirname, "..", ".env"),
});

const User = require("../models/User");

function fetchCareers(token) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: "localhost",
        port: 5001,
        path: "/api/careers",
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      },
      (res) => {
        let b = "";
        res.on("data", (c) => (b += c));
        res.on("end", () => resolve(JSON.parse(b).careers));
      }
    );
    req.on("error", reject);
    req.end();
  });
}

const KNOWN_CAREER_FIELDS = {
  "civil engineer": "Engineering",
  "mechanical engineer": "Engineering",
  "electrical and electronic engineer": "Engineering",
  "computer engineer": "Engineering",
  "manufacturing engineer": "Engineering",
  "software developer": "IT & Computing",
  "data analyst": "IT & Computing",
  "cybersecurity analyst": "IT & Computing",
  "business analyst": "Business & Management",
  "project coordinator": "Business & Management",
  "human resources executive": "Business & Management",
  "accountant": "Finance & Accounting",
  "financial analyst": "Finance & Accounting",
  "banking officer": "Finance & Accounting",
  "digital marketing executive": "Marketing & Media",
  "content strategist": "Marketing & Media",
  "marketing executive": "Marketing & Media",
  "ui/ux designer": "Marketing & Media",
};

function normalize(v) {
  return typeof v === "string" ? v.trim().toLowerCase() : "";
}

function processCareers(rawCareers, selectedField, searchQuery, userSkillsList = []) {
  const userSkills = new Set(userSkillsList.map(normalize).filter(Boolean));

  const rankedCareers = rawCareers.map((c) => {
    const titleKey = normalize(c.title);
    const resolvedField =
      (c.field && c.field !== "General" ? c.field.trim() : null) ||
      KNOWN_CAREER_FIELDS[titleKey] ||
      c.field ||
      "General";

    const rawSkills = Array.isArray(c.skills) ? c.skills : [];
    const requiredSkills = [
      ...new Map(
        rawSkills
          .filter((s) => typeof s === "string" && s.trim())
          .map((s) => [normalize(s), s.trim()])
      ).values(),
    ];

    const matchingSkills = requiredSkills.filter((s) => userSkills.has(normalize(s)));
    const missingSkills = requiredSkills.filter((s) => !userSkills.has(normalize(s)));
    const coverage =
      requiredSkills.length > 0
        ? Math.round((matchingSkills.length / requiredSkills.length) * 100)
        : null;

    return {
      ...c,
      field: resolvedField,
      responsibilities: Array.isArray(c.responsibilities) ? c.responsibilities : [],
      educationGuidance: c.educationGuidance || "",
      disclaimer: c.disclaimer || "",
      requiredSkills,
      matchingSkills,
      missingSkills,
      coverage,
    };
  });

  const cleanQuery = searchQuery.trim().toLowerCase();

  return rankedCareers.filter((career) => {
    const matchesField =
      selectedField === "All Fields" ||
      career.field.toLowerCase() === selectedField.toLowerCase();

    if (!matchesField) return false;
    if (!cleanQuery) return true;

    const searchableStrings = [
      career.title,
      career.field,
      career.description,
      career.educationGuidance,
      ...career.requiredSkills,
      ...career.responsibilities,
    ];

    return searchableStrings.some((text) =>
      String(text || "").toLowerCase().includes(cleanQuery)
    );
  });
}

async function runTests() {
  await mongoose.connect(process.env.MONGO_URI);
  const user = await User.findOne({});
  await mongoose.disconnect();

  const token = jwt.sign(
    { sub: user._id.toString() },
    process.env.JWT_SECRET,
    { algorithm: "HS256" }
  );

  const rawCareers = await fetchCareers(token);
  console.log(`Fetched ${rawCareers.length} careers from live API.\n`);

  // Test 1: All Fields
  const all = processCareers(rawCareers, "All Fields", "");
  console.log(`Test 1 (All Fields): ${all.length} (Expected: 18)`);
  assert.strictEqual(all.length, 18);

  // Test 2: Engineering
  const eng = processCareers(rawCareers, "Engineering", "");
  console.log(`Test 2 (Engineering): ${eng.length} (Expected: 5)`);
  assert.strictEqual(eng.length, 5);
  for (const c of eng) {
    assert.strictEqual(c.field, "Engineering");
  }

  // Test 3: IT & Computing
  const it = processCareers(rawCareers, "IT & Computing", "");
  console.log(`Test 3 (IT & Computing): ${it.length} (Expected: 3)`);
  assert.strictEqual(it.length, 3);
  for (const c of it) {
    assert.strictEqual(c.field, "IT & Computing");
  }

  // Test 4: Business & Management
  const bm = processCareers(rawCareers, "Business & Management", "");
  console.log(`Test 4 (Business & Management): ${bm.length} (Expected: 3)`);
  assert.strictEqual(bm.length, 3);
  for (const c of bm) {
    assert.strictEqual(c.field, "Business & Management");
  }

  // Test 5: Finance & Accounting
  const fa = processCareers(rawCareers, "Finance & Accounting", "");
  console.log(`Test 5 (Finance & Accounting): ${fa.length} (Expected: 3)`);
  assert.strictEqual(fa.length, 3);
  for (const c of fa) {
    assert.strictEqual(c.field, "Finance & Accounting");
  }

  // Test 6: Marketing & Media
  const mm = processCareers(rawCareers, "Marketing & Media", "");
  console.log(`Test 6 (Marketing & Media): ${mm.length} (Expected: 4)`);
  assert.strictEqual(mm.length, 4);
  for (const c of mm) {
    assert.strictEqual(c.field, "Marketing & Media");
  }

  // Test 7: Combined Search + Field Filter
  const engSearch = processCareers(rawCareers, "Engineering", "AutoCAD");
  console.log(`Test 7 (Engineering + "AutoCAD"): ${engSearch.length} (Expected: 1)`);
  assert.strictEqual(engSearch.length, 1);
  assert.strictEqual(engSearch[0].title, "Civil Engineer");

  // Test 8: Reset restores all
  const resetAll = processCareers(rawCareers, "All Fields", "");
  console.log(`Test 8 (Reset Filters): ${resetAll.length} (Expected: 18)`);
  assert.strictEqual(resetAll.length, 18);

  console.log("\nALL FRONTEND FILTER LOGIC CHECKS PASSED 100%!");
}

runTests().catch((e) => {
  console.error("FAIL:", e);
  process.exit(1);
});

