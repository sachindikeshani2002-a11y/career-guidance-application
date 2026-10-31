import { useEffect, useState, useMemo } from "react";
import { getCareerImage, careerDefault } from "../utils/imageMapper";

const CAREER_FIELD_FALLBACKS = {
  "civil engineer": "Engineering",
  "mechanical engineer": "Engineering",
  "electrical and electronic engineer": "Engineering",
  "computer engineer": "Engineering",
  "manufacturing engineer": "Engineering",
  "software developer": "IT & Computing",
  "data analyst": "IT & Computing",
  "cybersecurity analyst": "IT & Computing",
  "business analyst": "Business & Management",
  "project coordinator": "Business & Management",
  "human resources executive": "Business & Management",
  "accountant": "Finance & Accounting",
  "financial analyst": "Finance & Accounting",
  "banking officer": "Finance & Accounting",
  "digital marketing executive": "Marketing & Media",
  "content strategist": "Marketing & Media",
  "marketing executive": "Marketing & Media",
  "ui/ux designer": "Marketing & Media",
};

export default function CareerPaths({
  token,
  onLogout,
  user,
  targetCareer,
  onSelectCareer,
  onClearCareer,
}) {
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  const [selectedField, setSelectedField] = useState("All Fields");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadCareers() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch("http://localhost:5001/api/careers", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        const data = await response.json();

        if (controller.signal.aborted) return;

        if (response.status === 401) {
          onLogout();
          return;
        }

        if (!response.ok) {
          throw new Error(data.message || "Unable to load career paths");
        }

        setCareers(Array.isArray(data.careers) ? data.careers : []);
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
    return typeof value === "string" ? value.trim().toLowerCase() : "";
  }

  const userSkills = useMemo(() => {
    return new Set((user?.skills || []).map(normalize).filter(Boolean));
  }, [user?.skills]);

  // Extract unique available fields, starting with standard fields
  const availableFields = useMemo(() => {
    const standard = [
      "All Fields",
      "Engineering",
      "IT & Computing",
      "Business & Management",
      "Finance & Accounting",
      "Marketing & Media",
    ];

    const presentInCareers = careers
      .map((c) => {
        const raw = c.field ? c.field.trim() : "";
        if (raw && raw !== "General") return raw;
        return CAREER_FIELD_FALLBACKS[normalize(c.title)] || "";
      })
      .filter(Boolean);

    return [...new Set([...standard, ...presentInCareers])];
  }, [careers]);

  // Compute skill coverage and ranks
  const rankedCareers = useMemo(() => {
    return careers
      .map((career) => {
        const rawSkills = Array.isArray(career.skills) ? career.skills : [];
        const requiredSkills = [
          ...new Map(
            rawSkills
              .filter((skill) => typeof skill === "string" && skill.trim())
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
            ? Math.round((matchingSkills.length / requiredSkills.length) * 100)
            : null;

        const titleKey = normalize(career.title);
        const resolvedField =
          (career.field && career.field.trim() && career.field !== "General"
            ? career.field.trim()
            : null) ||
          CAREER_FIELD_FALLBACKS[titleKey] ||
          career.field ||
          "General";

        return {
          ...career,
          field: resolvedField,
          responsibilities: Array.isArray(career.responsibilities)
            ? career.responsibilities
            : [],
          educationGuidance: career.educationGuidance || "",
          disclaimer: career.disclaimer || "",
          requiredSkills,
          matchingSkills,
          missingSkills,
          coverage,
        };
      })
      .sort((a, b) => {
        return (
          (b.coverage ?? -1) - (a.coverage ?? -1) ||
          a.title.localeCompare(b.title)
        );
      });
  }, [careers, userSkills]);

  // Combined search and field filter
  const filteredCareers = useMemo(() => {
    const cleanQuery = searchQuery.trim().toLowerCase();

    return rankedCareers.filter((career) => {
      const matchesField =
        selectedField === "All Fields" ||
        career.field.toLowerCase() === selectedField.toLowerCase();

      if (!matchesField) return false;

      if (!cleanQuery) return true;

      const searchableStrings = [
        career.title,
        career.field,
        career.description,
        career.educationGuidance,
        ...career.requiredSkills,
        ...career.responsibilities,
      ];

      return searchableStrings.some((text) =>
        String(text || "").toLowerCase().includes(cleanQuery)
      );
    });
  }, [rankedCareers, selectedField, searchQuery]);

  function resetFilters() {
    setSelectedField("All Fields");
    setSearchQuery("");
  }

  const activeTargetId =
    targetCareer?._id || user?.targetCareer?._id || user?.targetCareer;

  const isFiltered =
    selectedField !== "All Fields" || searchQuery.trim().length > 0;

  return (
    <section className="cp-panel">
      <div className="cp-section-header">
        <div>
          <h2>Career Paths</h2>
          <p>
            Explore high-demand career pathways across Engineering, IT,
            Business, Finance, and Marketing. Compare required competencies with
            your current profile skills to plan your university learning journey.
          </p>
        </div>
      </div>

      {/* Illustrative Educational Guidance Banner */}
      <div className="cp-guidance-banner" role="note">
        <span className="cp-guidance-icon" aria-hidden="true">
          ℹ️
        </span>
        <div>
          <strong>Illustrative Educational Guidance:</strong> Career pathways,
          typical responsibilities, required skills, and qualification
          guidance shown here are for educational exploration only. They do not
          constitute official university degree requirements, statutory
          accreditation, or employment guarantees.
        </div>
      </div>

      {userSkills.size === 0 && (
        <div className="cp-notice-pill" role="status">
          <span>💡</span>
          <p>
            Tip: Add your current skills in <strong>My Profile</strong> to view
            personalized skill coverage percentages across career tracks.
          </p>
        </div>
      )}

      {/* Search and Field Filter Controls */}
      <div className="cp-career-controls">
        <div>
          <label htmlFor="career-search">Search Careers</label>
          <input
            id="career-search"
            type="search"
            placeholder="Search by title, description, or required skill..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="career-field-select">Filter by Field</label>
          <select
            id="career-field-select"
            value={selectedField}
            onChange={(e) => setSelectedField(e.target.value)}
          >
            {availableFields.map((field) => (
              <option key={field} value={field}>
                {field}
              </option>
            ))}
          </select>
        </div>

        {isFiltered && (
          <button
            type="button"
            className="cp-btn-secondary"
            onClick={resetFilters}
          >
            Reset filters
          </button>
        )}
      </div>

      {/* Engineering Field Faculty Advisory Banner */}
      {selectedField === "Engineering" && (
        <div className="cp-engineering-notice" role="alert">
          <span aria-hidden="true">⚠️</span>
          <div>
            <strong>Faculty of Engineering Advisory:</strong> Completing online
            short courses or matching introductory competencies provides foundational
            understanding, but does not qualify an individual to practise as a
            professional engineer. Statutory licensure requires completing an
            accredited university engineering degree (such as BSc/BEng) and formal
            registration with recognized professional engineering bodies.
          </div>
        </div>
      )}

      {loading && (
        <p className="cp-loading-text" role="status">
          Loading career pathways...
        </p>
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
          <div className="cp-filter-status-row">
            <p className="cp-count-summary" role="status">
              Showing {filteredCareers.length} of {careers.length} career{" "}
              {careers.length === 1 ? "pathway" : "pathways"}
            </p>
          </div>

          {careers.length === 0 && (
            <p className="cp-empty-text">No career paths have been added yet.</p>
          )}

          {careers.length > 0 && filteredCareers.length === 0 && (
            <div className="cp-status-block">
              <p className="cp-empty-text">
                No career paths match your selected field or search query.
              </p>
              <button
                type="button"
                className="cp-btn-secondary"
                onClick={resetFilters}
              >
                Reset filters
              </button>
            </div>
          )}

          <div className="cp-cards">
            {filteredCareers.map((career) => {
              const isCurrentTarget =
                activeTargetId &&
                String(career._id) === String(activeTargetId);
              const isEngineering =
                career.field === "Engineering" ||
                career.title.toLowerCase().includes("engineer");

              return (
                <article className="cp-card cp-career-card" key={career._id}>
                  <div className="cp-thumbnail-container">
                    <img
                      src={getCareerImage(career.title)}
                      alt=""
                      aria-hidden="true"
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
                    <div className="cp-career-badge-row">
                      <span className="cp-badge-field">{career.field}</span>
                      {isCurrentTarget && (
                        <span className="cp-badge-target">
                          ✓ Active Target Career
                        </span>
                      )}
                    </div>

                    <h3>{career.title}</h3>
                    <p className="cp-card-description">{career.description}</p>

                    {/* Typical Responsibilities */}
                    {career.responsibilities &&
                      career.responsibilities.length > 0 && (
                        <div className="cp-career-responsibilities">
                          <h4>Typical Responsibilities</h4>
                          <ul>
                            {career.responsibilities.map((resp, idx) => (
                              <li key={idx}>{resp}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                    {/* Skill Match Coverage Meter */}
                    {career.coverage !== null ? (
                      <div className="cp-coverage-block">
                        <div className="cp-coverage-label">
                          <span>Skill Match Coverage</span>
                          <span className="cp-coverage-val">
                            {career.coverage}%
                          </span>
                        </div>
                        <progress
                          className="cp-skill-progress"
                          value={career.coverage}
                          max={100}
                          aria-label={`${career.title} skill match ${career.coverage}%`}
                        />
                        <p className="cp-match-explanation">
                          Reflects foundational skills listed for this career
                          matching your current profile.
                        </p>
                      </div>
                    ) : (
                      <p className="cp-subtle-text">
                        No required skills listed.
                      </p>
                    )}

                    {/* Matching Skills */}
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
                        <p className="cp-subtle-text">
                          No matching skills recorded yet.
                        </p>
                      )}
                    </div>

                    {/* Skills to Develop */}
                    <div className="cp-skills-section">
                      <h4>
                        Skills to Develop ({career.missingSkills.length})
                      </h4>
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
                          <p className="cp-subtle-success">
                            ✓ 100% of listed foundational skills match your
                            profile!
                          </p>
                        )
                      )}
                    </div>

                    {/* Engineering Faculty Caution (Skills & Guidance) */}
                    {isEngineering && (
                      <div className="cp-engineering-notice">
                        <span aria-hidden="true">⚠️</span>
                        <p>
                          <strong>Professional Licensure:</strong> Completing
                          short courses or matching skills does not qualify
                          someone to practise as a professional engineer.
                          Accredited university degree required.
                        </p>
                      </div>
                    )}

                    {/* Educational & Qualification Guidance */}
                    {career.educationGuidance && (
                      <div className="cp-career-education">
                        <h4>Educational Guidance</h4>
                        <p className="cp-education-text">
                          {career.educationGuidance}
                        </p>
                        <p className="cp-education-subnote">
                          * Illustrative educational guidance only.
                        </p>
                      </div>
                    )}

                    <div className="cp-career-card-actions">
                      <button
                        type="button"
                        className="cp-btn-primary cp-btn-full"
                        onClick={() => onSelectCareer(career)}
                      >
                        {isCurrentTarget
                          ? "Active Target (View Courses) →"
                          : "Select as Target & View Courses →"}
                      </button>

                      {isCurrentTarget && onClearCareer && (
                        <button
                          type="button"
                          className="cp-btn-secondary cp-btn-full"
                          style={{ marginTop: "8px" }}
                          onClick={onClearCareer}
                        >
                          Clear Active Target
                        </button>
                      )}
                    </div>
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
