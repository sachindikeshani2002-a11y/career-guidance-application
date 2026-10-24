import { useEffect, useState } from "react";
import CourseLessons from "./CourseLessons";

const API_URL = "http://localhost:5001/api/enrollments";

export default function MyProgress({ token, onLogout }) {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
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

  async function markCompleted(id) {
    if (updatingId !== null) return;

    setUpdatingId(id);
    setActionError("");

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
      : date.toLocaleDateString();
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
      <h2>My Progress</h2>

      <div className="cp-progress-filters">
        {["All", "Ongoing", "Completed"].map((filter) => (
          <button
            type="button"
            key={filter}
            className={
              statusFilter === filter ? "active" : ""
            }
            aria-pressed={statusFilter === filter}
            onClick={() => setStatusFilter(filter)}
          >
            {filter}
          </button>
        ))}
      </div>

      {loading && (
        <p role="status">Loading your progress...</p>
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
          <p>
            Enrolled courses: {enrollments.length}
            {" | "}
            Ongoing: {ongoingCount}
            {" | "}
            Completed: {completedCount}
          </p>

          {actionError && (
            <p role="alert">{actionError}</p>
          )}

          {enrollments.length === 0 && (
            <p>
              You have not enrolled in any courses yet.
              Open Skill Development to get started.
            </p>
          )}

          {enrollments.length > 0 &&
            visibleEnrollments.length === 0 && (
              <p role="status">
                No courses match the selected status.
              </p>
            )}

          <div className="cp-cards">
            {visibleEnrollments.map((item) => (
              <article
                className="cp-card"
                key={item._id}
              >
                <h3>
                  {item.course?.title || "Course unavailable"}
                </h3>

                {item.course?.level && (
                  <span className="cp-course-level">
                    {item.course.level}
                  </span>
                )}

                <p>{item.course?.description}</p>

                <p>
                  <strong>Status:</strong>{" "}
                  {item.status === "Enrolled"
                    ? "Ongoing"
                    : item.status}
                </p>

                {item.course && (
                  <CourseLessons
                    courseTitle={item.course.title}
                  />
                )}

                {item.status === "Completed" ? (
                  <p>
                    Completed on{" "}
                    {formatDate(item.completedAt)}
                  </p>
                ) : (
                  item.course &&
                  item.status === "Enrolled" && (
                    <button
                      type="button"
                      disabled={updatingId !== null}
                      onClick={() => markCompleted(item._id)}
                    >
                      {updatingId === item._id
                        ? "Saving..."
                        : "Mark as completed"}
                    </button>
                  )
                )}
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}