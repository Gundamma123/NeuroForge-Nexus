import { useEffect, useState } from "react";
import Modal from "../Modal";
import { updateBug, deleteBug } from "../../services/bugService";
import {
  STATUSES, SEVERITIES, PRIORITIES, LEVEL_CLASS, statusClass, formatDate,
} from "../../utils/bugConstants";

const BugDetailsModal = ({ bug, assignees, onClose, onChanged, onDeleted }) => {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    setError("");
    setConfirmingDelete(false);
  }, [bug?.id]);

  const apply = async (changes) => {
    setBusy(true);
    setError("");
    try {
      const updated = await updateBug(bug.id, changes);
      onChanged(updated);
    } catch (err) {
      setError(err?.response?.data?.message || "The update failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    setError("");
    try {
      await deleteBug(bug.id);
      onDeleted(bug.id);
    } catch (err) {
      setError(err?.response?.data?.message || "Could not delete this bug.");
      setConfirmingDelete(false);
    } finally {
      setBusy(false);
    }
  };

  const idx = bug ? STATUSES.indexOf(bug.status) : -1;
  const next = idx >= 0 && idx < STATUSES.length - 1 ? STATUSES[idx + 1] : null;
  // A failed retest goes back to "In Progress"; otherwise one step back.
  const back = bug?.status === "Retest" ? "In Progress" : idx > 0 ? STATUSES[idx - 1] : null;

  const assigneeKnown = bug && assignees.some((a) => a.id === bug.assignedToId);

  return (
    <Modal open={!!bug} onClose={() => { if (!busy) onClose(); }} title={bug ? bug.key : "Bug"} wide>
      {bug && (
        <>
          <h2 className="nf-detail-name" style={{ marginBottom: 6 }}>{bug.title}</h2>
          <div className="nf-detail-row" style={{ marginTop: 0 }}>
            <span className={`nf-badge ${statusClass(bug.status)}`}>{bug.status}</span>
          </div>

          {error && <div className="nf-form-error">{error}</div>}

          <div className="nf-bug-meta-grid">
            <div className="nf-card">
              <div className="nf-stat-label">Severity</div>
              <select
                className="nf-select-filter"
                value={bug.severity}
                disabled={busy}
                onChange={(e) => apply({ severity: e.target.value })}
              >
                {SEVERITIES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="nf-card">
              <div className="nf-stat-label">Priority</div>
              <select
                className="nf-select-filter"
                value={bug.priority}
                disabled={busy}
                onChange={(e) => apply({ priority: e.target.value })}
              >
                {PRIORITIES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="nf-card">
              <div className="nf-stat-label">Assigned To</div>
              <select
                className="nf-select-filter"
                value={bug.assignedToId ?? ""}
                disabled={busy}
                onChange={(e) => apply({ assignedToId: e.target.value ? Number(e.target.value) : null })}
              >
                <option value="">Unassigned</option>
                {bug.assignedToId && !assigneeKnown && (
                  <option value={bug.assignedToId}>{bug.assignedToName}</option>
                )}
                {assignees.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div className="nf-card">
              <div className="nf-stat-label">Environment</div>
              <div className="nf-detail-row" style={{ margin: 0 }}>{bug.environment}</div>
            </div>
            <div className="nf-card">
              <div className="nf-stat-label">Project</div>
              <div className="nf-detail-row" style={{ margin: 0 }}>{bug.projectName}</div>
            </div>
            <div className="nf-card">
              <div className="nf-stat-label">Module</div>
              <div className="nf-detail-row" style={{ margin: 0 }}>{bug.moduleFeature || "—"}</div>
            </div>
            <div className="nf-card">
              <div className="nf-stat-label">Reported by</div>
              <div className="nf-detail-row" style={{ margin: 0 }}>{bug.reportedByName}</div>
            </div>
            <div className="nf-card">
              <div className="nf-stat-label">Created</div>
              <div className="nf-detail-row" style={{ margin: 0 }}>{formatDate(bug.createdAt)}</div>
            </div>
          </div>

          <div className="nf-stat-label">Description</div>
          <p className="nf-detail-row" style={{ whiteSpace: "pre-wrap" }}>
            {bug.description || "No description provided."}
          </p>

          <div className="nf-stat-label" style={{ marginTop: 14 }}>Bug workflow</div>
          <div className="nf-bug-stepper">
            {STATUSES.map((s, i) => (
              <span
                key={s}
                className={`nf-bug-step ${i < idx ? "done" : ""} ${i === idx ? "current" : ""}`}
              >
                {s}
              </span>
            ))}
          </div>

          <div className="nf-actions" style={{ justifyContent: "space-between" }}>
            <div>
              {bug.canDelete && !confirmingDelete && (
                <button className="nf-btn secondary" onClick={() => setConfirmingDelete(true)} disabled={busy}>
                  Delete bug
                </button>
              )}
              {bug.canDelete && confirmingDelete && (
                <>
                  <span className="nf-detail-row" style={{ marginRight: 8 }}>Delete permanently?</span>
                  <button className="nf-btn" onClick={remove} disabled={busy}>
                    {busy ? "Deleting..." : "Yes, delete"}
                  </button>
                  <button className="nf-btn secondary" onClick={() => setConfirmingDelete(false)} disabled={busy}>
                    Keep
                  </button>
                </>
              )}
            </div>

            <div>
              {back && (
                <button className="nf-btn secondary" onClick={() => apply({ status: back })} disabled={busy}>
                  ← Back to {back}
                </button>
              )}
              {next && (
                <button className="nf-btn" onClick={() => apply({ status: next })} disabled={busy}>
                  Move to {next} →
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </Modal>
  );
};

export default BugDetailsModal;