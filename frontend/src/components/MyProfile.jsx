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
    return text
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  async function handleSave(event) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

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
            name,
            interests: toList(interests),
            skills: toList(skills),
          }),
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        onLogout();
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Unable to save profile");
      }

      onSaved(data.user);
      setName(data.user.name);
      setInterests(data.user.interests.join(", "));
      setSkills(data.user.skills.join(", "));
      setMessage(data.message);
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
    <section className="cp-panel">
      <h2>My Profile</h2>
      <p>Add your interests and current skills.</p>

      <form className="cp-profile-form" onSubmit={handleSave}>
        <label htmlFor="profile-name">Full name</label>
        <input
          id="profile-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          maxLength={100}
          disabled={saving}
        />

        <label htmlFor="profile-email">Email</label>
        <input
          id="profile-email"
          type="email"
          value={user.email}
          readOnly
        />

        <label htmlFor="profile-interests">Interests</label>
        <textarea
          id="profile-interests"
          value={interests}
          onChange={(event) => setInterests(event.target.value)}
          placeholder="Web Development, Data Analysis, Design"
          rows={3}
          disabled={saving}
          aria-describedby="profile-list-help"
        />

        <label htmlFor="profile-skills">Current skills</label>
        <textarea
          id="profile-skills"
          value={skills}
          onChange={(event) => setSkills(event.target.value)}
          placeholder="HTML, CSS, JavaScript"
          rows={3}
          disabled={saving}
          aria-describedby="profile-list-help"
        />

        <small id="profile-list-help">
          Separate items with commas. Maximum 20 items per field,
          each up to 60 characters.
        </small>

        {message && <p role="status">{message}</p>}
        {error && <p role="alert">{error}</p>}

        <button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save profile"}
        </button>
      </form>
    </section>
  );
}