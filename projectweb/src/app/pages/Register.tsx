import * as React from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../services/networkClient";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [username, setUsername] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await register(username.trim(), email.trim(), password);
      navigate("/home", { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Register failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F8FAFC", padding: "16px", fontFamily: "Inter, Arial, sans-serif" }}>
      <div style={{ maxWidth: "448px", margin: "0 auto", paddingTop: "48px" }}>
        <button onClick={() => navigate("/login")} style={linkButtonStyle}>
          Back to login
        </button>

        <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: "20px", padding: "24px", boxShadow: "0 12px 30px rgba(15, 23, 42, 0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "14px", backgroundColor: "#DCFCE7", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <UserPlus size={22} color="#15803D" />
            </div>
            <div>
              <h1 style={{ margin: 0, color: "#0F172A", fontSize: "26px", fontWeight: 700 }}>Register</h1>
              <p style={{ margin: "4px 0 0 0", color: "#64748B", fontSize: "14px" }}>Create a USER account.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <label style={labelStyle}>Username<input value={username} onChange={(event) => setUsername(event.target.value)} style={inputStyle} autoComplete="username" /></label>
            <label style={labelStyle}>Email<input value={email} onChange={(event) => setEmail(event.target.value)} style={inputStyle} autoComplete="email" /></label>
            <label style={labelStyle}>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} style={inputStyle} autoComplete="new-password" /></label>

            {error && <div style={{ border: "1px solid #FCA5A5", backgroundColor: "#FEF2F2", color: "#B91C1C", borderRadius: "12px", padding: "10px 12px", fontSize: "14px" }}>{error}</div>}

            <button type="submit" disabled={loading} style={{ height: "48px", border: "none", borderRadius: "14px", backgroundColor: "#15803D", color: "#FFFFFF", fontSize: "16px", fontWeight: 700, cursor: loading ? "default" : "pointer", opacity: loading ? 0.7 : 1 }}>
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const linkButtonStyle: React.CSSProperties = {
  border: "none",
  background: "transparent",
  color: "#334155",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: 600,
  marginBottom: "24px",
};

const labelStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "6px",
  color: "#111827",
  fontSize: "14px",
  fontWeight: 600,
};

const inputStyle: React.CSSProperties = {
  height: "46px",
  borderRadius: "12px",
  border: "1px solid #CBD5E1",
  padding: "0 12px",
  color: "#0F172A",
  fontSize: "16px",
  outline: "none",
  backgroundColor: "#FFFFFF",
};
