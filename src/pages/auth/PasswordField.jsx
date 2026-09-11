import { useState } from "react";

function strengthOf(pw) {
  if (!pw) return { level: "", label: "Password strength", pct: 0 };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { level: "weak", label: "Weak", pct: 30 };
  if (score <= 3) return { level: "medium", label: "Good", pct: 65 };
  return { level: "strong", label: "Strong", pct: 100 };
}

export default function PasswordField({ id, label, value, onChange, autoComplete, error, showStrength }) {
  const [visible, setVisible] = useState(false);
  const strength = showStrength ? strengthOf(value) : null;

  return (
    <div className={`field ${error ? "has-error" : ""}`}>
      <label htmlFor={id}>{label}</label>
      <div className="input-with-icon">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          required
        />
        <button
          type="button"
          className="icon-toggle"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff /> : <Eye />}
        </button>
      </div>
      {showStrength && value && (
        <div className="strength-meter" data-level={strength.level}>
          <div className="strength-meter__track">
            <div className="strength-meter__fill" style={{ width: `${strength.pct}%` }} />
          </div>
          <span className="strength-meter__label">{strength.label}</span>
        </div>
      )}
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}

function Eye() {
  return (
    <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12Z" /><circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function EyeOff() {
  return (
    <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3l18 18" /><path d="M10.6 5.2A10.6 10.6 0 0 1 12 5c7 0 10.5 7 10.5 7a13.4 13.4 0 0 1-3.2 4.1M6.7 6.7C3.4 8.7 1.5 12 1.5 12s3.5 7 10.5 7a10.6 10.6 0 0 0 4.6-1" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </svg>
  );
}
