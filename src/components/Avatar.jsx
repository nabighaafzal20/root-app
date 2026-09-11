export default function Avatar({ name = "", color = "forest", size = 38 }) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  return (
    <span
      className={`avatar avatar--${color}`}
      style={{ width: size, height: size, fontSize: size * 0.42 }}
      aria-hidden="true"
    >
      {initial}
    </span>
  );
}
