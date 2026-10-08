import { useEffect, useState } from "react";

export default function CareerPaths({ token, onLogout, user }) {
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

  function normalize(value) {
    return value.trim().toLowerCase();
  }

  const userSkills = new Set(
    (user?.skills || []).map(normalize).filter(Boolean)
  );

  const rankedCareers = careers
    .map((career) => {
      const requiredSkills = [
        ...new Map(
          (career.skills || [])
            .filter((skill) => skill.trim())
            .map((skill) => [normalize(skill), skill.trim()])
        ).values(),
      ];

      const matchingSkills = requiredSkills.filter((skill) =>
        userSkills.has(normalize(skill))
      );

      const missingSkills = requiredSkills.filter(
        (skill) => !userSkills.has(normalize(skill))
      );

      const coverage =
        requiredSkills.length > 0
          ? Math.round(
              (matchingSkills.length / requiredSkills.length) * 100
            )
          : null;

      return {
        ...career,
        matchingSkills,
        missingSkills,
        coverage,
      };
    })
    .sort(
      (a, b) =>
        (b.coverage ?? -1) - (a.coverage ?? -1) ||
        a.title.localeCompare(b.title)
    );

  return (
    <section className="cp-panel">
      <h2>Career Paths</h2>
      <p>
        Compare your current skills with each career's listed skills.
        Careers are sorted by skill coverage.
      </p>

      {userSkills.size === 0 && (
        <p>
          Add your current skills in My Profile to personalize this view.
        </p>
      )}

      {loading && <p role="status">Loading career paths...</p>}

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

      {!loading && !error && rankedCareers.length === 0 && (
        <p>No career paths have been added yet.</p>
      )}

      {!loading && !error && (
        <div className="cp-cards">
          {rankedCareers.map((career) => (
            <article className="cp-card" key={career._id}>
              <h3>{career.title}</h3>
              <p>{career.description}</p>

              {career.coverage !== null ? (
                <>
                  <p>
                    <strong>
                      Skill coverage: {career.coverage}%
                    </strong>
                  </p>
                  <progress
                    className="cp-skill-progress"
                    value={career.coverage}
                    max={100}
                    aria-label={`${career.title} skill coverage`}
                  />
                </>
              ) : (
                <p>No required skills have been listed yet.</p>
              )}

              <h4>Matching skills</h4>
              {career.matchingSkills.length > 0 ? (
                <ul>
                  {career.matchingSkills.map((skill) => (
                    <li key={skill}>{skill}</li>
                  ))}
                </ul>
              ) : (
                <p>No matching skills listed in your profile yet.</p>
              )}

              <h4>Skills to develop</h4>
              {career.missingSkills.length > 0 ? (
                <ul>
                  {career.missingSkills.map((skill) => (
                    <li key={skill}>{skill}</li>
                  ))}
                </ul>
              ) : (
                career.coverage !== null && (
                  <p>All listed skills match your profile.</p>
                )
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}