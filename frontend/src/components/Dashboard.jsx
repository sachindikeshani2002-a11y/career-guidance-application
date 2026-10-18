import { useEffect, useState } from "react";
import "./Dashboard.css";

import CareerPaths from "./CareerPaths";
import SkillDevelopment from "./SkillDevelopment";
import MyProgress from "./MyProgress";
import MyProfile from "./MyProfile";
import ProgressSummary from "./ProgressSummary";

export default function Dashboard({ token, onLogout }) {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  const [activeTab, setActiveTab] = useState("Overview");
  const [targetCareer, setTargetCareer] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadUser() {
      setLoading(true);
      setError("");
      setUser(null);

      try {
        const response = await fetch(
          "http://localhost:5001/api/auth/me",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          }
        );

        if (controller.signal.aborted) return;

        if (response.status === 401) {
          onLogout();
          return;
        }

        const data = await response.json();

        if (controller.signal.aborted) return;

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load your account"
          );
        }

        if (!data.user) {
          throw new Error("User information was not received");
        }

        setUser(data.user);
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

    loadUser();

    return () => controller.abort();
  }, [token, onLogout, attempt]);

  function handleSelectCareer(career) {
    setTargetCareer(career);
    setActiveTab("Skill Development");
  }

  if (loading) {
    return (
      <div className="dashboard-status" role="status">
        Loading your dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-status">
        <p role="alert">{error}</p>

        <button
          type="button"
          onClick={() => setAttempt((value) => value + 1)}
        >
          Try again
        </button>

        <button type="button" onClick={onLogout}>
          Back to login
        </button>
      </div>
    );
  }

  if (!user) return null;

  const tabs = [
    "Overview",
    "My Profile",
    "Career Paths",
    "Skill Development",
    "My Progress",
  ];

  const overviewCards = [
    {
      title: "Career Paths",
      text: "Compare your skills with career requirements and find skills to develop.",
    },
    {
      title: "Skill Development",
      text: "Explore courses and find learning opportunities for your target career.",
    },
    {
      title: "My Progress",
      text: "View your enrolled courses, read lessons and track completed courses.",
    },
  ];

  return (
    <div className="cp-dashboard">
      <aside className="cp-sidebar">
        <h2>CareerPath</h2>
        <p>Your future starts here</p>

        <nav aria-label="Dashboard navigation">
          {tabs.map((tab) => (
            <button
              type="button"
              key={tab}
              className={activeTab === tab ? "active" : ""}
              aria-current={
                activeTab === tab ? "page" : undefined
              }
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </nav>

        <button
          type="button"
          className="cp-logout"
          onClick={onLogout}
        >
          Log out
        </button>
      </aside>

      <main className="cp-main">
        <header className="cp-header">
          <div>
            <p className="cp-eyebrow">STUDENT DASHBOARD</p>
            <h1>Welcome, {user.name}!</h1>
            <p>
              Explore your interests and plan your next step.
            </p>
          </div>

          <span className="cp-role">{user.role}</span>
        </header>

        {activeTab === "Overview" && (
          <>
            <section className="cp-banner">
              <h2>Build your path to a better future</h2>

              <p>
                Start with your profile, explore career paths,
                and develop the skills you need.
              </p>

              <button
                type="button"
                onClick={() => setActiveTab("My Profile")}
              >
                View my profile
              </button>
            </section>

            <ProgressSummary
              token={token}
              onLogout={onLogout}
            />

            {targetCareer && (
              <section
                className="cp-panel"
                style={{ marginTop: "20px" }}
              >
                <h3>Current target career</h3>
                <p>{targetCareer.title}</p>

                <button
                  type="button"
                  onClick={() =>
                    setActiveTab("Skill Development")
                  }
                >
                  Explore related courses
                </button>
              </section>
            )}

            <section className="cp-cards">
              {overviewCards.map((item) => (
                <article
                  className="cp-card"
                  key={item.title}
                >
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>

                  <button
                    type="button"
                    onClick={() => setActiveTab(item.title)}
                  >
                    Explore →
                  </button>
                </article>
              ))}
            </section>
          </>
        )}

        {activeTab === "My Profile" && (
          <MyProfile
            user={user}
            token={token}
            onLogout={onLogout}
            onSaved={setUser}
          />
        )}

        {activeTab === "Career Paths" && (
          <CareerPaths
            token={token}
            onLogout={onLogout}
            user={user}
            onSelectCareer={handleSelectCareer}
          />
        )}

        {activeTab === "Skill Development" && (
          <SkillDevelopment
            token={token}
            onLogout={onLogout}
            user={user}
            targetCareer={targetCareer}
            onClearCareer={() => setTargetCareer(null)}
          />
        )}

        {activeTab === "My Progress" && (
          <MyProgress
            token={token}
            onLogout={onLogout}
          />
        )}
      </main>
    </div>
  );
}