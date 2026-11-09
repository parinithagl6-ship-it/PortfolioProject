
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
)
  .trim()
  .replace(/\/+$/, "")
  .replace(/\/api$/i, "");

const input = {
  display: "block",
  width: "100%",
  boxSizing: "border-box",
  padding: "12px",
  margin: "8px 0 16px",
  background: "#0b1423",
  color: "white",
  border: "1px solid #34445b",
  borderRadius: "8px"
};

const btn = {
  padding: "11px 18px",
  background: "#06b6d4",
  color: "#06111d",
  border: 0,
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold"
};

const card = {
  background: "#111c2e",
  border: "1px solid #26364c",
  borderRadius: "12px",
  padding: "20px",
  marginBottom: "16px"
};

const emptyProject = {
  title: "",
  description: "",
  technologies: "",
  github: "",
  live: ""
};

const emptyCertificate = {
  title: "",
  issuer: "",
  date: "",
  link: ""
};

const profileFields = [
  "name",
  "headline",
  "phone",
  "location",
  "github",
  "linkedin",
  "portfolio"
];

function Field({
  label,
  value,
  onChange,
  type = "text",
  readOnly = false
}) {
  return (
    <label style={{ display: "block", marginTop: "12px" }}>
      {label}
      <input
        style={{ ...input, opacity: readOnly ? 0.7 : 1 }}
        type={type}
        value={value ?? ""}
        readOnly={readOnly}
        onChange={(e) => onChange?.(e.target.value)}
      />
    </label>
  );
}

async function readResponse(response) {
  const text = await response.text();

  let data = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(
      `Server returned an invalid response (${response.status}).`
    );
  }

  if (!response.ok) {
    throw new Error(
      data.message || data.error || `Request failed (${response.status})`
    );
  }

  return data;
}

function getProfile(data) {
  let result = data;

  for (let i = 0; i < 3; i++) {
    if (result?.user) {
      result = result.user;
    } else if (result?.profile) {
      result = result.profile;
    } else if (result?.data) {
      result = result.data;
    } else {
      break;
    }
  }

  return result || {};
}

function getPortfolio(data, fallback = {}) {
  const result = data.portfolio || data.data || data;

  return {
    skills: Array.isArray(result.skills)
      ? result.skills
      : fallback.skills || [],

    projects: Array.isArray(result.projects)
      ? result.projects
      : fallback.projects || [],

    certificates: Array.isArray(result.certificates)
      ? result.certificates
      : fallback.certificates || []
  };
}

