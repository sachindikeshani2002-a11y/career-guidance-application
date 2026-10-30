import { useEffect, useState } from "react";
import CourseLessons from "./CourseLessons";
import { getCourseImage, courseDefault } from "../utils/imageMapper";

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
  const [sortBy, setSortBy] = useState("recommended");

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
        "Enrollment successful! Access your lessons in My Progress."
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
    setSortBy("recommended");
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

  const levelRank = {
    Beginner: 1,
    Intermediate: 2,
    Advanced: 3,
  };

  const rankedCourses = courses.map((course) => {
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
  });

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

  const sortedCourses = [...visibleCourses].sort((a, b) => {
    switch (sortBy) {
      case "title-asc":
        return a.title.localeCompare(b.title);
      case "title-desc":
        return b.title.localeCompare(a.title);
      case "level-asc":
        return (
          (levelRank[a.level] || 0) - (levelRank[b.level] || 0) ||
          a.title.localeCompare(b.title)
        );
      case "level-desc":
        return (
          (levelRank[b.level] || 0) - (levelRank[a.level] || 0) ||
          a.title.localeCompare(b.title)
        );
      case "recommended":
      default:
        return (
          (hasProfileSkills ? b.newSkillRatio - a.newSkillRatio : 0) ||
          a.title.localeCompare(b.title)
        );
    }
  });

  return (
    <section className="cp-panel">
      <div className="cp-section-header">
        <div>
          <h2>Skill Development</h2>
          <p>
            Explore university courses designed to bridge skill gaps and advance your targeted career.
          </p>
        </div>
      </div>

      <div className="cp-course-controls">
        <div>
          <label htmlFor="course-search">Search courses</label>
          <input
            id="course-search"
            type="search"
            placeholder="Search by title, description or skill..."
            value={searchText}
            onChange={(event) =>
              setSearchText(event.target.value)
            }
          />
        </div>

        <div>
          <label htmlFor="course-level">Filter Level</label>
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

        <div>
          <label htmlFor="course-sort">Sort By</label>
          <select
            id="course-sort"
            value={sortBy}
            onChange={(event) =>
              setSortBy(event.target.value)
            }
          >
            <option value="recommended">Recommended for you</option>
            <option value="title-asc">Title: A to Z</option>
            <option value="title-desc">Title: Z to A</option>
            <option value="level-asc">Level: Beginner to Advanced</option>
            <option value="level-desc">Level: Advanced to Beginner</option>
          </select>
        </div>

        <button type="button" className="cp-btn-secondary" onClick={resetFilters}>
          Reset filters
        </button>
      </div>

      {targetCareer && (
        <div className="cp-target-box">
          <div className="cp-target-header">
            <div>
              <span className="cp-tag-target">ACTIVE CAREER TARGET</span>
              <h3>{targetCareer.title}</h3>
            </div>
            <button
              type="button"
              className="cp-btn-secondary cp-btn-sm"
              onClick={() => {
                resetFilters();
                onClearCareer();
              }}
            >
              Clear Target Filter
            </button>
          </div>
          <p className="cp-target-skills-text">
            <strong>Target skills to develop:</strong>{" "}
            {missingCareerSkills.length > 0
              ? missingCareerSkills.join(", ")
              : "All required skills match your current profile."}
          </p>
        </div>
      )}

      {hasProfileSkills && (
        <div className="cp-filter-toggle-row">
          <label htmlFor="skills-recommended-only" className="cp-course-filter">
            <input
              id="skills-recommended-only"
              type="checkbox"
              checked={recommendedOnly}
              onChange={(event) =>
                setRecommendedOnly(event.target.checked)
              }
            />
            <span>Show only courses offering new skills for your profile</span>
          </label>
        </div>
      )}

      {enrollMessage && (
        <div className="cp-banner-success" role="status">
          <span>✓</span>
          <p>{enrollMessage}</p>
          <button
            type="button"
            className="cp-banner-close"
            onClick={() => setEnrollMessage("")}
            aria-label="Dismiss message"
          >
            ×
          </button>
        </div>
      )}

      {enrollError && (
        <div className="cp-banner-error" role="alert">
          <span>⚠</span>
          <p>{enrollError}</p>
          <button
            type="button"
            className="cp-banner-close"
            onClick={() => setEnrollError("")}
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      {loading && (
        <p className="cp-loading-text" role="status">Loading courses...</p>
      )}

      {!loading && error && (
        <div className="cp-status-block">
          <p role="alert">{error}</p>
          <button
            type="button"
            className="cp-btn-secondary"
            onClick={() => setAttempt((value) => value + 1)}
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          <p className="cp-count-summary" role="status">
            Showing {sortedCourses.length} of {courses.length} courses
          </p>

          {courses.length === 0 && (
            <p className="cp-empty-text">No courses have been added yet.</p>
          )}

          {courses.length > 0 && sortedCourses.length === 0 && (
            <p className="cp-empty-text">
              No courses match the current filters.
              Try resetting filters
              {targetCareer ? " or clearing your target career." : "."}
            </p>
          )}

          <div className="cp-cards">
            {sortedCourses.map((course) => {
              const isEnrolled =
                enrolledCourseIds.includes(course._id);

              return (
                <article
                  className="cp-card cp-course-card"
                  key={course._id}
                >
                  <div className="cp-thumbnail-container">
                    <img
                      src={getCourseImage(course.title)}
                      alt={`${course.title} thumbnail`}
                      className="cp-card-thumbnail"
                      width="400"
                      height="200"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = courseDefault;
                      }}
                    />
                    <span className={`cp-level-badge cp-level-${String(course.level).toLowerCase()}`}>
                      {course.level}
                    </span>
                  </div>

                  <div className="cp-card-body">
                    <h3>{course.title}</h3>
                    <p className="cp-card-description">{course.description}</p>

                    <h4>Skills You Will Develop</h4>
                    {course.courseSkills.length > 0 ? (
                      <ul className="cp-skill-pills">
                        {course.courseSkills.map((skill) => (
                          <li key={normalizeSkill(skill)} className="cp-pill-general">
                            {skill}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="cp-subtle-text">No course skills specified.</p>
                    )}

                    {hasProfileSkills && course.courseSkills.length > 0 && (
                      <div className="cp-new-skills-box">
                        <span className="cp-new-skills-title">New for your profile:</span>
                        {course.newSkills.length > 0 ? (
                          <span className="cp-new-skills-list">
                            {course.newSkills.join(", ")}
                          </span>
                        ) : (
                          <span className="cp-new-skills-none">
                            All listed skills match your profile
                          </span>
                        )}
                      </div>
                    )}

                    <button
                      type="button"
                      className={isEnrolled ? "cp-btn-enrolled" : "cp-btn-primary cp-btn-full"}
                      disabled={
                        enrollingId !== null || isEnrolled
                      }
                      onClick={() => handleEnroll(course._id)}
                    >
                      {isEnrolled
                        ? "✓ Enrolled (In Progress)"
                        : enrollingId === course._id
                          ? "Enrolling..."
                          : "Enroll in Course"}
                    </button>

                    <CourseLessons courseTitle={course.title} />
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
