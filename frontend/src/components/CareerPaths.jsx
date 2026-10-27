import { useEffect, useState } from "react";
import { getCareerImage, careerDefault } from "../utils/imageMapper";

export default function CareerPaths({ token, onLogout, user, onSelectCareer }) {
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
      <div className="cp-section-header">
        <div>
          <h2>Career Paths</h2>
          <p>
            Explore high-demand career tracks and compare required competencies with your current profile skills.
          </p>
        </div>
      </div>

      {userSkills.size === 0 && (
        <div className="cp-notice-pill" role="status">
          <span>💡</span>
          <p>
            Tip: Add your current skills in <strong>My Profile</strong> to view personalized skill coverage percentages.
          </p>
        </div>
      )}

      {loading && <p className="cp-loading-text" role="status">Loading career paths...</p>}

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

      {!loading && !error && rankedCareers.length === 0 && (
        <p className="cp-empty-text">No career paths have been added yet.</p>
      )}

      {!loading && !error && (
        <div className="cp-cards">
          {rankedCareers.map((career) => (
            <article className="cp-card cp-career-card" key={career._id}>
              <div className="cp-thumbnail-container">
                <img
                  src={getCareerImage(career.title)}
                  alt={`${career.title} pathway banner`}
                  className="cp-card-thumbnail"
                  width="400"
                  height="200"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = careerDefault;
                  }}
                />
              </div>

              <div className="cp-card-body">
                <h3>{career.title}</h3>
                <p className="cp-card-description">{career.description}</p>

                {career.coverage !== null ? (
                  <div className="cp-coverage-block">
                    <div className="cp-coverage-label">
                      <span>Skill Match</span>
                      <span className="cp-coverage-val">{career.coverage}%</span>
                    </div>
                    <progress
                      className="cp-skill-progress"
                      value={career.coverage}
                      max={100}
                      aria-label={`${career.title} skill match ${career.coverage}%`}
                    />
                  </div>
                ) : (
                  <p className="cp-subtle-text">No required skills listed.</p>
                )}

                <div className="cp-skills-section">
                  <h4>Matching Skills ({career.matchingSkills.length})</h4>
                  {career.matchingSkills.length > 0 ? (
                    <ul className="cp-skill-pills">
                      {career.matchingSkills.map((skill) => (
                        <li key={skill} className="cp-pill-match">
                          ✓ {skill}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="cp-subtle-text">No matching skills recorded yet.</p>
                  )}
                </div>

                <div className="cp-skills-section">
                  <h4>Skills to Develop ({career.missingSkills.length})</h4>
                  {career.missingSkills.length > 0 ? (
                    <ul className="cp-skill-pills">
                      {career.missingSkills.map((skill) => (
                        <li key={skill} className="cp-pill-missing">
                          + {skill}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    career.coverage !== null && (
                      <p className="cp-subtle-success">✓ 100% of listed skills match your profile!</p>
                    )
                  )}
                </div>

                <button
                  type="button"
                  className="cp-btn-primary cp-btn-full"
                  onClick={() => onSelectCareer(career)}
                >
                  Find Courses for This Career →
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
