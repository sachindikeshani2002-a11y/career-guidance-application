import { useEffect, useState } from "react";

export default function SkillDevelopment({
  token,
  onLogout,
  user,
}) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  const [enrollingId, setEnrollingId] = useState(null);
  const [enrollMessage, setEnrollMessage] = useState("");
  const [enrollError, setEnrollError] = useState("");

  const [recommendedOnly, setRecommendedOnly] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadCourses() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          "http://localhost:5001/api/courses",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          }
        );

        if (controller.signal.aborted) return;

        if (response.status === 401) {
          onLogout();
          return;
        }

        const data = await response.json();

        if (controller.signal.aborted) return;

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load courses"
          );
        }

        if (!Array.isArray(data.courses)) {
          throw new Error("Invalid course data received");
        }

        setCourses(data.courses);
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
    if (enrollingId !== null) return;

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

      if (!response.ok) {
        throw new Error(
          data.message || "Enrollment failed"
        );
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

  const currentSkills = new Set(
    uniqueSkills(user?.skills).map(normalizeSkill)
  );

  const hasProfileSkills = currentSkills.size > 0;

  const rankedCourses = courses
    .map((course) => {
      const courseSkills = uniqueSkills(course.skills);

      const newSkills = courseSkills.filter(
        (skill) =>
          !currentSkills.has(normalizeSkill(skill))
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

  const visibleCourses =
    recommendedOnly && hasProfileSkills
      ? rankedCourses.filter(
          (course) => course.newSkills.length > 0
        )
      : rankedCourses;

  return (
    <section className="cp-panel">
      <h2>Skill Development</h2>

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
            onClick={() =>
              setAttempt((value) => value + 1)
            }
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && courses.length === 0 && (
        <p>No courses have been added yet.</p>
      )}

      {!loading &&
        !error &&
        courses.length > 0 &&
        visibleCourses.length === 0 && (
          <p>
            No courses with new skills match this filter.
          </p>
        )}

      {!loading && !error && (
        <div className="cp-cards">
          {visibleCourses.map((course) => (
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
                disabled={enrollingId !== null}
                onClick={() =>
                  handleEnroll(course._id)
                }
              >
                {enrollingId === course._id
                  ? "Enrolling..."
                  : "Enroll"}
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}