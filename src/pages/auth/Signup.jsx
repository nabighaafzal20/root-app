import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import PasswordField from "./PasswordField";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

export default function Signup() {
  const { signup } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const nextErrors = {};
    if (!name.trim()) nextErrors.name = "Tell us your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextErrors.email = "Enter a valid email address.";
    if (password.length < 8) nextErrors.password = "Use at least 8 characters.";
    if (confirm !== password) nextErrors.confirm = "Passwords don't match.";
    if (!terms) nextErrors.terms = "Please accept the terms to continue.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setLoading(true);
    try {
      await signup({ name, email, password });
      showToast("Account created — welcome to Root.");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setErrors({ form: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <div className="auth-toggle" data-active="signup" role="group" aria-label="Choose a form">
        <span className="auth-toggle__thumb" aria-hidden="true" />
        <Link to="/login" className="auth-toggle__btn" aria-pressed="false" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>Log in</Link>
        <button type="button" className="auth-toggle__btn is-active" aria-pressed="true">Sign up</button>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <h2 className="form-title">Start growing</h2>
        <p className="form-subtitle">Create your account — it takes less than a minute.</p>

        <div className={`field ${errors.name ? "has-error" : ""}`}>
          <label htmlFor="signupName">Full name</label>
          <input id="signupName" type="text" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} required />
          {errors.name && <p className="field-error">{errors.name}</p>}
        </div>

        <div className={`field ${errors.email ? "has-error" : ""}`}>
          <label htmlFor="signupEmail">Email address</label>
          <input id="signupEmail" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          {errors.email && <p className="field-error">{errors.email}</p>}
        </div>

        <PasswordField id="signupPassword" label="Password" value={password} onChange={setPassword} autoComplete="new-password" error={errors.password} showStrength />
        <PasswordField id="signupConfirm" label="Confirm password" value={confirm} onChange={setConfirm} autoComplete="new-password" error={errors.confirm} />

        <div className={`field ${errors.terms ? "has-error" : ""}`} style={{ marginTop: 18 }}>
          <label className="checkbox checkbox--terms">
            <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} />
            <span className="checkbox__box" aria-hidden="true"><svg viewBox="0 0 16 16" width="11" height="11"><path d="M2.5 8.5L6 12l7.5-8" /></svg></span>
            <span>I agree to the <a href="#terms" className="link-muted" onClick={(e) => e.preventDefault()}>Terms</a> and <a href="#privacy" className="link-muted" onClick={(e) => e.preventDefault()}>Privacy Policy</a></span>
          </label>
          {errors.terms && <p className="field-error">{errors.terms}</p>}
        </div>

        {errors.form && <p className="field-error" style={{ marginTop: 14 }}>{errors.form}</p>}

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Creating account…" : "Create account"}
        </button>

        <p className="form-switch">Already have an account? <Link to="/login" className="link-strong">Log in</Link></p>
      </form>
    </AuthLayout>
  );
}
