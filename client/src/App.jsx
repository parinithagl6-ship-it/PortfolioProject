
import "./App.css";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import { Login, Register } from "./Auth.jsx";
import Dashboard from "./Dashboard.jsx";

const features = [
  {
    icon: "01",
    title: "Your Professional Profile",
    description: "Create a profile that introduces your education, experience and career goals."
  },
  {
    icon: "02",
    title: "Showcase Projects",
    description: "Present your real projects with descriptions, technologies and live links."
  },
  {
    icon: "03",
    title: "Highlight Your Skills",
    description: "Organize your technical and professional skills in one place."
  },
  {
    icon: "04",
    title: "Certificates & Achievements",
    description: "Display certificates and achievements as evidence of your work."
  },
  {
    icon: "05",
    title: "AI Portfolio Assistant",
    description: "Improve your portfolio descriptions with responsible AI assistance."
  },
  {
    icon: "06",
    title: "Share Your Portfolio",
    description: "Create a portfolio you can share with recruiters and employers."
  }
];

function Home() {
  return (
    <div className="app">
      <nav className="navbar">
        <a className="brand" href="#home">
          <span className="brand-icon">P</span>
          Portfolio<span>Proof</span>
        </a>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#features">Features</a>
          <a href="#about">About</a>
        </div>

        <div className="nav-actions">
          <Link className="login-link" to="/login">Log in</Link>
          <Link className="button button-small" to="/register">
            Get started
          </Link>
        </div>
      </nav>

      <main>
        <section className="hero" id="home">
          <div className="hero-content">
            <div className="eyebrow">
              <span className="live-dot"></span>
              YOUR CAREER. YOUR STORY. YOUR PROOF.
            </div>

            <h1>Your skills deserve<br />to be <span>seen.</span></h1>

            <p className="hero-description">
              Build a professional portfolio that brings your skills, projects
              and achievements together. Show the world what you can do.
            </p>

            <div className="hero-actions">
              <Link className="button" to="/register">
                Build your portfolio
              </Link>
              <a className="secondary-button" href="#features">
                Explore features
              </a>
            </div>

            <div className="trust-line">
              One place for everything you've achieved.
            </div>
          </div>

          <div className="preview-wrap">
            <div className="preview-glow"></div>

            <div className="preview-card">
              <div className="preview-top">
                <div className="window-dots"><i></i><i></i><i></i></div>
                <span>PORTFOLIO PREVIEW</span>
                <span className="preview-status">LIVE PREVIEW</span>
              </div>

              <div className="profile-preview">
                <div className="avatar">GL</div>
                <div>
                  <h3>Your Name</h3>
                  <p>Student Developer - Aspiring Engineer</p>
                </div>
              </div>

              <div className="preview-intro">
                <span className="mini-label">ABOUT ME</span>
                <p>
                  Passionate about building useful technology and turning
                  ideas into real-world projects.
                </p>
              </div>

              <div className="preview-stats">
                <div><strong>06</strong><span>Skills</span></div>
                <div><strong>04</strong><span>Projects</span></div>
                <div><strong>03</strong><span>Certificates</span></div>
              </div>

              <div className="preview-projects">
                <div className="mini-label">FEATURED PROJECTS</div>

                <div className="project-row">
                  <span className="project-icon">01</span>
                  <div><b>Project One</b><small>React - JavaScript</small></div>
                </div>

                <div className="project-row">
                  <span className="project-icon cyan">02</span>
                  <div><b>Project Two</b><small>Node.js - MongoDB</small></div>
                </div>
              </div>

              <div className="preview-footer">
                <span>PortfolioProof</span>
                <span>Made to be shared</span>
              </div>
            </div>

            <div className="floating-tag tag-one">
              Your work, verified by evidence
            </div>
            <div className="floating-tag tag-two">Ready to share</div>
          </div>
        </section>

        <section className="features-section" id="features">
          <div className="section-heading">
            <span className="section-label">EVERYTHING IN ONE PLACE</span>
            <h2>Make your work <span>speak.</span></h2>
            <p>
              Everything you need to present your professional journey
              with confidence.
            </p>
          </div>

          <div className="feature-grid">
            {features.map((feature) => (
              <article className="feature-card" key={feature.title}>
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="cta-section" id="get-started">
          <span className="section-label">
            YOUR NEXT OPPORTUNITY STARTS HERE
          </span>

          <h2>Don't just tell them.<br /><span>Show them.</span></h2>

          <p>Bring your skills and achievements together in one portfolio.</p>

          <Link className="button" to="/register">
            Get started for free
          </Link>

          <small>
            PortfolioProof - Your Skills, Your Work, Your Proof.
          </small>
        </section>
      </main>

      <footer id="about">
        <a className="brand" href="#home">
          <span className="brand-icon">P</span>
          Portfolio<span>Proof</span>
        </a>
        <p>Built to help talent get noticed.</p>
        <span>2026 PortfolioProof</span>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}

export default App;


