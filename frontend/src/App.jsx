import { useCallback, useState } from "react";
import Dashboard from "./components/Dashboard";
import "./App.css";

const API_URL = "http://localhost:5001/api/auth";

export default function App() {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Keep this initial session in memory
  const [session, setSession] = useState(null);

  const isRegister = mode === "register";

  function changeMode() {
    setMode(isRegister ? "login" : "register");
    setMessage("");
    setError("");
    setPassword("");
    setConfirmPassword("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (isRegister && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (isRegister && new TextEncoder().encode(password).length > 72) {
      setError("Password must not exceed 72 bytes.");
      return;
    }

    setLoading(true);

    try {
      const body = isRegister
        ? { name: name.trim(), email: email.trim(), password }
        : { email: email.trim(), password };

      const response = await fetch(
        `${API_URL}/${isRegister ? "register" : "login"}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Request failed.");
      }

      if (isRegister) {
        setMode("login");
        setPassword("");
        setConfirmPassword("");
        setMessage("Account created successfully. Please log in.");
      } else {
        setSession({
          user: data.user,
          token: data.token,
        });
        setPassword("");
      }
    } catch (err) {
      setError(
        err instanceof TypeError
          ? "Cannot connect to the server. Check that the backend is running on port 5001."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    setSession(null);
    setMode("login");
    setPassword("");
    setMessage("");
    setError("");
  }
const handleLogout = useCallback(() => {
  setSession(null);
  setPassword("");
  setConfirmPassword("");
  setError("");
  setMessage("");
  setMode("login");
}, []);
  if (session) {
    return (
    <Dashboard
      token={session.token}
      onLogout={handleLogout}
    />
  );
  }

  return (
    <main className="auth-page">
      <section className="intro-panel">
        <span className="brand">CareerPath</span>

        <div className="intro-content">
          <span className="eyebrow">YOUR FUTURE STARTS HERE</span>
          <h1>
            Discover your path.
            <br />
            Build your future.
          </h1>
          <p>
            Explore career opportunities, develop your skills,
            and take the next step with confidence.
          </p>

          <div className="feature-list">
            <div>✓ Explore career paths</div>
            <div>✓ Find skills to develop</div>
            <div>✓ Track your learning journey</div>
          </div>
        </div>

        <p className="intro-footer">
          Career Guidance &amp; Skill Development
        </p>
      </section>

      <section className="form-panel">
        <div className="auth-card">
          <span className="form-tag">LET’S GET STARTED</span>
          <h2>{isRegister ? "Create your account" : "Welcome back"}</h2>
          <p className="form-description">
            {isRegister
              ? "Start planning your career journey today."
              : "Log in to continue your career journey."}
          </p>

          <form onSubmit={handleSubmit}>
            {isRegister && (
              <label>
                Full name
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                  maxLength={100}
                  autoComplete="name"
                  disabled={loading}
                />
              </label>
            )}

            <label>
              Email address
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
                disabled={loading}
              />
            </label>

            <label>
              Password
              <input
                type="password"
                placeholder={
                  isRegister
                    ? "Create a password (8+ characters)"
                    : "Enter your password"
                }
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={isRegister ? 8 : undefined}
                autoComplete={
                  isRegister ? "new-password" : "current-password"
                }
                disabled={loading}
              />
            </label>

            {isRegister && (
              <label>
                Confirm password
                <input
                  type="password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(event.target.value)
                  }
                  required
                  minLength={8}
                  autoComplete="new-password"
                  disabled={loading}
                />
              </label>
            )}

            {error && (
              <p className="feedback error" role="alert">
                {error}
              </p>
            )}

            {message && (
              <p className="feedback success" role="status">
                {message}
              </p>
            )}

            <button
              className="primary-button"
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Please wait..."
                : isRegister
                  ? "Create account"
                  : "Log in"}
            </button>
          </form>

          <p className="switch-text">
            {isRegister
              ? "Already have an account?"
              : "Don’t have an account?"}{" "}
            <button
              type="button"
              onClick={changeMode}
              disabled={loading}
            >
              {isRegister ? "Log in" : "Sign up"}
            </button>
          </p>
        </div>
      </section>
    </main>
  );
}