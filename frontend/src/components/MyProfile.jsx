import { useState } from "react";

export default function MyProfile({
  user,
  token,
  onLogout,
  onSaved,
}) {
  const [name, setName] = useState(user.name || "");

  const [interests, setInterests] = useState(
    (user.interests || []).join(", ")
  );

  const [skills, setSkills] = useState(
    (user.skills || []).join(", ")
  );

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function toList(text) {
    const seen = new Set();

    return text
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .filter((item) => {
        const key = item.toLowerCase();

        if (seen.has(key)) return false;

        seen.add(key);
        return true;
      });
  }

  const parsedInterests = toList(interests);
  const parsedSkills = toList(skills);

  const initials = (name || user.name || "U")
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  async function handleSave(event) {
    event.preventDefault();

    if (saving) return;

    setMessage("");
    setError("");

    const cleanName = name.trim();
    const interestList = toList(interests);
    const skillList = toList(skills);

    if (!cleanName || cleanName.length > 100) {
      setError("Enter a name between 1 and 100 characters.");
      return;
    }

    if (interestList.length > 20 || skillList.length > 20) {
      setError("Enter at most 20 interests and 20 skills.");
      return;
    }

    if (
      [...interestList, ...skillList].some(
        (item) => item.length > 60
      )
    ) {
      setError("Each interest or skill must be at most 60 characters.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        "http://localhost:5001/api/auth/profile",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: cleanName,
            interests: interestList,
            skills: skillList,
          }),
        }
      );

      if (response.status === 401) {
        onLogout();
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to save your profile"
        );
      }

      if (!data.user) {
        throw new Error("Updated profile was not received");
      }

      onSaved(data.user);

      setName(data.user.name || "");
      setInterests((data.user.interests || []).join(", "));
      setSkills((data.user.skills || []).join(", "));

      setMessage(
        data.message || "Profile updated successfully"
      );
    } catch (err) {
      setError(
        err instanceof TypeError
          ? "Cannot connect to the backend. Check port 5001."
          : err.message
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="cp-panel cp-profile-container">
      <div className="cp-profile-top-bar">
        <div className="cp-profile-avatar-circle" aria-hidden="true">
          {initials}
        </div>
        <div>
          <h2>My Profile</h2>
          <p>Manage your account name, career interests and competency skills.</p>
        </div>
      </div>

      {message && (
        <div className="cp-banner-success" role="status">
          <span>✓</span>
          <p>{message}</p>
          <button
            type="button"
            className="cp-banner-close"
            onClick={() => setMessage("")}
            aria-label="Dismiss message"
          >
            ×
          </button>
        </div>
      )}

      {error && (
        <div className="cp-banner-error" role="alert">
          <span>⚠</span>
          <p>{error}</p>
          <button
            type="button"
            className="cp-banner-close"
            onClick={() => setError("")}
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      <form
        className="cp-profile-form"
        onSubmit={handleSave}
        aria-busy={saving}
        noValidate
      >
        <div className="cp-form-row">
          <div className="cp-form-group">
            <label htmlFor="profile-name">Full name</label>
            <input
              id="profile-name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              maxLength={100}
              disabled={saving}
            />
          </div>

          <div className="cp-form-group">
            <label htmlFor="profile-email">Registered Email</label>
            <input
              id="profile-email"
              type="email"
              value={user.email || ""}
              readOnly
              className="cp-input-readonly"
              title="Registered email cannot be modified"
            />
          </div>

          <div className="cp-form-group cp-form-flex-sm">
            <label htmlFor="profile-role">Account Role</label>
            <input
              id="profile-role"
              type="text"
              value={user.role || "student"}
              readOnly
              className="cp-input-readonly"
            />
          </div>
        </div>

        <div className="cp-form-group">
          <div className="cp-label-with-count">
            <label htmlFor="profile-interests">Career Interests</label>
            <span className="cp-char-count">{parsedInterests.length}/20 items</span>
          </div>
          <textarea
            id="profile-interests"
            value={interests}
            onChange={(event) => setInterests(event.target.value)}
            placeholder="e.g. Cloud Computing, Machine Learning, UI/UX Design"
            rows={4}
            disabled={saving}
            aria-describedby="profile-interests-help"
          />
          <small id="profile-interests-help" className="cp-field-help">
            Separate items with commas. Up to 20 interests, max 60 characters each.
          </small>
          {parsedInterests.length > 0 && (
            <div className="cp-preview-pills">
              <span className="cp-preview-title">Recognized:</span>
              <ul className="cp-skill-pills">
                {parsedInterests.map((item) => (
                  <li key={item} className="cp-pill-interest">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="cp-form-group">
          <div className="cp-label-with-count">
            <label htmlFor="profile-skills">Current Skills</label>
            <span className="cp-char-count">{parsedSkills.length}/20 items</span>
          </div>
          <textarea
            id="profile-skills"
            value={skills}
            onChange={(event) => setSkills(event.target.value)}
            placeholder="e.g. JavaScript, Python, SQL, Git, Figma"
            rows={4}
            disabled={saving}
            aria-describedby="profile-skills-help"
          />
          <small id="profile-skills-help" className="cp-field-help">
            Separate items with commas. Used directly to calculate Career Path match rates.
          </small>
          {parsedSkills.length > 0 && (
            <div className="cp-preview-pills">
              <span className="cp-preview-title">Recognized:</span>
              <ul className="cp-skill-pills">
                {parsedSkills.map((item) => (
                  <li key={item} className="cp-pill-general">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="cp-profile-actions">
          <button
            type="submit"
            className="cp-btn-primary cp-btn-save"
            disabled={saving}
          >
            {saving ? "Saving Changes..." : "Save Profile"}
          </button>
        </div>
      </form>
    </section>
  );
}
