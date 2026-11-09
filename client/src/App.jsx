import { useEffect, useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate
} from "react-router-dom";
import Dashboard from "./Dashboard.jsx";
import "./App.css";

function DemoEntry() {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function openDemo() {
      try {
        const API_ROOT = (
          import.meta.env.VITE_API_URL || "http://localhost:5000"
        )
          .trim()
          .replace(/\/+$/, "")
          .replace(/\/api$/i, "");

        const response = await fetch(`${API_ROOT}/api/auth/demo`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          }
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to open demo.");
        }

        if (!data.token || !data.user) {
          throw new Error("Demo login information is missing.");
        }

        localStorage.setItem("portfolioToken", data.token);
        localStorage.setItem("portfolioUser", JSON.stringify(data.user));

        if (active) {
          navigate("/dashboard", { replace: true });
        }
      } catch (error) {
        if (active) {
          setError(error.message);
        }
      }
    }

    openDemo();

    return () => {
      active = false;
    };
  }, [navigate]);

  return (
    <div style={{
      minHeight: "100vh",
      display: "grid",
      placeItems: "center",
      background: "#080f1d",
      color: "white",
      fontFamily: "Arial",
      padding: "25px"
    }}>
      <div style={{ textAlign: "center" }}>
        <h2>PortfolioProof</h2>

        {error ? (
          <>
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>
              Try Again
            </button>
          </>
        ) : (
          <p>Opening your demo dashboard...</p>
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<DemoEntry />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="/register" element={<Navigate to="/" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
