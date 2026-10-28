const mongoose = require("mongoose");
const path = require("path");
const http = require("http");
const express = require("express");
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

const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/enrollments", enrollmentRoutes);

let server;
let baseUrl;

function apiCall(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const data = body ? JSON.stringify(body) : null;
    if (data) headers["Content-Length"] = Buffer.byteLength(data);

    const req = http.request(url, { method, headers }, (res) => {
      let raw = "";
      res.on("data", (chunk) => (raw += chunk));
      res.on("end", () => {
        let parsed;
        try {
          parsed = JSON.parse(raw);
        } catch {
          parsed = raw;
        }
        resolve({ status: res.statusCode, body: parsed });
      });
    });

    req.on("error", reject);
    if (data) req.write(data);
    req.end();
  });
}

function check(pass, desc) {
  if (!pass) {
    console.error(`  [FAIL] ${desc}`);
    throw new Error(desc);
  }
  console.log(`  [OK] ${desc}`);
}

async function verify() {
  console.log("\n=======================================================");
  console.log("  Verifying Full Admin Flow & Student Permission Checks");
  console.log("=======================================================\n");

  const nonce = Date.now();
  const studentEmail = `student_${nonce}@example.com`;
  const adminEmail = `admin_${nonce}@example.com`;
  const password = "Password1234!";

  let studentUser = null;
  let adminUser = null;
  let studentToken = "";
  let adminToken = "";

  try {
    await mongoose.connect(process.env.MONGO_URI);
    server = http.createServer(app);
    await new Promise((resolve) => {
      server.listen(0, "127.0.0.1", () => {
        baseUrl = `http://127.0.0.1:${server.address().port}`;
        resolve();
      });
    });

    // 1. Register student
    const regStudent = await apiCall("POST", "/api/auth/register", {
      name: "Normal Student",
      email: studentEmail,
      password,
    });
    check(regStudent.status === 201, "Student account registered successfully");
    studentUser = regStudent.body.user;

    const loginStudent = await apiCall("POST", "/api/auth/login", {
      email: studentEmail,
      password,
    });
    check(loginStudent.status === 200, "Student logged in");
    studentToken = loginStudent.body.token;

    // 2. Create admin
    const hashed = await bcrypt.hash(password, 12);
    adminUser = await User.create({
      name: "Admin User",
      email: adminEmail,
      password: hashed,
      role: "admin",
    });
    check(adminUser.role === "admin", "Admin account created with role 'admin'");

    const loginAdmin = await apiCall("POST", "/api/auth/login", {
      email: adminEmail,
      password,
    });
    check(loginAdmin.status === 200, "Admin logged in");
    adminToken = loginAdmin.body.token;

    // -----------------------------------------------------------
    console.log("\n--- Part A: Verify Students CANNOT Perform Admin Actions ---");
    // -----------------------------------------------------------

    const studentCreate = await apiCall(
      "POST",
      "/api/courses",
      {
        title: `Hacker Course ${nonce}`,
        description: "Student trying to add course",
        level: "Beginner",
      },
      studentToken
    );
    check(studentCreate.status === 403, "Student cannot create course (403 Forbidden)");

    // -----------------------------------------------------------
    console.log("\n--- Part B: Verify Complete Admin Add -> View -> Edit -> Delete Flow ---");
    // -----------------------------------------------------------

    // Step 1: Add Course
    const courseTitle = `Cloud Native DevOps ${nonce}`;
    const createRes = await apiCall(
      "POST",
      "/api/courses",
      {
        title: courseTitle,
        description: "Comprehensive introduction to microservices, containers and CI/CD pipelines.",
        level: "Beginner",
        skills: ["Docker", "Linux", "Git"],
      },
      adminToken
    );
    check(createRes.status === 201, "1. ADD: Admin created course successfully (201 Created)");
    const courseId = createRes.body.course._id;

    // Step 2: View Course Details
    const viewRes = await apiCall("GET", `/api/courses/${courseId}`, null, studentToken);
    check(viewRes.status === 200, "2. VIEW: Course details retrieved successfully (200 OK)");
    check(viewRes.body.course.title === courseTitle, "   Retrieved course title matches creation payload");

    // Student trying to edit -> 403
    const studentEdit = await apiCall(
      "PUT",
      `/api/courses/${courseId}`,
      { level: "Advanced" },
      studentToken
    );
    check(studentEdit.status === 403, "   Student cannot edit course (403 Forbidden)");

    // Step 3: Edit Course
    const updatedTitle = `Advanced Cloud Native DevOps ${nonce}`;
    const editRes = await apiCall(
      "PUT",
      `/api/courses/${courseId}`,
      {
        title: updatedTitle,
        description: "Advanced masterclass covering Kubernetes clusters, Helm, and GitOps.",
        level: "Advanced",
        skills: ["Docker", "Kubernetes", "Helm", "GitOps"],
      },
      adminToken
    );
    check(editRes.status === 200, "3. EDIT: Admin updated course successfully (200 OK)");
    check(editRes.body.course.title === updatedTitle, "   Updated title matches expected value");
    check(editRes.body.course.level === "Advanced", "   Updated level is 'Advanced'");
    check(editRes.body.course.skills.includes("GitOps"), "   Updated skills include 'GitOps'");

    // Step 4: Delete Protection (Preserving Student History)
    // Student enrolls
    const enrollRes = await apiCall("POST", "/api/enrollments", { courseId }, studentToken);
    check(enrollRes.status === 201, "   Student enrolled in course");

    // Admin tries to delete course with active enrollment
    const deleteBlocked = await apiCall("DELETE", `/api/courses/${courseId}`, null, adminToken);
    check(deleteBlocked.status === 409, "4a. DELETE PROTECT: Deletion blocked when student is enrolled (409 Conflict)");
    check(
      deleteBlocked.body.message.includes("student enrollment record(s) exist"),
      "   Backend message explains that student learning history must be preserved"
    );

    // Verify course still exists
    const stillExists = await Course.findById(courseId);
    check(stillExists !== null, "   Verified course still exists in database");

    // Step 5: Safe Delete of Unreferenced Course
    const tempCourseTitle = `Temporary Unused Course ${nonce}`;
    const tempCourseRes = await apiCall(
      "POST",
      "/api/courses",
      {
        title: tempCourseTitle,
        description: "Temporary course created solely to test unreferenced delete.",
        level: "Beginner",
      },
      adminToken
    );
    check(tempCourseRes.status === 201, "   Created temporary unreferenced course");
    const tempCourseId = tempCourseRes.body.course._id;

    // Student trying to delete -> 403
    const studentDelete = await apiCall("DELETE", `/api/courses/${tempCourseId}`, null, studentToken);
    check(studentDelete.status === 403, "   Student cannot delete course (403 Forbidden)");

    // Admin deletes unreferenced course
    const adminDelete = await apiCall("DELETE", `/api/courses/${tempCourseId}`, null, adminToken);
    check(adminDelete.status === 200, "4b. DELETE: Admin deleted unreferenced course (200 OK)");

    const verifyDeleted = await Course.findById(tempCourseId);
    check(verifyDeleted === null, "   Verified course is completely removed from database");

    console.log("\n=======================================================");
    console.log("  FULL FLOW VERIFICATION SUCCESSFUL!");
    console.log("=======================================================\n");
  } finally {
    // Cleanup temporary records
    try {
      if (studentUser) {
        await Enrollment.deleteMany({ user: studentUser.id });
        await User.findByIdAndDelete(studentUser.id);
      }
      if (adminUser) {
        await User.findByIdAndDelete(adminUser._id);
      }
      await Course.deleteMany({ title: new RegExp(`.*${nonce}.*`, "i") });
      console.log("Cleaned up verification test records from database.");
    } catch (e) {
      console.error("Cleanup note:", e.message);
    }

    if (server) await new Promise((r) => server.close(r));
    await mongoose.disconnect();
  }
}

verify().catch((err) => {
  console.error("\nVerification failed:", err);
  process.exit(1);
});

