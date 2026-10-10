const PRIORITY_STYLE = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#eab308",
  low: "#34d399",
};

const TaskCard = ({ task, onClick, onTaskClick }) => {
  if (!task) return null;

  const title = task.title || task.name || "Untitled task";
  const priority = task.priority ? String(task.priority) : "";
  const assignee =
    task.assigneeName ||
    task.assignedToName ||
    task.assignee?.name ||
    (typeof task.assignee === "string" ? task.assignee : "");

  const handleClick = () => {
    if (onClick) onClick(task);
    else if (onTaskClick) onTaskClick(task);
  };

  const handleDragStart = (e) => {
    try {
      e.dataTransfer.setData("text/plain", String(task.id));
      e.dataTransfer.effectAllowed = "move";
    } catch {
      /* drag data is optional */
    }
  };

  return (
    <div
      className="nf-card"
      draggable
      onDragStart={handleDragStart}
      onClick={handleClick}
      style={{ padding: 10, marginBottom: 8, cursor: "pointer" }}
    >
      <div style={{ fontWeight: 600, fontSize: 13.5, marginBottom: 6 }}>{title}</div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        {priority && (
          <span
            className="nf-badge"
            style={{ borderColor: PRIORITY_STYLE[priority.toLowerCase()] || undefined }}
          >
            {priority}
          </span>
        )}
        <span style={{ fontSize: 12, color: "var(--nf-text-faint)" }}>
          {assignee || "Unassigned"}
        </span>
      </div>
    </div>
  );
};

export default TaskCard;