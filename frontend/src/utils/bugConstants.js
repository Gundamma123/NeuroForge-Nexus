export const STATUSES = ["New", "Triaged", "Assigned", "In Progress", "Fixed", "Retest", "Closed"];
export const SEVERITIES = ["Low", "Medium", "High", "Critical"];
export const PRIORITIES = ["Low", "Medium", "High"];
export const ENVIRONMENTS = ["Development", "Staging", "Production"];

// Reuses the priority-* badge colours already in index.css
export const LEVEL_CLASS = {
  Low: "priority-low",
  Medium: "priority-medium",
  High: "priority-high",
  Critical: "priority-critical",
};

export const statusClass = (status) => `bug-status-${(status || "").toLowerCase().replace(/\s+/g, "-")}`;

export const formatDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
};