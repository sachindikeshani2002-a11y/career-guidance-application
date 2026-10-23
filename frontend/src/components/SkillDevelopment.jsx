import { useEffect, useState } from "react";
import CourseLessons from "./CourseLessons";

export default function SkillDevelopment({
  token,
  onLogout,
  user,
  targetCareer,
  onClearCareer,
}) {
  const [courses, setCourses] = useState([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  const [enrollingId, setEnrollingId] = useState(null);
  const [enrollMessage, setEnrollMessage] = useState("");
  const [enrollError, setEnrollError] = useState("");

  const [recommendedOnly, setRecommendedOnly] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [levelFilter, setLevelFilter] = useState("All");

  useEffect(() => {
    const controller = new AbortController();

    async function loadCourses() {
      setLoading(true);
      setError("");
      setEnrollMessage("");
      setEnrollError("");

      try {
        const options = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        };

        const [courseResponse, enrollmentResponse] =
          await Promise.all([
            fetch("http://localhost:5001/api/courses", options),
            fetch("http://localhost:5001/api/enrollments", options),
          ]);

        if (controller.signal.aborted) return;

        if (
          courseResponse.status === 401 ||
          enrollmentResponse.status === 401
        ) {
          onLogout();
          return;
        }

        const [courseData, enrollmentData] = await Promise.all([
          courseResponse.json(),
          enrollmentResponse.json(),
        ]);

        if (controller.signal.aborted) return;

        if (!courseResponse.ok) {
          throw new Error(
            courseData.message || "Unable to load courses"
          );
        }

        if (!enrollmentResponse.ok) {
          throw new Error(
            enrollmentData.message || "Unable to load enrollments"
          );
        }

        if (
          !Array.isArray(courseData.courses) ||
          !Array.isArray(enrollmentData.enrollments)
        ) {
          throw new Error(
            "Invalid course or enrollment data received"
          );
        }

        setCourses(courseData.courses);

        const enrolledIds = enrollmentData.enrollments
          .map((item) =>
            typeof item.course === "string"
              ? item.course
              : item.course?._id
          )
          .filter(Boolean);

        setEnrolledCourseIds([...new Set(enrolledIds)]);
      } catch (err) {
        if (controller.signal.aborted) return;

        setError(
          err instanceof TypeError
            ? "Cannot connect to the backend. Check port 5001."
            : err.message
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadCourses();

    return () => controller.abort();
  }, [token, onLogout, attempt]);

  async function handleEnroll(courseId) {
    if (
      enrollingId !== null ||
      enrolledCourseIds.includes(courseId)
    ) {
      return;
    }

    setEnrollingId(courseId);
    setEnrollMessage("");
    setEnrollError("");

    try {
      const response = await fetch(
        "http://localhost:5001/api/enrollments",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ courseId }),
        }
      );

      if (response.status === 401) {
        onLogout();
        return;
      }

      const data = await response.json();

      if (response.ok || response.status === 409) {
        setEnrolledCourseIds((previous) =>
          previous.includes(courseId)
            ? previous
            : [...previous, courseId]
        );
      }

      if (response.status === 409) {
        setEnrollMessage(
          "You are already enrolled in this course. View it in My Progress."
        );
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Enrollment failed");
      }

      setEnrollMessage(
        "Enrollment successful. View it in My Progress."
      );
    } catch (err) {
      setEnrollError(
        err instanceof TypeError
          ? "Cannot connect to the backend. Check port 5001."
          : err.message
      );
    } finally {
      setEnrollingId(null);
    }
  }

  function normalizeSkill(value) {
    return value.trim().toLowerCase();
  }

  function uniqueSkills(items) {
    const list = Array.isArray(items) ? items : [];

    return [
      ...new Map(
        list
          .filter(
            (skill) =>
              typeof skill === "string" && skill.trim()
          )
          .map((skill) => [
            normalizeSkill(skill),
            skill.trim(),
          ])
      ).values(),
    ];
  }

  function resetFilters() {
    setSearchText("");
    setLevelFilter("All");
    setRecommendedOnly(false);
  }

  const currentSkills = new Set(
    uniqueSkills(user?.skills).map(normalizeSkill)
  );

  const hasProfileSkills = currentSkills.size > 0;

  const missingCareerSkills = uniqueSkills(
    targetCareer?.skills
  ).filter(
    (skill) => !currentSkills.has(normalizeSkill(skill))
  );

  const missingCareerSkillSet = new Set(
    missingCareerSkills.map(normalizeSkill)
  );

  const rankedCourses = courses
    .map((course) => {
      const courseSkills = uniqueSkills(course.skills);

      const newSkills = courseSkills.filter(
        (skill) => !currentSkills.has(normalizeSkill(skill))
      );

      return {
        ...course,
        courseSkills,
        newSkills,
        newSkillRatio:
          courseSkills.length > 0
            ? newSkills.length / courseSkills.length
            : 0,
      };
    })
    .sort(
      (a, b) =>
        (hasProfileSkills
          ? b.newSkillRatio - a.newSkillRatio
          : 0) ||
        a.title.localeCompare(b.title)
    );

  const careerCourses = targetCareer
    ? rankedCourses.filter((course) =>
        course.newSkills.some((skill) =>
          missingCareerSkillSet.has(normalizeSkill(skill))
        )
      )
    : rankedCourses;

  const skillFilteredCourses =
    recommendedOnly && hasProfileSkills
      ? careerCourses.filter(
          (course) => course.newSkills.length > 0
        )
      : careerCourses;

  const query = searchText.trim().toLowerCase();

  const visibleCourses = skillFilteredCourses.filter((course) => {
    const matchesSearch =
      !query ||
      [
        course.title,
        course.description,
        ...course.courseSkills,
      ].some((value) =>
        String(value || "").toLowerCase().includes(query)
      );

    const matchesLevel =
      levelFilter === "All" || course.level === levelFilter;

    return matchesSearch && matchesLevel;
  });

  return (
    <section className="cp-panel">
      <h2>Skill Development</h2>

      <div className="cp-course-controls">
        <div>
          <label htmlFor="course-search">Search courses</label>

          <input
            id="course-search"
            type="search"
            placeholder="Search title, description or skill..."
            value={searchText}
            onChange={(event) =>
              setSearchText(event.target.value)
            }
          />
        </div>

        <div>
          <label htmlFor="course-level">Level</label>

          <select
            id="course-level"
            value={levelFilter}
            onChange={(event) =>
              setLevelFilter(event.target.value)
            }
          >
            <option value="All">All levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>

        <button type="button" onClick={resetFilters}>
          Reset filters
        </button>
      </div>

      {targetCareer && (
        <div className="cp-panel">
          <h3>Target career: {targetCareer.title}</h3>

          <p>
            Skills to develop:{" "}
            {missingCareerSkills.length > 0
              ? missingCareerSkills.join(", ")
              : "All listed career skills match your profile."}
          </p>

          <button
            type="button"
            onClick={() => {
              resetFilters();
              onClearCareer();
            }}
          >
            Show all courses
          </button>
        </div>
      )}

      <p>
        Explore courses to develop your career skills.
        Courses with a higher share of skills missing from
        your profile appear first.
      </p>

      {!hasProfileSkills ? (
        <p>
          Add your current skills in My Profile to
          personalize recommendations.
        </p>
      ) : (
        <label className="cp-course-filter">
          <input
            type="checkbox"
            checked={recommendedOnly}
            onChange={(event) =>
              setRecommendedOnly(event.target.checked)
            }
          />
          Show only courses with new skills
        </label>
      )}

      {enrollMessage && (
        <p role="status">{enrollMessage}</p>
      )}

      {enrollError && (
        <p role="alert">{enrollError}</p>
      )}

      {loading && (
        <p role="status">Loading courses...</p>
      )}

      {!loading && error && (
        <div>
          <p role="alert">{error}</p>

          <button
            type="button"
            onClick={() => setAttempt((value) => value + 1)}
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          <p role="status">
            Showing {visibleCourses.length} of {courses.length} courses
          </p>

          {courses.length === 0 && (
            <p>No courses have been added yet.</p>
          )}

          {courses.length > 0 && visibleCourses.length === 0 && (
            <p>
              No courses match the current filters.
              Try resetting filters
              {targetCareer
                ? " or clearing your target career."
                : "."}
            </p>
          )}

          <div className="cp-cards">
            {visibleCourses.map((course) => {
              const isEnrolled =
                enrolledCourseIds.includes(course._id);

              return (
                <article
                  className="cp-card"
                  key={course._id}
                >
                  <span className="cp-course-level">
                    {course.level}
                  </span>

                  <h3>{course.title}</h3>
                  <p>{course.description}</p>

                  <h4>Skills you will develop</h4>

                  {course.courseSkills.length > 0 ? (
                    <ul>
                      {course.courseSkills.map((skill) => (
                        <li key={normalizeSkill(skill)}>
                          {skill}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No course skills have been listed yet.</p>
                  )}

                  {hasProfileSkills &&
                    course.courseSkills.length > 0 && (
                      <>
                        <h4>New skills for you</h4>

                        {course.newSkills.length > 0 ? (
                          <ul>
                            {course.newSkills.map((skill) => (
                              <li key={normalizeSkill(skill)}>
                                {skill}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p>
                            All listed course skills are already
                            in your profile.
                          </p>
                        )}
                      </>
                    )}

                  <button
                    type="button"
                    disabled={
                      enrollingId !== null || isEnrolled
                    }
                    onClick={() => handleEnroll(course._id)}
                  >
                    {isEnrolled
                      ? "Enrolled"
                      : enrollingId === course._id
                        ? "Enrolling..."
                        : "Enroll"}
                  </button>

                  <CourseLessons courseTitle={course.title} />
                </article>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}