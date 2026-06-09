import * as React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LogIn, ShieldCheck, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../services/networkClient";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user } = useAuth();
  const [username, setUsername] = React.useState("admin");
  const [password, setPassword] = React.useState("admin123");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const from = (location.state as { from?: string } | null)?.from || "/home";

  React.useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [from, navigate, user]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(username.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Login failed");
      }
    } finally {
      setLoading(false);
    }
  }

  function useDemoAccount(nextUsername: string, nextPassword: string) {
    setUsername(nextUsername);
    setPassword(nextPassword);
    setError(null);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#F8FAFC",
        padding: "16px",
        fontFamily: "Inter, Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: "448px", margin: "0 auto", paddingTop: "48px" }}>
        <button
          onClick={() => navigate("/register")}
          style={{
            border: "none",
            background: "transparent",
            color: "#334155",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: 600,
            marginBottom: "24px",
          }}
        >
          Create account
        </button>

        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E5E7EB",
            borderRadius: "20px",
            padding: "24px",
            boxShadow: "0 12px 30px rgba(15, 23, 42, 0.08)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "14px",
                backgroundColor: "#DBEAFE",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <LogIn size={22} color="#2563EB" />
            </div>
            <div>
              <h1 style={{ margin: 0, color: "#0F172A", fontSize: "26px", fontWeight: 700 }}>
                Login
              </h1>
              <p style={{ margin: "4px 0 0 0", color: "#64748B", fontSize: "14px" }}>
                Use a seeded database account.
              </p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "20px" }}>
            <DemoButton
              icon={<ShieldCheck size={16} />}
              title="Admin"
              subtitle="Full access"
              active={username === "admin"}
              onClick={() => useDemoAccount("admin", "admin123")}
            />
            <DemoButton
              icon={<User size={16} />}
              title="User"
              subtitle="Restricted"
              active={username === "user"}
              onClick={() => useDemoAccount("user", "user123")}
            />
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <label style={{ display: "flex", flexDirection: "column", gap: "6px", color: "#111827", fontSize: "14px", fontWeight: 600 }}>
              Username
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                style={inputStyle}
                autoComplete="username"
              />
            </label>

            <label style={{ display: "flex", flexDirection: "column", gap: "6px", color: "#111827", fontSize: "14px", fontWeight: 600 }}>
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                style={inputStyle}
                autoComplete="current-password"
              />
            </label>

            {error && (
              <div style={{ border: "1px solid #FCA5A5", backgroundColor: "#FEF2F2", color: "#B91C1C", borderRadius: "12px", padding: "10px 12px", fontSize: "14px" }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                height: "48px",
                border: "none",
                borderRadius: "14px",
                backgroundColor: "#2563EB",
                color: "#FFFFFF",
                fontSize: "16px",
                fontWeight: 700,
                cursor: loading ? "default" : "pointer",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/recover-account")}
              style={{
                height: "42px",
                border: "1px solid #CBD5E1",
                borderRadius: "12px",
                backgroundColor: "#FFFFFF",
                color: "#0F172A",
                fontSize: "14px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Recover account
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

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

function DemoButton({
  icon,
  title,
  subtitle,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        border: active ? "1px solid #2563EB" : "1px solid #E5E7EB",
        borderRadius: "14px",
        backgroundColor: active ? "#EFF6FF" : "#FFFFFF",
        color: active ? "#1D4ED8" : "#334155",
        cursor: "pointer",
        padding: "12px",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        textAlign: "left",
      }}
    >
      {icon}
      <span>
        <span style={{ display: "block", fontWeight: 700, fontSize: "14px" }}>{title}</span>
        <span style={{ display: "block", fontSize: "12px", color: active ? "#2563EB" : "#64748B" }}>
          {subtitle}
        </span>
      </span>
    </button>
  );
}
