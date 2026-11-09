
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";

const API = "http://localhost:5000/api/auth";

function AuthForm({ isRegister }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();

    if (loading) return;

    setMessage("");
    setLoading(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();

      const response = await fetch(
        `${API}/${isRegister ? "register" : "login"}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(
            isRegister
              ? {
                  name: name.trim(),
                  email: normalizedEmail,
                  password
                }
              : {
                  email: normalizedEmail,
                  password
                }
          )
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Unable to complete your request.");
      }

      if (!data.token || !data.user) {
        throw new Error("Login response is incomplete. Please try again.");
      }

      localStorage.setItem("portfolioToken", data.token);
      localStorage.setItem("portfolioUser", JSON.stringify(data.user));

      // Navigate to dashboard after successful authentication.
      navigate("/dashboard", { replace: true });

    } catch (error) {
      console.error("Authentication error:", error);

      setMessage(
        error.message === "Failed to fetch"
          ? "Cannot connect to the server. Make sure your backend is running on port 5000."
          : error.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">

        <Link to="/" className="auth-brand">
          P Portfolio<span>Proof</span>
        </Link>

        <h1>
          {isRegister ? "Create your account" : "Welcome back"}
        </h1>

        <p>
          {isRegister
            ? "Start showcasing your skills and projects."
            : "Log in to continue building your portfolio."}
        </p>

        <form onSubmit={handleSubmit}>

          {isRegister && (
            <>
              <label htmlFor="name">Full name</label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </>
          )}

          <label htmlFor="email">Email address</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={
              isRegister ? "new-password" : "current-password"
            }
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            minLength={8}
            required
          />

          <button type="submit" disabled={loading}>
            {loading
              ? "Please wait..."
              : isRegister
                ? "Create account"
                : "Log in"}
          </button>

        </form>

        {message && (
          <p role="alert" className="auth-message">
            {message}
          </p>
        )}

        <p className="auth-switch">
          {isRegister
            ? "Already have an account? "
            : "Don't have an account? "}

          <Link to={isRegister ? "/login" : "/register"}>
            {isRegister ? "Log in" : "Create account"}
          </Link>
        </p>

        <Link to="/" className="back-home">
          Back to home
        </Link>

      </div>
    </div>
  );
}

export function Login() {
  return <AuthForm isRegister={false} />;
}

export function Register() {
  return <AuthForm isRegister={true} />;
}

