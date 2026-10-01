import { useEffect, useState } from "react";

export default function CareerPaths({ token, onLogout }) {
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadCareers() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          "http://localhost:5001/api/careers",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          }
        );

        const data = await response.json();

        if (controller.signal.aborted) return;

        if (response.status === 401) {
          onLogout();
          return;
        }

        if (!response.ok) {
          throw new Error(data.message || "Unable to load careers");
        }

        setCareers(data.careers);
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

    loadCareers();

    return () => controller.abort();
  }, [token, onLogout, attempt]);

  return (
    <section className="cp-panel">
      <h2>Career Paths</h2>
      <p>Explore careers and the skills you can develop.</p>

      {loading && <p role="status">Loading career paths...</p>}

      {!loading && error && (
        <div>
          <p role="alert">{error}</p>
          <button onClick={() => setAttempt((value) => value + 1)}>
            Try again
          </button>
        </div>
      )}

      {!loading && !error && careers.length === 0 && (
        <p>No career paths have been added yet.</p>
      )}

      {!loading && !error && (
        <div className="cp-cards">
          {careers.map((career) => (
            <article className="cp-card" key={career._id}>
              <h3>{career.title}</h3>
              <p>{career.description}</p>

              <h4>Skills to develop</h4>
              <ul>
                {career.skills.map((skill, index) => (
                  <li key={`${skill}-${index}`}>{skill}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}