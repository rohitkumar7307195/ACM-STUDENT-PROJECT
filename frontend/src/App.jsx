
import { useState } from "react";
import "./App.css";
import AdminDashboard from "./AdminDashboard";

const API_URL = "http://localhost:5000/api/registrations";

const activities = [
  {
    number: "01",
    icon: "⌘",
    title: "Coding & DSA",
    description:
      "Practice problem-solving, data structures and algorithms through coding sessions and friendly competitions.",
    tag: "TECHNICAL",
  },
  {
    number: "02",
    icon: "⚡",
    title: "Hackathons",
    description:
      "Collaborate with peers, turn ideas into working prototypes and solve real-world problems.",
    tag: "INNOVATION",
  },
  {
    number: "03",
    icon: "◎",
    title: "Workshops",
    description:
      "Learn web development, AI, cloud computing and other emerging technologies from experienced mentors.",
    tag: "LEARNING",
  },
  {
    number: "04",
    icon: "↗",
    title: "Community",
    description:
      "Build connections, share knowledge, mentor fellow students and grow together as developers.",
    tag: "NETWORKING",
  },
];

const team = [
  { initials: "FC", role: "Faculty Coordinator", name: "Faculty Coordinator" },
  { initials: "CH", role: "Chapter Leadership", name: "Chapter Head" },
  { initials: "EV", role: "Events & Operations", name: "Events Team" },
  { initials: "TC", role: "Technical Community", name: "Technical Team" },
];

