import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import PasswordField from "./PasswordField";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

export default function Login() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const nextErrors = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextErrors.email = "Enter a valid email address.";
    if (!password) nextErrors.password = "Enter your password.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setLoading(true);
    try {
      await login({ email, password, remember });
      showToast("Welcome back.");
      const dest = location.state?.from || "/dashboard";
      navigate(dest, { replace: true });
    } catch (err) {
      setErrors({ form: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <div className="auth-toggle" data-active="login" role="group" aria-label="Choose a form">
        <span className="auth-toggle__thumb" aria-hidden="true" />
        <button type="button" className="auth-toggle__btn is-active" aria-pressed="true">Log in</button>
        <Link to="/signup" className="auth-toggle__btn" aria-pressed="false" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>Sign up</Link>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <h2 className="form-title">Welcome back</h2>
        <p className="form-subtitle">Log in to pick up where you left off.</p>

        <div className={`field ${errors.email ? "has-error" : ""}`}>
          <label htmlFor="loginEmail">Email address</label>
          <input id="loginEmail" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          {errors.email && <p className="field-error">{errors.email}</p>}
        </div>

        <PasswordField id="loginPassword" label="Password" value={password} onChange={setPassword} autoComplete="current-password" error={errors.password} />

        <div className="field-row">
          <label className="checkbox">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            <span className="checkbox__box" aria-hidden="true"><svg viewBox="0 0 16 16" width="11" height="11"><path d="M2.5 8.5L6 12l7.5-8" /></svg></span>
            <span>Remember me</span>
          </label>
          <Link to="/forgot-password" className="link-muted">Forgot password?</Link>
        </div>

        {errors.form && <p className="field-error" style={{ marginTop: 14 }}>{errors.form}</p>}

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Logging in…" : "Log in"}
        </button>

        <p className="form-switch">New here? <Link to="/signup" className="link-strong">Create an account</Link></p>
      </form>
    </AuthLayout>
  );
}
