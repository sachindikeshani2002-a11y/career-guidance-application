import { useEffect, useState } from "react";
import CourseLessons from "./CourseLessons";
import { getCourseImage, courseDefault } from "../utils/imageMapper";

const API_URL = "http://localhost:5001/api/enrollments";

export default function MyProgress({ token, onLogout }) {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    const controller = new AbortController();

    async function loadProgress() {
      setLoading(true);
      setError("");
      setActionError("");

      try {
        const response = await fetch(API_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });

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

    loadProgress();

    return () => controller.abort();
  }, [token, onLogout, attempt]);

  async function markCompleted(id, courseTitle) {
    if (updatingId !== null) return;

    setUpdatingId(id);
    setActionError("");
    setActionSuccess("");

    try {
      const response = await fetch(
        `${API_URL}/${id}/complete`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 401) {
        onLogout();
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to update your progress"
        );
      }

      if (!data.enrollment) {
        throw new Error("Updated enrollment was not received");
      }

      setEnrollments((previous) =>
        previous.map((item) =>
          item._id === id
            ? {
                ...item,
                status: data.enrollment.status,
                completedAt: data.enrollment.completedAt,
              }
            : item
        )
      );

      setActionSuccess(
        `Congratulations! You have completed "${courseTitle || "the course"}".`
      );
    } catch (err) {
      setActionError(
        err instanceof TypeError
          ? "Cannot connect to the backend. Check port 5001."
          : err.message
      );
    } finally {
      setUpdatingId(null);
    }
  }

  function formatDate(value) {
    if (!value) return "Date unavailable";

    const date = new Date(value);

    return Number.isNaN(date.getTime())
      ? "Date unavailable"
      : date.toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
  }

  const completedCount = enrollments.filter(
    (item) => item.status === "Completed"
  ).length;

  const ongoingCount = enrollments.filter(
    (item) => item.status === "Enrolled"
  ).length;

  const visibleEnrollments = enrollments.filter((item) => {
    if (statusFilter === "Ongoing") {
      return item.status === "Enrolled";
    }

    if (statusFilter === "Completed") {
      return item.status === "Completed";
    }

    return true;
  });

  return (
    <section className="cp-panel">
      <div className="cp-section-header">
        <div>
          <h2>My Progress</h2>
          <p>
            Track your ongoing courses, read structured lessons, and record completed milestones.
          </p>
        </div>
      </div>

      <div className="cp-progress-filters">
        <button
          type="button"
          className={statusFilter === "All" ? "active" : ""}
          aria-pressed={statusFilter === "All"}
          onClick={() => setStatusFilter("All")}
        >
          All Enrolled ({enrollments.length})
        </button>

        <button
          type="button"
          className={statusFilter === "Ongoing" ? "active" : ""}
          aria-pressed={statusFilter === "Ongoing"}
          onClick={() => setStatusFilter("Ongoing")}
        >
          Ongoing ({ongoingCount})
        </button>

        <button
          type="button"
          className={statusFilter === "Completed" ? "active" : ""}
          aria-pressed={statusFilter === "Completed"}
          onClick={() => setStatusFilter("Completed")}
        >
          Completed ({completedCount})
        </button>
      </div>

      {actionSuccess && (
        <div className="cp-banner-success" role="status">
          <span>✓</span>
          <p>{actionSuccess}</p>
          <button
            type="button"
            className="cp-banner-close"
            onClick={() => setActionSuccess("")}
            aria-label="Dismiss message"
          >
            ×
          </button>
        </div>
      )}

      {actionError && (
        <div className="cp-banner-error" role="alert">
          <span>⚠</span>
          <p>{actionError}</p>
          <button
            type="button"
            className="cp-banner-close"
            onClick={() => setActionError("")}
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      {loading && (
        <p className="cp-loading-text" role="status">Loading your progress...</p>
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
          {enrollments.length === 0 && (
            <p className="cp-empty-text">
              You have not enrolled in any courses yet. Open <strong>Skill Development</strong> to find and enroll in courses.
            </p>
          )}

          {enrollments.length > 0 && visibleEnrollments.length === 0 && (
            <p className="cp-empty-text" role="status">
              No courses match the selected "{statusFilter}" status filter.
            </p>
          )}

          <div className="cp-cards">
            {visibleEnrollments.map((item) => {
              const isCompleted = item.status === "Completed";
              const courseTitle = item.course?.title || "Course unavailable";

              return (
                <article
                  className="cp-card cp-progress-card"
                  key={item._id}
                >
                  <div className="cp-thumbnail-container">
                    <img
                      src={getCourseImage(item.course?.title)}
                      alt={`${courseTitle} thumbnail`}
                      className="cp-card-thumbnail"
                      width="400"
                      height="200"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = courseDefault;
                      }}
                    />
                    <span
                      className={`cp-status-badge ${
                        isCompleted ? "cp-status-completed" : "cp-status-ongoing"
                      }`}
                    >
                      {isCompleted ? "✓ Completed" : "● Ongoing"}
                    </span>
                  </div>

                  <div className="cp-card-body">
                    <div className="cp-card-meta-line">
                      {item.course?.level && (
                        <span className="cp-course-level">
                          {item.course.level}
                        </span>
                      )}
                      {isCompleted && item.completedAt && (
                        <span className="cp-completed-date-tag">
                          Completed on {formatDate(item.completedAt)}
                        </span>
                      )}
                    </div>

                    <h3>{courseTitle}</h3>
                    <p className="cp-card-description">{item.course?.description}</p>

                    {item.course && (
                      <CourseLessons courseTitle={item.course.title} />
                    )}

                    {!isCompleted && item.course && (
                      <button
                        type="button"
                        className="cp-btn-primary cp-btn-full"
                        disabled={updatingId !== null}
                        onClick={() => markCompleted(item._id, item.course.title)}
                      >
                        {updatingId === item._id
                          ? "Recording Progress..."
                          : "Mark as Completed ✓"}
                      </button>
                    )}
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
