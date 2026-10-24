
import { useCallback, useEffect, useState } from "react";
import "./AdminDashboard.css";

const API_BASE = "https://acm-student-project.onrender.com/api/admin";
const TOKEN_KEY = "acm_admin_token";

const YEARS = ["1st year", "2nd year", "3rd year", "4th year", "Other"];

const EVENTS = [
  "Web Dev Kickstart",
  "CodeSprint Challenge",
  "TechTalk & Connect",
  "General chapter membership",
];

function readStoredToken() {
  try {
    return sessionStorage.getItem(TOKEN_KEY) || "";
  } catch {
    return "";
  }
}

async function apiRequest(path, token, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  let result;

  try {
    result = await response.json();
  } catch {
    throw new Error("Server returned an invalid response.");
  }

  if (!response.ok || result.success === false) {
    if (response.status === 401 || response.status === 403) {
      throw new Error("SESSION_EXPIRED");
    }

    const details = Array.isArray(result.errors)
      ? result.errors.join(" ")
      : "";

    throw new Error(
      details || result.message || "Request failed. Please try again."
    );
  }

  return result;
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function AdminLogin({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (loading) return;

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      const result = await response.json();

      if (!response.ok || result.success !== true || !result.token) {
        throw new Error(
          result.message || "Login failed. Check your credentials."
        );
      }

      try {
        sessionStorage.setItem(TOKEN_KEY, result.token);
      } catch {
        throw new Error(
          "Session storage is unavailable. Enable browser storage and try again."
        );
      }

      onLogin(result.token);
    } catch (err) {
      setError(
        err instanceof TypeError
          ? "Backend se connect nahi ho pa raha. Check karo server port 5000 par running hai."
          : err.message || "Unable to log in."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="admin-login-page">
      <a className="admin-back-home" href="/">
        ← Back to website
      </a>

      <form className="admin-login-card" onSubmit={handleSubmit}>
        <div className="admin-brand-mark">ACM</div>
        <p className="admin-eyebrow">STUDENT CHAPTER · ABES</p>
        <h1>Admin sign in</h1>
        <p className="admin-muted">
          Sign in to manage student registrations and view chapter statistics.
        </p>

        {error && (
          <div className="admin-alert admin-alert-error" role="alert">
            {error}
          </div>
        )}

        <label className="admin-field">
          Username
          <input
            type="text"
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="Enter admin username"
            required
          />
        </label>

        <label className="admin-field">
          Password
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter admin password"
            required
          />
        </label>

        <button
          className="admin-primary-button admin-login-button"
          type="submit"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign in securely"}
          {!loading && <span> ↗</span>}
        </button>

        <p className="admin-login-footnote">
          Authorized chapter administrators only.
        </p>
      </form>
    </main>
  );
}

function StatCard({ label, value, description, icon }) {
  return (
    <article className="admin-stat-card">
      <div className="admin-stat-top">
        <span className="admin-stat-label">{label}</span>
        <span className="admin-stat-icon">{icon}</span>
      </div>
      <strong className="admin-stat-value">{value}</strong>
      <span className="admin-stat-description">{description}</span>
    </article>
  );
}

function AdminDashboard() {
  const [token, setToken] = useState(readStoredToken);
  const [stats, setStats] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [count, setCount] = useState(0);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [year, setYear] = useState("");
  const [selectedEvent, setSelectedEvent] = useState("");

  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");

  const logout = useCallback(() => {
    try {
      sessionStorage.removeItem(TOKEN_KEY);
    } catch {
      // The in-memory session is still cleared.
    }

    setToken("");
    setStats(null);
    setRegistrations([]);
    setCount(0);
    setError("");
  }, []);

  const loadStats = useCallback(async () => {
    if (!token) return;

    setLoadingStats(true);

    try {
      const result = await apiRequest("/stats", token);
      setStats(result.stats || {});
      setError("");
    } catch (err) {
      if (err.message === "SESSION_EXPIRED") {
        logout();
        setError("Your session expired. Please sign in again.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoadingStats(false);
    }
  }, [token, logout]);

  const loadRegistrations = useCallback(async () => {
    if (!token) return;

    setLoadingRegistrations(true);

    try {
      const params = new URLSearchParams();

      if (search.trim()) params.set("search", search.trim());
      if (year) params.set("year", year);
      if (selectedEvent) params.set("event", selectedEvent);

      const query = params.toString();
      const path = `/registrations${query ? `?${query}` : ""}`;

      const result = await apiRequest(path, token);

      setRegistrations(
        Array.isArray(result.registrations) ? result.registrations : []
      );
      setCount(Number(result.count) || 0);
      setLastUpdated(new Date().toLocaleTimeString("en-IN"));
      setError("");
    } catch (err) {
      if (err.message === "SESSION_EXPIRED") {
        logout();
        setError("Your session expired. Please sign in again.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoadingRegistrations(false);
    }
  }, [token, search, year, selectedEvent, logout]);

  useEffect(() => {
    if (!token) return;

    loadStats();
    loadRegistrations();
  }, [token, loadStats, loadRegistrations]);

  function handleSearchSubmit(event) {
    event.preventDefault();
    setSearch(searchInput.trim());
  }

  function resetFilters() {
    setSearchInput("");
    setSearch("");
    setYear("");
    setSelectedEvent("");
  }

  const yearStats = stats?.years || {};
  const eventStats = stats?.events || {};
  const total = Number(stats?.total) || 0;

  if (!token) {
    return <AdminLogin onLogin={setToken} />;
  }

  return (
    <main className="admin-page">
      <header className="admin-topbar">
        <a className="admin-topbar-brand" href="/">
          <span className="admin-brand-mark">ACM</span>
          <span>
            <strong>STUDENT CHAPTER</strong>
            <small>ABES ENGINEERING COLLEGE</small>
          </span>
        </a>

        <div className="admin-topbar-actions">
          <span className="admin-secure-label">
            <span className="admin-status-dot" /> Admin session
          </span>
          <button
            type="button"
            className="admin-logout-button"
            onClick={logout}
          >
            <span>↪</span> Log out
          </button>
        </div>
      </header>

      <div className="admin-content">
        <section className="admin-welcome">
          <div>
            <p className="admin-eyebrow">ACM / ADMINISTRATION</p>
            <h1>Dashboard overview</h1>
            <p className="admin-muted">
              Manage chapter registrations and track student interest.
            </p>
          </div>

          <button
            type="button"
            className="admin-primary-button admin-refresh-button"
            onClick={() => {
              loadStats();
              loadRegistrations();
            }}
            disabled={loadingStats || loadingRegistrations}
          >
            ↻ {loadingStats || loadingRegistrations ? "Refreshing..." : "Refresh data"}
          </button>
        </section>

        {error && (
          <div className="admin-alert admin-alert-error" role="alert">
            {error}
            {!token && (
              <button type="button" onClick={() => setError("")}>
                Dismiss
              </button>
            )}
          </div>
        )}

        <section className="admin-stats-grid" aria-label="Registration statistics">
          <StatCard
            label="Total registrations"
            value={loadingStats && !stats ? "…" : total}
            description="All submitted registrations"
            icon="◎"
          />
          <StatCard
            label="1st year"
            value={loadingStats && !stats ? "…" : Number(yearStats["1st year"]) || 0}
            description="First-year students"
            icon="01"
          />
          <StatCard
            label="2nd year"
            value={loadingStats && !stats ? "…" : Number(yearStats["2nd year"]) || 0}
            description="Second-year students"
            icon="02"
          />
          <StatCard
            label="3rd & 4th year"
            value={
              loadingStats && !stats
                ? "…"
                : (Number(yearStats["3rd year"]) || 0) +
                  (Number(yearStats["4th year"]) || 0)
            }
            description="Senior-year students"
            icon="03"
          />
        </section>

        <section className="admin-event-summary">
          <div className="admin-section-title">
            <div>
              <p className="admin-eyebrow">STUDENT INTEREST</p>
              <h2>Registrations by event</h2>
            </div>
            <span className="admin-small-note">All registrations</span>
          </div>

          <div className="admin-event-grid">
            {EVENTS.map((eventName) => (
              <article className="admin-event-stat" key={eventName}>
                <span>{eventName}</span>
                <strong>{Number(eventStats[eventName]) || 0}</strong>
              </article>
            ))}
          </div>
        </section>

        <section className="admin-registrations-section">
          <div className="admin-section-title admin-table-heading">
            <div>
              <p className="admin-eyebrow">MEMBER DATABASE</p>
              <h2>Student registrations</h2>
              <p className="admin-muted">
                Search and filter submitted registration records.
              </p>
            </div>

            <span className="admin-record-count">
              {count} {count === 1 ? "record" : "records"}
            </span>
          </div>

          <form
            className="admin-filters"
            onSubmit={handleSearchSubmit}
          >
            <label className="admin-filter-search">
              <span>Search students</span>
              <div className="admin-search-input-wrap">
                <span aria-hidden="true">⌕</span>
                <input
                  type="search"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Name, email or college..."
                />
              </div>
            </label>

            <label className="admin-filter-field">
              <span>Academic year</span>
              <select
                value={year}
                onChange={(event) => setYear(event.target.value)}
              >
                <option value="">All years</option>
                {YEARS.map((item) => (
                  <option value={item} key={item}>{item}</option>
                ))}
              </select>
            </label>

            <label className="admin-filter-field">
              <span>Event / interest</span>
              <select
                value={selectedEvent}
                onChange={(event) => setSelectedEvent(event.target.value)}
              >
                <option value="">All events</option>
                {EVENTS.map((item) => (
                  <option value={item} key={item}>{item}</option>
                ))}
              </select>
            </label>

            <button
              className="admin-primary-button admin-search-button"
              type="submit"
            >
              Search
            </button>

            <button
              className="admin-reset-button"
              type="button"
              onClick={resetFilters}
            >
              Clear
            </button>
          </form>

          <div className="admin-table-meta">
            <span>
              {loadingRegistrations
                ? "Loading registrations..."
                : `Showing ${registrations.length} of ${count} matching records`}
            </span>
            {lastUpdated && <span>Updated at {lastUpdated}</span>}
          </div>

          <div className="admin-table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>College</th>
                  <th>Academic year</th>
                  <th>Event / interest</th>
                  <th>Additional interests</th>
                  <th>Submitted on</th>
                </tr>
              </thead>

              <tbody>
                {registrations.map((registration, index) => (
                  <tr
                    key={
                      registration._id ||
                      registration.id ||
                      `${registration.email}-${index}`
                    }
                  >
                    <td>
                      <div className="admin-student-cell">
                        <span className="admin-student-avatar">
                          {(registration.name || "?").trim().charAt(0).toUpperCase()}
                        </span>
                        <div>
                          <strong>{registration.name || "—"}</strong>
                          <span>{registration.email || "—"}</span>
                        </div>
                      </div>
                    </td>

                    <td>{registration.college || "—"}</td>

                    <td>
                      <span className="admin-year-badge">
                        {registration.year || "—"}
                      </span>
                    </td>

                    <td>
                      <span className="admin-event-badge">
                        {registration.event || "—"}
                      </span>
                    </td>

                    <td className="admin-interest-cell">
                      {registration.interest || "—"}
                    </td>

                    <td className="admin-date-cell">
                      {formatDate(registration.createdAt)}
                    </td>
                  </tr>
                ))}

                {!loadingRegistrations && registrations.length === 0 && (
                  <tr>
                    <td colSpan={6} className="admin-empty-state">
                      <span>⌕</span>
                      <strong>No registrations found</strong>
                      <p>Try another search or clear your filters.</p>
                    </td>
                  </tr>
                )}

                {loadingRegistrations && registrations.length === 0 && (
                  <tr>
                    <td colSpan={6} className="admin-empty-state">
                      Loading registration records...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <p className="admin-table-footnote">
            Records are loaded from the existing backend API. The server
            currently limits results to its configured maximum.
          </p>
        </section>

        <footer className="admin-footer">
          <span>© {new Date().getFullYear()} ACM Student Chapter</span>
          <a href="/">Return to public website ↗</a>
        </footer>
      </div>
    </main>
  );
}

export default AdminDashboard;
