import { GrowthIllustration } from "../../components/GrowthMark";

export default function AuthLayout({ children }) {
  return (
    <div className="auth-page">
      <section className="brand-panel" aria-hidden="true">
        <div className="brand-panel__pattern" />
        <div className="brand-panel__content">
          <span className="brand-mark">Root</span>
          <h1 className="brand-tagline">A quiet place<br />to grow your days.</h1>
          <GrowthIllustration className="brand-illustration" />
          <p className="brand-footnote">Journal your thoughts, build habits that stick, and move your projects forward — all in one place.</p>
        </div>
      </section>
      <main className="auth-panel">
        <div className="auth-card">{children}</div>
      </main>
    </div>
  );
}
