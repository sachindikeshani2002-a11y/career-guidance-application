import { useCallback, useState } from "react";
import Dashboard from "./components/Dashboard";
import { heroAuth } from "./utils/imageMapper";
import "./App.css";

const API_URL = "http://localhost:5001/api/auth";

export default function App() {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Keep session in memory
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
        setMessage("Account created successfully! Please log in.");
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
      <section className="intro-panel" aria-label="CareerPath Introduction">
        <div className="brand-badge">
          <span className="brand-dot"></span>
          <span className="brand">CareerPath</span>
        </div>

        <div className="intro-content">
          <span className="eyebrow">UNIVERSITY CAREER GUIDANCE &amp; SKILLS</span>
          <h1>
            Discover your path.
            <br />
            Build your future.
          </h1>
          <p>
            Explore career tracks, assess skill readiness, enroll in university
            courses, and track your milestone progress.
          </p>

          <div className="feature-list">
            <div>
              <span className="check-bullet">✓</span>
              <span>Compare skills against career requirements</span>
            </div>
            <div>
              <span className="check-bullet">✓</span>
              <span>Find courses with high new-skill coverage</span>
            </div>
            <div>
              <span className="check-bullet">✓</span>
              <span>Persist your career target and learning history</span>
            </div>
          </div>
        </div>

        <div className="intro-hero-wrapper">
          <img
            src={heroAuth}
            alt="Career planning dashboard illustration"
            className="intro-hero-img"
            width="460"
            height="260"
            loading="lazy"
          />
        </div>

        <p className="intro-footer">
          EC4307 Web Application Development · Academic Project
        </p>
      </section>

      <section className="form-panel" aria-label="Account Access">
        <div className="auth-card">
          <span className="form-tag">
            {isRegister ? "STUDENT REGISTRATION" : "SECURE LOGIN"}
          </span>
          <h2>{isRegister ? "Create your account" : "Welcome back"}</h2>
          <p className="form-description">
            {isRegister
              ? "Register with your student profile to start planning."
              : "Log in with your credentials to access your dashboard."}
          </p>

          <form onSubmit={handleSubmit} noValidate>
            {isRegister && (
              <label>
                Full name
                <input
                  type="text"
                  placeholder="e.g. Samith Rathnayaka"
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
                placeholder="you@university.edu"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
                disabled={loading}
              />
            </label>

            <label className="password-label">
              <span>Password</span>
              <div className="password-input-group">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder={
                    isRegister
                      ? "Create a secure password (8+ characters)"
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
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  disabled={loading}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </label>

            {isRegister && (
              <label>
                Confirm password
                <input
                  type={showPassword ? "text" : "password"}
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
                <span>⚠</span> {error}
              </p>
            )}

            {message && (
              <p className="feedback success" role="status">
                <span>✓</span> {message}
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
                  ? "Create Account"
                  : "Log In to CareerPath"}
            </button>
          </form>

          <p className="switch-text">
            {isRegister
              ? "Already have an account?"
              : "Don't have an account yet?"}{" "}
            <button
              type="button"
              onClick={changeMode}
              disabled={loading}
            >
              {isRegister ? "Log In" : "Register Here"}
            </button>
          </p>
        </div>
      </section>
    </main>
  );
}
