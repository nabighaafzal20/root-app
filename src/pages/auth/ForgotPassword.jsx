import { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import { useAuth } from "../../context/AuthContext";

export default function ForgotPassword() {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [token, setToken] = useState(null);
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    const t = requestPasswordReset(email);
    // Always show the same confirmation regardless of whether the account
    // exists, so this screen can't be used to find out which emails are registered.
    setSent(true);
    setToken(t);
  }

  return (
    <AuthLayout>
      <Link to="/login" className="auth-back">← Back to log in</Link>

      {!sent ? (
        <form onSubmit={handleSubmit} noValidate>
          <h2 className="form-title">Reset your password</h2>
          <p className="form-subtitle">Enter the email on your account and we'll send a reset link.</p>

          <div className={`field ${error ? "has-error" : ""}`}>
            <label htmlFor="forgotEmail">Email address</label>
            <input id="forgotEmail" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            {error && <p className="field-error">{error}</p>}
          </div>

          <button type="submit" className="btn btn-primary">Send reset link</button>
        </form>
      ) : (
        <div>
          <h2 className="form-title">Check your email</h2>
          <p className="form-subtitle">If that's a Root account, we've sent a reset link to <strong>{email}</strong>.</p>

          <div className="reset-note-box">
            <strong>Demo note:</strong> Root runs entirely in your browser with no server, so it can't actually send email. In a real deployment this link would arrive in your inbox — here it is instead, just for this demo:
            <br /><br />
            {token ? (
              <Link to={`/reset-password?token=${token}`}>Open your reset link →</Link>
            ) : (
              <span>No account found with that email — nothing was generated.</span>
            )}
          </div>

          <button type="button" className="btn btn-secondary" onClick={() => setSent(false)}>Use a different email</button>
        </div>
      )}
    </AuthLayout>
  );
}
