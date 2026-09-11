import Icon from "./Icon";

export default function EmptyState({ icon = "sparkle", title, message, action }) {
  return (
    <div className="empty-state">
      <Icon name={icon} size={26} />
      <h3>{title}</h3>
      <p>{message}</p>
      {action}
    </div>
  );
}
