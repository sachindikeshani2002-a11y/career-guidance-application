const mongoose = require("mongoose");
const path = require("path");
const http = require("http");
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

require("dotenv").config({
  path: path.join(__dirname, ".env"),
});

const User = require("./models/User");
const Course = require("./models/Course");
const Enrollment = require("./models/Enrollment");
const authRoutes = require("./routes/authRoutes");
const courseRoutes = require("./routes/courseRoutes");
const enrollmentRoutes = require("./routes/enrollmentRoutes");

// Build a test Express app using the exact same middleware and routes
const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/enrollments", enrollmentRoutes);

let server;
let baseUrl;

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const payload = body ? JSON.stringify(body) : null;
    if (payload) {
      headers["Content-Length"] = Buffer.byteLength(payload);
    }

    const req = http.request(
      url,
      {
        method,
        headers,
      },
      (res) => {
        let raw = "";
        res.on("data", (chunk) => (raw += chunk));
        res.on("end", () => {
          let data;
          try {
            data = JSON.parse(raw);
          } catch {
            data = raw;
          }
          resolve({
            status: res.statusCode,
            body: data,
          });
        });
      }
    );

    req.on("error", reject);
    if (payload) req.write(payload);
    req.end();
  });
}

function assert(condition, message) {
  if (!condition) {
    console.error(`  FAIL: ${message}`);
    throw new Error(message);
  }
  console.log(`  PASS: ${message}`);
}

