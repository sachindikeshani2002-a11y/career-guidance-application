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

  useEffect(() => {
    const controller = new AbortController();

    async function loadProgress() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(API_URL, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });

        const data = await response.json();

        if (controller.signal.aborted) return;

        if (response.status === 401) {
          onLogout();
          return;
        }

        if (!response.ok) {
          throw new Error(data.message || "Unable to load progress");
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
    setUpdatingId(id);
    setActionError("");

    try {
      const response = await fetch(`${API_URL}/${id}/complete`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (response.status === 401) {
        onLogout();
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Unable to update progress");
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

  const completedCount = enrollments.filter(
    (item) => item.status === "Completed"
  ).length;

  return (
    <section className="cp-panel">
      <h2>My Progress</h2>

      {loading && <p role="status">Loading your progress...</p>}

      {!loading && error && (
        <div>
          <p role="alert">{error}</p>
          <button onClick={() => setAttempt((value) => value + 1)}>
            Try again
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          <p>
            Enrolled courses: {enrollments.length} | Completed:{" "}
            {completedCount}
          </p>

          {actionError && <p role="alert">{actionError}</p>}

          {enrollments.length === 0 && (
            <p>
              You have not enrolled in any courses yet.
              Open Skill Development to get started.
            </p>
          )}

          <div className="cp-cards">
            {enrollments.map((item) => (
              <article className="cp-card" key={item._id}>
                <h3>{item.course?.title || "Course unavailable"}</h3>
                {item.course && (
  <CourseLessons courseTitle={item.course.title} />
)}
                <p>{item.course?.description}</p>
                <p>
                  <strong>Status:</strong> {item.status}
                </p>

                {item.status === "Completed" ? (
                  <p>
                    Completed on{" "}
                    {new Date(item.completedAt).toLocaleDateString()}
                  </p>
                ) : (
                  item.course && (
                    <button
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