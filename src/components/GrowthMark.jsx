export function GrowthIllustration({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 260 220" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M130 210 C130 160 130 120 130 80" stroke="currentColor" strokeOpacity="0.55" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M130 150 C110 140 90 132 72 108" stroke="currentColor" strokeOpacity="0.55" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M130 120 C150 108 168 98 184 72" stroke="currentColor" strokeOpacity="0.55" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M72 108 C64 96 62 84 68 68" stroke="currentColor" strokeOpacity="0.55" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M184 72 C192 58 192 46 184 32" stroke="currentColor" strokeOpacity="0.55" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M130 80 C120 62 118 46 128 26" stroke="var(--gold)" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="128" cy="24" r="4.5" fill="var(--gold)" />
    </svg>
  );
}

export function RootMark({ size = 22 }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 21V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M12 13c-3-1-5-3-5.5-6.5C10 6 12.5 8 12 13Z" fill="currentColor" opacity="0.9" />
        <path d="M12 11c3-1 5-2.6 5.5-5.7C13.5 5 11.5 7 12 11Z" fill="currentColor" opacity="0.65" />
      </svg>
    </span>
  );
}
