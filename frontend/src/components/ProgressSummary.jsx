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
    return <p className="cp-loading-text" role="status">Loading real-time learning summary...</p>;
  }

  if (error) {
    return (
      <section className="cp-panel">
        <p role="alert">{error}</p>
        <button
          type="button"
          className="cp-btn-secondary"
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
    <section aria-label="Your real-time learning summary">
      <div className="cp-cards cp-summary-cards">
        <article className="cp-card cp-stat-card">
          <div className="cp-stat-top">
            <span className="cp-stat-icon cp-icon-blue">📚</span>
            <span className="cp-stat-tag">ENROLLED</span>
          </div>
          <p className="cp-stat-number">{total}</p>
          <span className="cp-stat-subtext">Total active curriculum</span>
        </article>

        <article className="cp-card cp-stat-card">
          <div className="cp-stat-top">
            <span className="cp-stat-icon cp-icon-amber">⏳</span>
            <span className="cp-stat-tag">IN PROGRESS</span>
          </div>
          <p className="cp-stat-number">{ongoing}</p>
          <span className="cp-stat-subtext">Ongoing coursework</span>
        </article>

        <article className="cp-card cp-stat-card">
          <div className="cp-stat-top">
            <span className="cp-stat-icon cp-icon-green">🏆</span>
            <span className="cp-stat-tag">COMPLETED</span>
          </div>
          <p className="cp-stat-number">{completed}</p>
          <span className="cp-stat-subtext">Finished courses</span>
        </article>
      </div>

      <div className="cp-panel cp-summary-progress">
        <div className="cp-summary-progress-header">
          <div>
            <h3>Overall Course Completion</h3>
            <p>
              {total === 0
                ? "Enroll in a course from Skill Development to begin tracking completion milestones."
                : `${completed} of ${total} enrolled courses completed`}
            </p>
          </div>
          <span className="cp-completion-percentage">{completionRate}%</span>
        </div>

        {total > 0 && (
          <progress
            className="cp-skill-progress cp-progress-large"
            value={completed}
            max={total}
            aria-label={`Overall course completion: ${completionRate}%`}
          />
        )}
      </div>
    </section>
  );
}