function safeUrl(value) {
  if (!value?.trim()) return "";

  const url = value.trim();

  if (/^https?:\/\//i.test(url)) return url;

  return `https://${url}`;
}

export default function Dashboard() {
  const navigate = useNavigate();

  const [token, setToken] = useState(
    () => localStorage.getItem("portfolioToken")
  );

  const [tab, setTab] = useState("Profile");
  const [message, setMessage] = useState("Loading...");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [isEditingProfile, setIsEditingProfile] = useState(true);

  const [profile, setProfile] = useState({});
  const [savedProfileSnapshot, setSavedProfileSnapshot] = useState({});

  const [skills, setSkills] = useState([]);
  const [projects, setProjects] = useState([]);
  const [certificates, setCertificates] = useState([]);

  const [skill, setSkill] = useState("");
  const [level, setLevel] = useState("Beginner");

  const [project, setProject] = useState(emptyProject);
  const [certificate, setCertificate] = useState(emptyCertificate);

  const [viewingProject, setViewingProject] = useState(null);

  // Load profile and portfolio.
  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    let active = true;

    async function loadDashboard() {
      setLoading(true);
      setMessage("Loading your saved information...");

      try {
        const headers = {
          Authorization: `Bearer ${token}`
        };

        const [profileResponse, portfolioResponse] = await Promise.all([
          fetch(`${API}/api/profile`, { headers }),
          fetch(`${API}/api/portfolio`, { headers })
        ]);

        const [profileData, portfolioData] = await Promise.all([
          readResponse(profileResponse),
          readResponse(portfolioResponse)
        ]);

        if (!active) return;

        const loadedProfile = getProfile(profileData);

        setProfile(loadedProfile);
        setSavedProfileSnapshot(loadedProfile);

        const hasSavedProfile =
          profileFields.some(
            (field) =>
              field !== "name" &&
              String(loadedProfile[field] ?? "").trim()
          ) || String(loadedProfile.bio ?? "").trim();

        setIsEditingProfile(!hasSavedProfile);

        const portfolio = getPortfolio(portfolioData);

        setSkills(portfolio.skills);
        setProjects(portfolio.projects);
        setCertificates(portfolio.certificates);

        setMessage("");
      } catch (error) {
        if (active) {
          setMessage(`Could not load dashboard: ${error.message}`);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, [token, navigate]);

  // Save skills, projects and certificates.
  async function savePortfolio(
    nextSkills,
    nextProjects,
    nextCertificates
  ) {
    if (saving || !token) return false;

    setSaving(true);
    setMessage("Saving changes...");

    try {
      const response = await fetch(`${API}/api/portfolio`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          skills: nextSkills,
          projects: nextProjects,
          certificates: nextCertificates
        })
      });

      const data = await readResponse(response);

      const saved = getPortfolio(data, {
        skills: nextSkills,
        projects: nextProjects,
        certificates: nextCertificates
      });

      setSkills(saved.skills);
      setProjects(saved.projects);
      setCertificates(saved.certificates);

      setMessage("Your changes have been saved successfully!");

      return true;
    } catch (error) {
      console.error("PORTFOLIO SAVE ERROR:", error);
      setMessage(`Save failed: ${error.message}`);

      return false;
    } finally {
      setSaving(false);
    }
  }

  // Save and verify profile.
  async function saveProfile(event) {
    event.preventDefault();

    if (saving) return;

    if (!token) {
      setMessage("Your session has expired. Please log in again.");
      navigate("/login", { replace: true });
      return;
    }

    setSaving(true);
    setMessage("Saving your profile...");

    try {
      const profileData = {};

      profileFields.forEach((field) => {
        profileData[field] = String(profile[field] ?? "").trim();
      });

      profileData.bio = String(profile.bio ?? "").trim();

      const saveResponse = await fetch(`${API}/api/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });

      await readResponse(saveResponse);

      // Verify the saved profile.
      const verifyResponse = await fetch(`${API}/api/profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const verifyData = await readResponse(verifyResponse);
      const savedProfile = getProfile(verifyData);

      const fieldsToCheck = [
        ...profileFields,
        "bio"
      ];

      const failedFields = fieldsToCheck.filter((field) => {
        const savedValue = String(savedProfile[field] ?? "").trim();
        const submittedValue = profileData[field];

        return savedValue !== submittedValue;
      });

      if (failedFields.length > 0) {
        throw new Error(
          `The database did not return the updated values for: ${failedFields.join(", ")}. Check your backend profile controller.`
        );
      }

      setProfile(savedProfile);
      setSavedProfileSnapshot(savedProfile);
      setIsEditingProfile(false);

      setMessage("Profile saved and verified successfully!");

    } catch (error) {
      console.error("PROFILE SAVE ERROR:", error);
      setMessage(`Profile save failed: ${error.message}`);
    } finally {
      setSaving(false);
    }
  }

  // Cancel profile editing and discard unsaved changes.
  function cancelProfileEdit() {
    setProfile(savedProfileSnapshot);
    setIsEditingProfile(false);
    setMessage("");
  }

  // Add skill.
  async function addSkill(event) {
    event.preventDefault();

    if (!skill.trim()) {
      setMessage("Please enter a skill name.");
      return;
    }

    const success = await savePortfolio(
      [...skills, { name: skill.trim(), level }],
      projects,
      certificates
    );

    if (success) setSkill("");
  }

  // Delete skill.
  async function deleteSkill(index) {
    await savePortfolio(
      skills.filter((_, i) => i !== index),
      projects,
      certificates
    );
  }

  // Add project.
  async function addProject(event) {
    event.preventDefault();

    if (!project.title.trim()) {
      setMessage("Please enter a project title.");
      return;
    }

    const success = await savePortfolio(
      skills,
      [...projects, { ...project, title: project.title.trim() }],
      certificates
    );

    if (success) setProject(emptyProject);
  }

  // Delete project.
  async function deleteProject(index) {
    const success = await savePortfolio(
      skills,
      projects.filter((_, i) => i !== index),
      certificates
    );

    if (success) setViewingProject(null);
  }

  // Add certificate.
  async function addCertificate(event) {
    event.preventDefault();

    if (!certificate.title.trim()) {
      setMessage("Please enter a certificate title.");
      return;
    }

    const success = await savePortfolio(
      skills,
      projects,
      [
        ...certificates,
        { ...certificate, title: certificate.title.trim() }
      ]
    );

    if (success) setCertificate(emptyCertificate);
  }

  // Delete certificate.
  async function deleteCertificate(index) {
    await savePortfolio(
      skills,
      projects,
      certificates.filter((_, i) => i !== index)
    );
  }

  // Logout.
  function logout() {
    localStorage.removeItem("portfolioToken");
    localStorage.removeItem("portfolioUser");

    setToken(null);

    navigate("/login", { replace: true });
  }

  if (!token) return null;

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#080f1d",
          color: "white",
          padding: "40px",
          fontFamily: "Arial"
        }}
      >
        {message}
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#080f1d",
        color: "white",
        padding: "25px",
        fontFamily: "Arial"
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap"
        }}
      >
        <h2>
          Portfolio<span style={{ color: "#06b6d4" }}>Proof</span>
        </h2>

        <button type="button" style={btn} onClick={logout}>
          Log out
        </button>
      </header>

      <main style={{ maxWidth: "950px", margin: "35px auto" }}>
        <p style={{ color: "#06b6d4" }}>
          YOUR PERSONAL WORKSPACE
        </p>

        <h1>Welcome, {profile.name || "Student"}!</h1>

        <p style={{ color: "#a8b5c7" }}>
          Manage your profile, skills, projects and certificates.
        </p>

        <nav
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
            margin: "25px 0"
          }}
        >
          {["Profile", "Skills", "Projects", "Certificates"].map((item) => (
            <button
              key={item}
              type="button"
              style={{
                ...btn,
                background: tab === item ? "#06b6d4" : "#26364c",
                color: "white"
              }}
              onClick={() => {
                setTab(item);
                setMessage("");
              }}
            >
              {item}
            </button>
          ))}
        </nav>

        {message && (
          <p
            role="status"
            style={{
              color:
                message.toLowerCase().includes("failed") ||
                message.toLowerCase().includes("could not")
                  ? "#ff7777"
                  : "#22d3ee",
              padding: "10px",
              background: "#111c2e",
              borderRadius: "8px"
            }}
          >
            {message}
          </p>
        )}

        {/* PROFILE */}
        {tab === "Profile" && (
          <section style={card}>
            <h2>My Profile</h2>

            {!isEditingProfile ? (
              <div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "14px"
                  }}
                >
                  {[
                    ["Full name", profile.name],
                    ["Registered email", profile.email],
                    ["Headline", profile.headline],
                    ["Phone", profile.phone],
                    ["Location", profile.location],
                    ["GitHub", profile.github],
                    ["LinkedIn", profile.linkedin],
                    ["Portfolio", profile.portfolio],
                    ["About me", profile.bio]
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      style={{
                        padding: "14px",
                        background: "#0b1423",
                        border: "1px solid #26364c",
                        borderRadius: "8px",
                        overflowWrap: "anywhere"
                      }}
                    >
                      <div
                        style={{
                          color: "#94a3b8",
                          fontSize: "13px",
                          marginBottom: "7px"
                        }}
                      >
                        {label}
                      </div>

                      <div style={{ color: "#ffffff" }}>
                        {value || "Not added"}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  style={{ ...btn, marginTop: "20px" }}
                  onClick={() => {
                    setIsEditingProfile(true);
                    setMessage("");
                  }}
                >
                  Edit Profile
                </button>
              </div>
            ) : (
              <form onSubmit={saveProfile}>
                <Field
                  label="Full name"
                  value={profile.name}
                  onChange={(value) =>
                    setProfile((p) => ({ ...p, name: value }))
                  }
                />

                <Field
                  label="Registered email (read-only)"
                  value={profile.email}
                  readOnly
                />

                {profileFields
                  .filter((key) => key !== "name")
                  .map((key) => (
                    <Field
                      key={key}
                      label={key.charAt(0).toUpperCase() + key.slice(1)}
                      value={profile[key]}
                      onChange={(value) =>
                        setProfile((p) => ({ ...p, [key]: value }))
                      }
                    />
                  ))}

                <label style={{ display: "block", marginTop: "12px" }}>
                  About me

                  <textarea
                    style={{ ...input, minHeight: "110px" }}
                    value={profile.bio || ""}
                    onChange={(event) =>
                      setProfile((p) => ({
                        ...p,
                        bio: event.target.value
                      }))
                    }
                  />
                </label>

                <button
                  type="submit"
                  style={{
                    ...btn,
                    opacity: saving ? 0.6 : 1
                  }}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Profile"}
                </button>

                <button
                  type="button"
                  style={{
                    ...btn,
                    marginLeft: "10px",
                    background: "#475569",
                    color: "white"
                  }}
                  onClick={cancelProfileEdit}
                  disabled={saving}
                >
                  Cancel
                </button>
              </form>
            )}
          </section>
        )}

        {/* SKILLS */}
        {tab === "Skills" && (
          <section style={card}>
            <h2>My Skills</h2>

            <form onSubmit={addSkill}>
              <Field
                label="Skill name"
                value={skill}
                onChange={setSkill}
              />

              <label>
                Skill level

                <select
                  style={input}
                  value={level}
                  onChange={(event) => setLevel(event.target.value)}
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </label>

              <button type="submit" style={btn} disabled={saving}>
                {saving ? "Saving..." : "Add Skill"}
              </button>
            </form>

            <h3>Your saved skills ({skills.length})</h3>

            {skills.map((item, index) => (
              <div key={item._id || index} style={card}>
                <b>{item.name}</b> — {item.level}

                <button
                  type="button"
                  disabled={saving}
                  style={{
                    ...btn,
                    background: "#dc4444",
                    color: "white",
                    float: "right"
                  }}
                  onClick={() => deleteSkill(index)}
                >
                  Delete
                </button>

                <div style={{ clear: "both" }} />
              </div>
            ))}

            {skills.length === 0 && <p>No skills added yet.</p>}
          </section>
        )}

        {/* PROJECTS */}
        {tab === "Projects" && (
          <section style={card}>
            <h2>My Projects</h2>

            <form onSubmit={addProject}>
              {Object.keys(emptyProject).map((key) => (
                <Field
                  key={key}
                  label={key.charAt(0).toUpperCase() + key.slice(1)}
                  value={project[key]}
                  onChange={(value) =>
                    setProject((p) => ({ ...p, [key]: value }))
                  }
                />
              ))}

              <button type="submit" style={btn} disabled={saving}>
                {saving ? "Saving..." : "Add Project"}
              </button>
            </form>

            <h3>Your saved projects ({projects.length})</h3>

            {projects.map((item, index) => (
              <article key={item._id || index} style={card}>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <p>Technologies: {item.technologies}</p>

                <button
                  type="button"
                  style={btn}
                  onClick={() =>
                    setViewingProject(
                      viewingProject === index ? null : index
                    )
                  }
                >
                  {viewingProject === index ? "Hide Details" : "View Details"}
                </button>

                {viewingProject === index && (
                  <div
                    style={{
                      marginTop: "15px",
                      padding: "15px",
                      background: "#0b1423",
                      borderRadius: "8px"
                    }}
                  >
                    <h4>Project Information</h4>

                    <p>
                      <b>Title:</b> {item.title}
                    </p>

                    <p>
                      <b>Description:</b>{" "}
                      {item.description || "Not provided"}
                    </p>

                    <p>
                      <b>Technologies:</b>{" "}
                      {item.technologies || "Not provided"}
                    </p>

                    {item.github && (
                      <p>
                        <a
                          href={safeUrl(item.github)}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "#22d3ee" }}
                        >
                          View GitHub Repository
                        </a>
                      </p>
                    )}

                    {item.live && (
                      <p>
                        <a
                          href={safeUrl(item.live)}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "#22d3ee" }}
                        >
                          View Live Website
                        </a>
                      </p>
                    )}
                  </div>
                )}

                <button
                  type="button"
                  disabled={saving}
                  style={{
                    ...btn,
                    background: "#dc4444",
                    color: "white",
                    marginTop: "12px"
                  }}
                  onClick={() => deleteProject(index)}
                >
                  Delete Project
                </button>
              </article>
            ))}

            {projects.length === 0 && <p>No projects added yet.</p>}
          </section>
        )}

        {/* CERTIFICATES */}
        {tab === "Certificates" && (
          <section style={card}>
            <h2>My Certificates</h2>

            <form onSubmit={addCertificate}>
              {Object.keys(emptyCertificate).map((key) => (
                <Field
                  key={key}
                  label={key.charAt(0).toUpperCase() + key.slice(1)}
                  value={certificate[key]}
                  onChange={(value) =>
                    setCertificate((p) => ({ ...p, [key]: value }))
                  }
                  type={key === "date" ? "date" : "text"}
                />
              ))}

              <button type="submit" style={btn} disabled={saving}>
                {saving ? "Saving..." : "Add Certificate"}
              </button>
            </form>

            <h3>Your saved certificates ({certificates.length})</h3>

            {certificates.map((item, index) => (
              <div key={item._id || index} style={card}>
                <h3>{item.title}</h3>

                <p>Issuer: {item.issuer || "Not provided"}</p>
                <p>Date: {item.date || "Not provided"}</p>

                {item.link && (
                  <p>
                    <a
                      href={safeUrl(item.link)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#22d3ee" }}
                    >
                      View Certificate
                    </a>
                  </p>
                )}

                <button
                  type="button"
                  disabled={saving}
                  style={{
                    ...btn,
                    background: "#dc4444",
                    color: "white"
                  }}
                  onClick={() => deleteCertificate(index)}
                >
                  Delete Certificate
                </button>
              </div>
            ))}

            {certificates.length === 0 && (
              <p>No certificates added yet.</p>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
