import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import PasswordField from "./PasswordField";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const { resetPassword } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState({});
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const nextErrors = {};
    if (password.length < 8) nextErrors.password = "Use at least 8 characters.";
    if (confirm !== password) nextErrors.confirm = "Passwords don't match.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setLoading(true);
    try {
      await resetPassword(token, password);
      setDone(true);
      showToast("Password updated — you can log in now.");
    } catch (err) {
      setErrors({ form: err.message });
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <AuthLayout>
        <h2 className="form-title">Link missing</h2>
        <p className="form-subtitle">This reset link is missing its token. Request a new one from the forgot-password page.</p>
        <Link to="/forgot-password" className="btn btn-primary" style={{ display: "flex" }}>Request a new link</Link>
      </AuthLayout>
    );
  }

  if (done) {
    return (
      <AuthLayout>
        <div className="success-panel">
          <svg className="success-check" viewBox="0 0 80 80" aria-hidden="true">
            <circle cx="40" cy="40" r="36" className="success-check__circle" />
            <path d="M24 41 L35 52 L57 28" className="success-check__mark" />
          </svg>
          <h2>Password updated</h2>
          <p>You can now log in with your new password.</p>
          <button type="button" className="btn btn-secondary" onClick={() => navigate("/login")}>Go to log in</button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit} noValidate>
        <h2 className="form-title">Choose a new password</h2>
        <p className="form-subtitle">Make it something you haven't used before.</p>

        <PasswordField id="newPassword" label="New password" value={password} onChange={setPassword} autoComplete="new-password" error={errors.password} showStrength />
        <PasswordField id="confirmPassword" label="Confirm new password" value={confirm} onChange={setConfirm} autoComplete="new-password" error={errors.confirm} />

        {errors.form && <p className="field-error" style={{ marginTop: 14 }}>{errors.form}</p>}

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Updating…" : "Update password"}
        </button>
      </form>
    </AuthLayout>
  );
}
