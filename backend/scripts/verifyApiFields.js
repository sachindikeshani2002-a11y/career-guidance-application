const http = require("http");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const path = require("path");
const assert = require("assert");

require("dotenv").config({
  path: path.join(__dirname, "..", ".env"),
});

const User = require("../models/User");

function fetchApi(pathStr, token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "localhost",
      port: 5001,
      path: pathStr,
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const req = http.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        try {
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on("error", reject);
    req.end();
  });
}

async function verifyAll() {
  await mongoose.connect(process.env.MONGO_URI);
  const user = await User.findOne({});
  await mongoose.disconnect();

  if (!user) throw new Error("No user found");

  const token = jwt.sign(
    { sub: user._id.toString() },
    process.env.JWT_SECRET,
    { algorithm: "HS256" }
  );

  console.log("==================================================");
  console.log(" Career Guidance API Field Filtering Verification");
  console.log("==================================================\n");

  // 1. All Fields
  const allRes = await fetchApi("/api/careers", token);
  assert.strictEqual(allRes.status, 200);
  const allCareers = allRes.data.careers;
  console.log(`Total careers (All Fields): ${allCareers.length} (Expected: 18)`);
  assert.strictEqual(allCareers.length, 18);

  // Verify all fields are present on every career
  for (const c of allCareers) {
    assert(c.field, `Missing field on "${c.title}"`);
    assert(Array.isArray(c.responsibilities) && c.responsibilities.length > 0, `Missing responsibilities on "${c.title}"`);
    assert(c.educationGuidance, `Missing educationGuidance on "${c.title}"`);
  }
  console.log("[PASS] All 18 careers contain field, responsibilities, and educationGuidance.\n");

  // 2. Engineering
  const engRes = await fetchApi("/api/careers?field=Engineering", token);
  assert.strictEqual(engRes.status, 200);
  const engCareers = engRes.data.careers;
  console.log(`Engineering careers: ${engCareers.length} (Expected: 5)`);
  console.log("Titles:", engCareers.map(c => c.title).join(", "));
  assert.strictEqual(engCareers.length, 5);

  // 3. IT & Computing
  const itRes = await fetchApi("/api/careers?field=" + encodeURIComponent("IT & Computing"), token);
  assert.strictEqual(itRes.status, 200);
  const itCareers = itRes.data.careers;
  console.log(`IT & Computing careers: ${itCareers.length} (Expected: 3)`);
  console.log("Titles:", itCareers.map(c => c.title).join(", "));
  assert.strictEqual(itCareers.length, 3);

  // 4. Business & Management
  const bmRes = await fetchApi("/api/careers?field=" + encodeURIComponent("Business & Management"), token);
  assert.strictEqual(bmRes.status, 200);
  const bmCareers = bmRes.data.careers;
  console.log(`Business & Management careers: ${bmCareers.length} (Expected: 3)`);
  console.log("Titles:", bmCareers.map(c => c.title).join(", "));
  assert.strictEqual(bmCareers.length, 3);

  // 5. Finance & Accounting
  const faRes = await fetchApi("/api/careers?field=" + encodeURIComponent("Finance & Accounting"), token);
  assert.strictEqual(faRes.status, 200);
  const faCareers = faRes.data.careers;
  console.log(`Finance & Accounting careers: ${faCareers.length} (Expected: 3)`);
  console.log("Titles:", faCareers.map(c => c.title).join(", "));
  assert.strictEqual(faCareers.length, 3);

  // 6. Marketing & Media
  const mmRes = await fetchApi("/api/careers?field=" + encodeURIComponent("Marketing & Media"), token);
  assert.strictEqual(mmRes.status, 200);
  const mmCareers = mmRes.data.careers;
  console.log(`Marketing & Media careers: ${mmCareers.length} (Expected: 4)`);
  console.log("Titles:", mmCareers.map(c => c.title).join(", "));
  assert.strictEqual(mmCareers.length, 4);

  console.log("\n==================================================");
  console.log(" ALL API FIELD FILTERING CHECKS PASSED 100%!");
  console.log("==================================================");
}

verifyAll().catch((e) => {
  console.error("FAIL:", e);
  process.exit(1);
});

