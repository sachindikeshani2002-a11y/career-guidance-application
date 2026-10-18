import { useEffect, useState } from "react";

export default function ProgressSummary({ token, onLogout }) {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadSummary() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          "http://localhost:5001/api/enrollments",
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
            data.message || "Unable to load your progress"
          );
        }

        if (!Array.isArray(data.enrollments)) {
          throw new Error("Invalid enrollment data received");
        }

        setEnrollments(data.enrollments);
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

    loadSummary();

    return () => controller.abort();
  }, [token, onLogout, attempt]);

  if (loading) {
    return <p role="status">Loading your learning summary...</p>;
  }

  if (error) {
    return (
      <section className="cp-panel">
        <p role="alert">{error}</p>
        <button
          type="button"
          onClick={() => setAttempt((value) => value + 1)}
        >
          Try again
        </button>
      </section>
    );
  }

  const total = enrollments.length;

  const completed = enrollments.filter(
    (item) => item.status === "Completed"
  ).length;

  const ongoing = total - completed;

  const completionRate =
    total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <section aria-label="Your learning summary">
      <div className="cp-cards">
        <article className="cp-card">
          <h3>Enrolled Courses</h3>
          <p className="cp-stat-number">{total}</p>
        </article>

        <article className="cp-card">
          <h3>Ongoing Courses</h3>
          <p className="cp-stat-number">{ongoing}</p>
        </article>

        <article className="cp-card">
          <h3>Completed Courses</h3>
          <p className="cp-stat-number">{completed}</p>
        </article>
      </div>

      <div className="cp-panel cp-summary-progress">
        <h3>Course Completion</h3>

        {total === 0 ? (
          <p>Enroll in a course to start your learning journey.</p>
        ) : (
          <>
            <p>
              {completed} of {total} enrolled courses completed
              {" "}({completionRate}%).
            </p>

            <progress
              className="cp-skill-progress"
              value={completed}
              max={total}
              aria-label="Completed enrolled courses"
            />
          </>
        )}
      </div>
    </section>
  );
}