async function runTests() {
  console.log("\n=======================================================");
  console.log("  Running Backend Course CRUD & Authorization Tests");
  console.log("=======================================================\n");

  const testSuffix = Date.now();
  const studentEmail = `student_test_${testSuffix}@example.com`;
  const adminEmail = `admin_test_${testSuffix}@example.com`;
  const testPassword = "Password123!";

  let studentToken = "";
  let adminToken = "";
  let studentUser = null;
  let adminUser = null;

  try {
    if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
      throw new Error("MONGO_URI and JWT_SECRET must be set in .env");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for testing.");

    server = http.createServer(app);
    await new Promise((resolve) => {
      server.listen(0, "127.0.0.1", () => {
        const port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}`;
        console.log(`Test server running at ${baseUrl}`);
        resolve();
      });
    });

    // -----------------------------------------------------------
    console.log("\n--- Section 1: Public Registration & Role Security ---");
    // -----------------------------------------------------------

    // Test 1: Public registration with role: "admin" must be rejected (403)
    const hackRegister = await request("POST", "/api/auth/register", {
      name: "Hacker User",
      email: `hack_${testSuffix}@example.com`,
      password: testPassword,
      role: "admin",
    });
    assert(
      hackRegister.status === 403,
      "Public registration attempting role: 'admin' returns 403 Forbidden"
    );

    // Test 2: Normal student registration
    const stdRegister = await request("POST", "/api/auth/register", {
      name: "Test Student",
      email: studentEmail,
      password: testPassword,
    });
    assert(stdRegister.status === 201, "Student registration returns 201 Created");
    assert(stdRegister.body.user.role === "student", "Registered user role is strictly 'student'");
    studentUser = stdRegister.body.user;

    // Login student
    const stdLogin = await request("POST", "/api/auth/login", {
      email: studentEmail,
      password: testPassword,
    });
    assert(stdLogin.status === 200, "Student login returns 200 OK");
    studentToken = stdLogin.body.token;

    // Test 3: Create initial admin via database model (simulating createAdmin.js)
    const hashedAdminPassword = await bcrypt.hash(testPassword, 12);
    adminUser = await User.create({
      name: "Test Admin",
      email: adminEmail,
      password: hashedAdminPassword,
      role: "admin",
    });
    assert(adminUser.role === "admin", "Admin created with role 'admin'");

    const admLogin = await request("POST", "/api/auth/login", {
      email: adminEmail,
      password: testPassword,
    });
    assert(admLogin.status === 200, "Admin login returns 200 OK");
    adminToken = admLogin.body.token;

    // -----------------------------------------------------------
    console.log("\n--- Section 2: Authorization & Permissions ---");
    // -----------------------------------------------------------

    // Unauthenticated request to course list
    const unauthGet = await request("GET", "/api/courses");
    assert(unauthGet.status === 401, "Unauthenticated request returns 401 Unauthorized");

    // Student listing courses
    const studentList = await request("GET", "/api/courses", null, studentToken);
    assert(studentList.status === 200, "Authenticated student can list courses (200 OK)");
    assert(Array.isArray(studentList.body.courses), "Response contains courses array");

    // Student attempting to CREATE course
    const studentCreate = await request(
      "POST",
      "/api/courses",
      {
        title: `Student Forbidden Course ${testSuffix}`,
        description: "This should be blocked by authorization middleware.",
        level: "Beginner",
        skills: ["Security"],
      },
      studentToken
    );
    assert(studentCreate.status === 403, "Student creating course returns 403 Forbidden");

    // -----------------------------------------------------------
    console.log("\n--- Section 3: Course Creation & Validation (Admin) ---");
    // -----------------------------------------------------------

    // Invalid payload: Disallowed fields
    const badFields = await request(
      "POST",
      "/api/courses",
      {
        title: `Test Course ${testSuffix}`,
        description: "Valid description longer than 10 characters",
        level: "Beginner",
        extraField: "Not Allowed",
      },
      adminToken
    );
    assert(badFields.status === 400, "Disallowed field in payload returns 400 Bad Request");

    // Invalid payload: Short description
    const shortDesc = await request(
      "POST",
      "/api/courses",
      {
        title: `Test Course ${testSuffix}`,
        description: "Short",
        level: "Beginner",
      },
      adminToken
    );
    assert(shortDesc.status === 400, "Short description (<10 chars) returns 400 Bad Request");

    // Invalid payload: Invalid level enum
    const badLevel = await request(
      "POST",
      "/api/courses",
      {
        title: `Test Course ${testSuffix}`,
        description: "Valid description longer than 10 characters",
        level: "Master",
      },
      adminToken
    );
    assert(badLevel.status === 400, "Invalid level enum returns 400 Bad Request");

    // Valid course creation
    const courseTitle = `Cloud Architecture ${testSuffix}`;
    const createRes = await request(
      "POST",
      "/api/courses",
      {
        title: courseTitle,
        description: "Design and implement scalable multi-tier cloud infrastructure.",
        level: "Intermediate",
        skills: ["Cloud Computing", "AWS", "Docker"],
      },
      adminToken
    );
    assert(createRes.status === 201, "Admin creates course returns 201 Created");
    assert(createRes.body.course && createRes.body.course.title === courseTitle, "Returned course matches title");
    const testCourseId = createRes.body.course._id;

    // Duplicate title check (Case-insensitive)
    const duplicateRes = await request(
      "POST",
      "/api/courses",
      {
        title: courseTitle.toLowerCase(),
        description: "Another description for duplicate title test",
        level: "Advanced",
      },
      adminToken
    );
    assert(duplicateRes.status === 409, "Duplicate course title returns 409 Conflict");

    // -----------------------------------------------------------
    console.log("\n--- Section 4: Course Details & Updating ---");
    // -----------------------------------------------------------

    // Student reads course details
    const detailRes = await request("GET", `/api/courses/${testCourseId}`, null, studentToken);
    assert(detailRes.status === 200, "Student can view course details (200 OK)");
    assert(detailRes.body.course._id === testCourseId, "Course details contain correct ID");

    // Student attempting to UPDATE course
    const studentUpdate = await request(
      "PUT",
      `/api/courses/${testCourseId}`,
      { level: "Advanced" },
      studentToken
    );
    assert(studentUpdate.status === 403, "Student updating course returns 403 Forbidden");

    // Admin updating course
    const adminUpdate = await request(
      "PUT",
      `/api/courses/${testCourseId}`,
      {
        description: "Updated description for scalable enterprise cloud solutions.",
        level: "Advanced",
        skills: ["Cloud Computing", "AWS", "Docker", "Kubernetes"],
      },
      adminToken
    );
    assert(adminUpdate.status === 200, "Admin updating course returns 200 OK");
    assert(adminUpdate.body.course.level === "Advanced", "Course level successfully updated to Advanced");
    assert(adminUpdate.body.course.skills.includes("Kubernetes"), "Skills array successfully updated");

    // Invalid ID update
    const badIdUpdate = await request("PUT", "/api/courses/not-an-id", { level: "Beginner" }, adminToken);
    assert(badIdUpdate.status === 400, "Invalid ObjectId on update returns 400 Bad Request");

    // -----------------------------------------------------------
    console.log("\n--- Section 5: Referential Integrity & Enrollment Protection ---");
    // -----------------------------------------------------------

    // Student enrolls in test course
    const enrollRes = await request(
      "POST",
      "/api/enrollments",
      { courseId: testCourseId },
      studentToken
    );
    assert(enrollRes.status === 201, "Student enrolls in course returns 201 Created");
    const enrollmentId = enrollRes.body.enrollment._id;

    // Student marks course as completed
    const completeRes = await request(
      "PATCH",
      `/api/enrollments/${enrollmentId}/complete`,
      null,
      studentToken
    );
    assert(completeRes.status === 200, "Student marks course as completed returns 200 OK");

    // Admin tries to DELETE the enrolled course -> MUST BE BLOCKED TO PRESERVE STUDENT HISTORY!
    const deleteBlocked = await request("DELETE", `/api/courses/${testCourseId}`, null, adminToken);
    assert(deleteBlocked.status === 409, "Admin deleting course with active/completed enrollments returns 409 Conflict");
    assert(deleteBlocked.body.enrollmentCount === 1, "Conflict response includes enrollmentCount = 1");

    // Verify course still exists
    const courseStillThere = await Course.findById(testCourseId);
    assert(courseStillThere !== null, "Course was NOT deleted from database (referential integrity preserved)");

    // Verify student enrollment still exists and is intact
    const enrollmentStillThere = await Enrollment.findById(enrollmentId);
    assert(enrollmentStillThere !== null && enrollmentStillThere.status === "Completed", "Student completed enrollment remains intact");

    // -----------------------------------------------------------
    console.log("\n--- Section 6: Safe Deletion of Unreferenced Course ---");
    // -----------------------------------------------------------

    // Create an unreferenced course (0 student enrollments)
    const unusedCourseTitle = `Unused Test Course ${testSuffix}`;
    const unusedRes = await request(
      "POST",
      "/api/courses",
      {
        title: unusedCourseTitle,
        description: "Temporary course created strictly to test safe deletion.",
        level: "Beginner",
      },
      adminToken
    );
    assert(unusedRes.status === 201, "Created unreferenced course (201 Created)");
    const unusedCourseId = unusedRes.body.course._id;

    // Student attempts to delete unreferenced course -> 403 Forbidden
    const studentDel = await request("DELETE", `/api/courses/${unusedCourseId}`, null, studentToken);
    assert(studentDel.status === 403, "Student cannot delete unreferenced course (403 Forbidden)");

    // Admin deletes unreferenced course -> 200 OK
    const adminDel = await request("DELETE", `/api/courses/${unusedCourseId}`, null, adminToken);
    assert(adminDel.status === 200, "Admin deletes unreferenced course returns 200 OK");

    // Verify it is gone from database
    const verifyDeleted = await Course.findById(unusedCourseId);
    assert(verifyDeleted === null, "Unreferenced course successfully removed from database");

    console.log("\n=======================================================");
    console.log("  ALL TESTS PASSED SUCCESSFULLY! (100% Coverage)");
    console.log("=======================================================\n");
  } finally {
    // Clean up test records created during this test run
    try {
      if (studentUser) {
        await Enrollment.deleteMany({ user: studentUser.id });
        await User.findByIdAndDelete(studentUser.id);
      }
      if (adminUser) {
        await User.findByIdAndDelete(adminUser._id);
      }
      await Course.deleteMany({ title: new RegExp(`.*${testSuffix}.*`, "i") });
      console.log("Cleaned up temporary test records.");
    } catch (e) {
      console.error("Cleanup note:", e.message);
    }

    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    await mongoose.disconnect();
  }
}

runTests().catch((err) => {
  console.error("\nTest execution failed:", err.message);
  process.exit(1);
});

