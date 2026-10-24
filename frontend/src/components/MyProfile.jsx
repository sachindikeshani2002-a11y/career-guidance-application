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
    <section className="cp-panel">
      <h2>My Profile</h2>
      <p>Update your name, interests and current skills.</p>

      <form
        className="cp-profile-form"
        onSubmit={handleSave}
        aria-busy={saving}
      >
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

        <label htmlFor="profile-email">Email</label>
        <input
          id="profile-email"
          type="email"
          value={user.email || ""}
          readOnly
        />

        <label htmlFor="profile-role">Account role</label>
        <input
          id="profile-role"
          type="text"
          value={user.role || "student"}
          readOnly
        />

        <label htmlFor="profile-interests">Interests</label>
        <textarea
          id="profile-interests"
          value={interests}
          onChange={(event) =>
            setInterests(event.target.value)
          }
          placeholder="Web Development, Data Analysis, Design"
          rows={3}
          disabled={saving}
          aria-describedby="profile-list-help"
        />

        <label htmlFor="profile-skills">Current skills</label>
        <textarea
          id="profile-skills"
          value={skills}
          onChange={(event) =>
            setSkills(event.target.value)
          }
          placeholder="HTML, CSS, JavaScript"
          rows={3}
          disabled={saving}
          aria-describedby="profile-list-help"
        />

        <small id="profile-list-help">
          Separate items with commas. Maximum 20 items per field,
          each up to 60 characters. Duplicate items are removed.
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