const initialForm = {
  name: "",
  email: "",
  college: "ABES Engineering College",
  year: "",
  event: "Web Dev Kickstart",
  interest: "",
};

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState({ type: "", text: "" });
  const [form, setForm] = useState(initialForm);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setNotice({ type: "", text: "" });

    if (loading) return;

    setLoading(true);

    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        college: form.college.trim(),
        year: form.year,
        event: form.event,
        interest: form.interest.trim(),
      };

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      let result;

      try {
        result = await response.json();
      } catch {
        throw new Error(
          "The server returned an invalid response. Please check the backend."
        );
      }

      if (!response.ok || result.success !== true) {
        const validationErrors = Array.isArray(result.errors)
          ? result.errors.join(" ")
          : "";

        throw new Error(
          validationErrors ||
            result.message ||
            "Registration failed. Please try again."
        );
      }

      setNotice({
        type: "success",
        text:
          result.message ||
          "Registration submitted successfully! We look forward to seeing you.",
      });

      setForm({ ...initialForm });
    } catch (error) {
      console.error("Registration submission error:", error);

      setNotice({
        type: "error",
        text:
          error instanceof TypeError
            ? "Cannot connect to the backend. Make sure your server is running on port 5000."
            : error.message ||
              "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  // Admin dashboard route
  if (window.location.pathname === "/admin") {
    return <AdminDashboard />;
  }

  return (
    <div className="site-shell">
      <header className="navbar">
        <a className="brand" href="#home" aria-label="ACM Chapter home">
          <span className="brand-mark">ACM</span>
          <span className="brand-copy">
            <strong>STUDENT CHAPTER</strong>
            <small>ABES ENGINEERING COLLEGE</small>
          </span>
        </a>

        <button
          className="menu-toggle"
          type="button"
          onClick={() => setMenuOpen((previous) => !previous)}
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
        >
          {menuOpen ? "✕" : "☰"}
        </button>

        <nav className={menuOpen ? "nav-links open" : "nav-links"}>
          {[
            ["About", "#about"],
            ["Activities", "#activities"],
            ["Our Team", "#team"],
            ["Events", "#events"],
          ].map(([label, href]) => (
            <a
              key={label}
              href={href}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </a>
          ))}

          <a
            className="nav-cta"
            href="#register"
            onClick={() => setMenuOpen(false)}
          >
            Join the Chapter <span>↗</span>
          </a>
        </nav>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-glow glow-one" />
          <div className="hero-glow glow-two" />

          <div className="hero-content">
            <div className="eyebrow">
              <span className="live-dot" />
              BUILD. LEARN. INNOVATE.
            </div>

            <h1>
              Your ideas
              <br />
              <span>belong here.</span>
            </h1>

            <p className="hero-description">
              A community of curious minds, ambitious builders and future
              technologists. Learn together, create together, and make an
              impact through technology.
            </p>

            <div className="hero-actions">
              <a className="button button-primary" href="#register">
                Become a Member <span>↗</span>
              </a>

              <a className="button button-secondary" href="#about">
                Explore Our Chapter <span>↓</span>
              </a>
            </div>

            <div className="hero-note">
              <span className="note-symbol">✳</span>
              <span>
                <strong>For students, by students.</strong>
                <small>Curiosity is all you need to get started.</small>
              </span>
            </div>
          </div>

          <div
            className="hero-art"
            aria-label="Technology and coding illustration"
          >
            <div className="orbit orbit-outer" />
            <div className="orbit orbit-inner" />

            <div className="art-center">
              <span className="art-bracket">&lt;</span>
              <span className="art-slash">/</span>
              <span className="art-bracket">&gt;</span>
            </div>

            <div className="float-card card-code">
              <span className="card-icon purple">&lt;/&gt;</span>
              <span>
                <strong>Build things</strong>
                <small>One line at a time</small>
              </span>
            </div>

            <div className="float-card card-idea">
              <span className="card-icon green">✳</span>
              <span>
                <strong>Think bigger</strong>
                <small>Ideas into impact</small>
              </span>
            </div>

            <div className="art-caption">
              IDEAS → EXPERIMENTS → IMPACT
            </div>
          </div>

          <a className="scroll-cue" href="#about">
            <span /> SCROLL TO EXPLORE
          </a>
        </section>

        <section className="intro-strip" id="about">
          <div>
            <span className="section-kicker">WHO WE ARE</span>
            <h2>
              Technology is better
              <br />
              <span>when we build together.</span>
            </h2>
          </div>

          <p>
            The ACM Student Chapter at ABES Engineering College is a student
            community focused on computing, collaboration and continuous
            learning. Our goal is to help students explore technology beyond
            the classroom and turn curiosity into practical skills.
          </p>
        </section>

        <section className="mission-section section-pad">
          <div className="section-heading">
            <span className="section-kicker">OUR PURPOSE</span>
            <h2>
              Learn with purpose.
              <br />
              <span>Build with confidence.</span>
            </h2>
          </div>

          <div className="mission-grid">
            <article className="mission-card mission-main">
              <span className="mission-number">01 / MISSION</span>
              <div className="mission-icon">◎</div>
              <h3>Make computing accessible.</h3>
              <p>
                Create opportunities for students to learn computer science,
                explore emerging technologies and develop skills through
                practical experience.
              </p>
            </article>

            <article className="mission-card">
              <span className="mission-number">02 / VISION</span>
              <div className="mission-icon">↗</div>
              <h3>Inspire the next generation.</h3>
              <p>
                Encourage innovation, responsible technology and a culture
                where students confidently share and develop ideas.
              </p>
            </article>

            <article className="mission-card">
              <span className="mission-number">03 / VALUES</span>
              <div className="mission-icon">✳</div>
              <h3>Grow through community.</h3>
              <p>
                Support collaboration, peer learning, inclusion and knowledge
                sharing so every member can keep improving.
              </p>
            </article>
          </div>
        </section>

        <section
          className="activities-section section-pad"
          id="activities"
        >
          <div className="section-heading heading-row">
            <div>
              <span className="section-kicker">WHAT WE DO</span>
              <h2>
                Learn by doing.
                <br />
                <span>Grow by sharing.</span>
              </h2>
            </div>

            <p>
              From first steps in programming to building ambitious projects,
              find your space to experiment and grow.
            </p>
          </div>

          <div className="activity-grid">
            {activities.map((activity) => (
              <article className="activity-card" key={activity.number}>
                <div className="activity-top">
                  <span className="activity-number">
                    {activity.number}
                  </span>
                  <span className="activity-icon">
                    {activity.icon}
                  </span>
                </div>

                <span className="activity-tag">{activity.tag}</span>
                <h3>{activity.title}</h3>
                <p>{activity.description}</p>

                <a href="#register" className="text-link">
                  Get involved <span>↗</span>
                </a>
              </article>
            ))}
          </div>
        </section>

        <section className="events-section section-pad" id="events">
          <div className="section-heading heading-row">
            <div>
              <span className="section-kicker">SAVE YOUR SPOT</span>
              <h2>
                What's happening
                <br />
                <span>in our community.</span>
              </h2>
            </div>

            <a className="text-link event-link" href="#register">
              Register for an event <span>↗</span>
            </a>
          </div>

          <article className="event-card">
            <div className="event-visual">
              <span className="event-visual-label">
                ACM / COMMUNITY EVENT
              </span>

              <div className="event-visual-art">
                <span>&lt;</span>
                <span className="event-slash">/</span>
                <span>&gt;</span>
              </div>

              <span className="event-visual-bottom">
                LEARN SOMETHING NEW.
              </span>
            </div>

            <div className="event-details">
              <div className="event-badges">
                <span className="event-badge">TECHNICAL SESSION</span>
                <span className="event-status">Registration open</span>
              </div>

              <h3>Web Dev Kickstart</h3>

              <p>
                Take your first step into web development. Explore the
                fundamentals, discover how websites work and connect with
                students who love building for the web.
              </p>

              <div className="event-meta">
                <div>
                  <span className="meta-icon">◷</span>
                  <span>
                    <small>DATE</small>
                    <strong>To be announced</strong>
                  </span>
                </div>

                <div>
                  <span className="meta-icon">⌖</span>
                  <span>
                    <small>VENUE</small>
                    <strong>To be announced</strong>
                  </span>
                </div>
              </div>

              <a href="#register" className="button button-primary">
                Register Interest <span>↗</span>
              </a>

              <p className="event-disclaimer">
                Event date and venue will be announced by the chapter team.
              </p>
            </div>
          </article>
        </section>

        <section className="team-section section-pad" id="team">
          <div className="section-heading heading-row">
            <div>
              <span className="section-kicker">THE PEOPLE BEHIND IT</span>
              <h2>
                A community
                <br />
                <span>powered by people.</span>
              </h2>
            </div>

            <p>
              Great communities are built by people who show up, share
              knowledge and help others succeed.
            </p>
          </div>

          <div className="team-grid">
            {team.map((member, index) => (
              <article className="team-card" key={member.role}>
                <div className={`team-avatar avatar-${index + 1}`}>
                  {member.initials}
                </div>

                <span className="team-role">{member.role}</span>
                <h3>{member.name}</h3>

                <p>
                  {index === 0
                    ? "Guidance and academic support"
                    : index === 1
                      ? "Chapter coordination and leadership"
                      : index === 2
                        ? "Events, planning and community activities"
                        : "Technical learning and project collaboration"}
                </p>
              </article>
            ))}
          </div>

          <p className="team-note">
            Replace these role-based placeholders with your actual chapter
            members' names and approved photos.
          </p>
        </section>

        <section className="register-section section-pad" id="register">
          <div className="register-copy">
            <span className="section-kicker">03 — YOUR NEXT CHAPTER</span>

            <h2>
              Your ideas
              <br />
              <span>belong here.</span>
            </h2>

            <p>
              Take the first step. Register your interest and become part of a
              community that learns, creates and grows together.
            </p>

            <div className="register-perks">
              <div><span>✓</span> Learn new technical skills</div>
              <div><span>✓</span> Meet like-minded students</div>
              <div><span>✓</span> Explore events and projects</div>
            </div>

            <div className="register-note">
              <span>✳</span>
              <p>
                <strong>Start where you are.</strong>
                <br />
                <small>Bring your curiosity. We'll build from there.</small>
              </p>
            </div>
          </div>

          <form className="registration-form" onSubmit={handleSubmit}>
            <div className="form-heading">
              <span className="section-kicker">ACM STUDENT CHAPTER</span>
              <h3>Register your interest</h3>
              <p>Fill in your details below to get started.</p>
            </div>

            {notice.text && (
              <div
                className={`form-notice ${notice.type}`}
                role="status"
                aria-live="polite"
              >
                {notice.text}
              </div>
            )}

            <div className="form-grid">
              <label className="field full-field">
                Full name <span>*</span>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={form.name}
                  onChange={handleChange}
                  minLength={2}
                  maxLength={100}
                  autoComplete="name"
                  required
                />
              </label>

              <label className="field full-field">
                Email address <span>*</span>
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  maxLength={254}
                  autoComplete="email"
                  required
                />
              </label>

              <label className="field full-field">
                College / Institution <span>*</span>
                <input
                  type="text"
                  name="college"
                  placeholder="Enter your college"
                  value={form.college}
                  onChange={handleChange}
                  maxLength={150}
                  required
                />
              </label>

              <label className="field">
                Academic year <span>*</span>
                <select
                  name="year"
                  value={form.year}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select year</option>
                  <option value="1st year">1st year</option>
                  <option value="2nd year">2nd year</option>
                  <option value="3rd year">3rd year</option>
                  <option value="4th year">4th year</option>
                  <option value="Other">Other</option>
                </select>
              </label>

              <label className="field">
                Interested in <span>*</span>
                <select
                  name="event"
                  value={form.event}
                  onChange={handleChange}
                  required
                >
                  <option value="Web Dev Kickstart">
                    Web Dev Kickstart
                  </option>
                  <option value="CodeSprint Challenge">
                    CodeSprint Challenge
                  </option>
                  <option value="TechTalk & Connect">
                    TechTalk &amp; Connect
                  </option>
                  <option value="General chapter membership">
                    General chapter membership
                  </option>
                </select>
              </label>

              <label className="field full-field">
                Your interests <span className="optional">(optional)</span>
                <textarea
                  name="interest"
                  placeholder="Tell us what you would like to learn or build..."
                  rows={3}
                  maxLength={1000}
                  value={form.interest}
                  onChange={handleChange}
                />
              </label>
            </div>

            <button
              type="submit"
              className="button button-primary submit-button"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Registration"}
              {!loading && <span>↗</span>}
            </button>

            <p className="form-footnote">
              Your details will be submitted to the ACM Chapter registration
              system.
            </p>
          </form>
        </section>

        <section className="closing-cta">
          <span className="section-kicker">
            YOUR NEXT CHAPTER STARTS HERE
          </span>

          <h2>
            Think it. Build it.
            <br />
            <span>Share it.</span>
          </h2>

          <a href="#register" className="button button-primary">
            Join Our Community <span>↗</span>
          </a>
        </section>
      </main>

      <footer className="footer">
        <a className="brand footer-brand" href="#home">
          <span className="brand-mark">ACM</span>
          <span className="brand-copy">
            <strong>STUDENT CHAPTER</strong>
            <small>ABES ENGINEERING COLLEGE</small>
          </span>
        </a>

        <p>Built for curious minds and future innovators.</p>
        <a href="#home" className="back-top">Back to top ↑</a>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} ACM Student Chapter</span>
          <span>Learn · Create · Collaborate</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
