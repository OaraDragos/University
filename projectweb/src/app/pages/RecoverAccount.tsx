import * as React from "react";
import { useNavigate } from "react-router-dom";
import { KeyRound, Mail } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { requestLoginCode, requestPasswordRecovery, resetPassword } from "../services/authApi";
import { ApiError } from "../services/networkClient";

export default function RecoverAccount() {
  const navigate = useNavigate();
  const { loginWithCode } = useAuth();

  const [identifier, setIdentifier] = React.useState("");
  const [loginCode, setLoginCode] = React.useState("");
  const [recoveryEmail, setRecoveryEmail] = React.useState("");
  const [recoveryCode, setRecoveryCode] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [info, setInfo] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function handleRequestLoginCode(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setInfo(null);

    try {
      const response = await requestLoginCode(identifier.trim());
      setInfo(`Login code: ${response.code} (valid until ${new Date(response.expiresAt).toLocaleTimeString()})`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not generate login code");
    }
  }

  async function handleLoginWithCode(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setInfo(null);

    try {
      await loginWithCode(identifier.trim(), loginCode.trim());
      navigate("/home", { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not login with code");
    }
  }

  async function handleRequestRecovery(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setInfo(null);

    try {
      const response = await requestPasswordRecovery(recoveryEmail.trim());
      setInfo(`Recovery code: ${response.code} (valid until ${new Date(response.expiresAt).toLocaleTimeString()})`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not request password recovery");
    }
  }

  async function handleResetPassword(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setInfo(null);

    try {
      await resetPassword(recoveryEmail.trim(), recoveryCode.trim(), newPassword);
      setInfo("Password updated. You can login now.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not reset password");
    }
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F8FAFC", padding: "16px", fontFamily: "Inter, Arial, sans-serif" }}>
      <div style={{ maxWidth: "560px", margin: "0 auto", paddingTop: "36px", paddingBottom: "36px", display: "grid", gap: "14px" }}>
        <button onClick={() => navigate("/login")} style={linkButtonStyle}>Back to login</button>

        {error && <div style={errorStyle}>{error}</div>}
        {info && <div style={infoStyle}>{info}</div>}

        <section style={cardStyle}>
          <div style={titleRowStyle}>
            <KeyRound size={18} color="#2563EB" />
            <h1 style={titleStyle}>Login with code</h1>
          </div>

          <form onSubmit={handleRequestLoginCode} style={formStyle}>
            <input placeholder="Username or email" value={identifier} onChange={(event) => setIdentifier(event.target.value)} style={inputStyle} />
            <button type="submit" style={primaryButtonStyle}>Generate login code</button>
          </form>

          <form onSubmit={handleLoginWithCode} style={formStyle}>
            <input placeholder="Code" value={loginCode} onChange={(event) => setLoginCode(event.target.value)} style={inputStyle} />
            <button type="submit" style={secondaryButtonStyle}>Login with code</button>
          </form>
        </section>

        <section style={cardStyle}>
          <div style={titleRowStyle}>
            <Mail size={18} color="#15803D" />
            <h2 style={titleStyle}>Password recovery</h2>
          </div>

          <form onSubmit={handleRequestRecovery} style={formStyle}>
            <input placeholder="Account email" value={recoveryEmail} onChange={(event) => setRecoveryEmail(event.target.value)} style={inputStyle} />
            <button type="submit" style={primaryButtonStyle}>Request recovery code</button>
          </form>

          <form onSubmit={handleResetPassword} style={formStyle}>
            <input placeholder="Recovery code" value={recoveryCode} onChange={(event) => setRecoveryCode(event.target.value)} style={inputStyle} />
            <input type="password" placeholder="New password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} style={inputStyle} />
            <button type="submit" style={secondaryButtonStyle}>Reset password</button>
          </form>
        </section>
      </div>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  backgroundColor: "#FFFFFF",
  border: "1px solid #E5E7EB",
  borderRadius: "16px",
  padding: "18px",
  display: "grid",
  gap: "12px",
};

const titleRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "18px",
  fontWeight: 700,
  color: "#0F172A",
};

const formStyle: React.CSSProperties = {
  display: "grid",
  gap: "8px",
};

const inputStyle: React.CSSProperties = {
  height: "42px",
  borderRadius: "10px",
  border: "1px solid #CBD5E1",
  padding: "0 10px",
  outline: "none",
};

const linkButtonStyle: React.CSSProperties = {
  border: "none",
  background: "transparent",
  color: "#334155",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: 600,
  width: "fit-content",
};

const primaryButtonStyle: React.CSSProperties = {
  height: "40px",
  borderRadius: "10px",
  border: "none",
  backgroundColor: "#2563EB",
  color: "#FFFFFF",
  fontWeight: 700,
  cursor: "pointer",
};

const secondaryButtonStyle: React.CSSProperties = {
  height: "40px",
  borderRadius: "10px",
  border: "1px solid #94A3B8",
  backgroundColor: "#FFFFFF",
  color: "#0F172A",
  fontWeight: 700,
  cursor: "pointer",
};

const errorStyle: React.CSSProperties = {
  border: "1px solid #FCA5A5",
  backgroundColor: "#FEF2F2",
  color: "#B91C1C",
  borderRadius: "12px",
  padding: "10px 12px",
  fontSize: "14px",
};

const infoStyle: React.CSSProperties = {
  border: "1px solid #86EFAC",
  backgroundColor: "#F0FDF4",
  color: "#166534",
  borderRadius: "12px",
  padding: "10px 12px",
  fontSize: "14px",
};
