import { useEffect, useState } from "react";
import Modal from "../Modal";
import FormShell from "../FormShell";
import { createBug } from "../../services/bugService";
import { getCurrentUser } from "../../services/userService";
import { ENVIRONMENTS, SEVERITIES, PRIORITIES } from "../../utils/bugConstants";

const EMPTY = {
  title: "",
  description: "",
  projectId: "",
  moduleFeature: "",
  environment: "Development",
  severity: "Medium",
  priority: "Medium",
  assignedToId: "",
};

const BugFormModal = ({ open, onClose, projects, assignees, onCreated }) => {
  const me = getCurrentUser();
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setForm(EMPTY);
      setError("");
    }
  }, [open]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError("Title is required."); return; }
    if (!form.projectId) { setError("Select a project."); return; }

    setSaving(true);
    setError("");
    try {
      const created = await createBug({
        ...form,
        projectId: Number(form.projectId),
        assignedToId: form.assignedToId ? Number(form.assignedToId) : null,
      });
      onCreated(created);
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to report the bug.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={() => { if (!saving) onClose(); }} title="Report Bug" wide>
      <form onSubmit={handleSubmit}>
        <FormShell
          asPanel={false}
          error={error}
          main={
            <>
              <div className="nf-field">
                <label>Title</label>
                <input
                  name="title"
                  value={form.title}
                  maxLength={255}
                  onChange={handleChange}
                  placeholder="Enter a short description of the bug"
                />
              </div>
              <div className="nf-field">
                <label>Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Steps to reproduce, expected result and actual result"
                />
              </div>
              <div className="nf-field">
                <label>Module / Feature</label>
                <input
                  name="moduleFeature"
                  value={form.moduleFeature}
                  maxLength={100}
                  onChange={handleChange}
                  placeholder="Login, Dashboard, Payments..."
                />
              </div>
            </>
          }
          sidebar={
            <>
              <div className="nf-field">
                <label>Project</label>
                <select name="projectId" value={form.projectId} onChange={handleChange}>
                  <option value="">Select project</option>
                  {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="nf-field">
                <label>Environment</label>
                <select name="environment" value={form.environment} onChange={handleChange}>
                  {ENVIRONMENTS.map((x) => <option key={x} value={x}>{x}</option>)}
                </select>
              </div>
              <div className="nf-field">
                <label>Severity</label>
                <select name="severity" value={form.severity} onChange={handleChange}>
                  {SEVERITIES.map((x) => <option key={x} value={x}>{x}</option>)}
                </select>
              </div>
              <div className="nf-field">
                <label>Priority</label>
                <select name="priority" value={form.priority} onChange={handleChange}>
                  {PRIORITIES.map((x) => <option key={x} value={x}>{x}</option>)}
                </select>
              </div>
              <div className="nf-field">
                <label>Assigned To</label>
                <select name="assignedToId" value={form.assignedToId} onChange={handleChange}>
                  <option value="">Unassigned</option>
                  {assignees.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
              <div className="nf-field">
                <label>Reported By</label>
                <input value={me?.name || me?.email || ""} disabled readOnly />
              </div>
            </>
          }
          actions={
            <>
              <button type="submit" className="nf-btn" disabled={saving}>
                {saving ? "Reporting..." : "Report Bug"}
              </button>
              <button type="button" className="nf-btn secondary" onClick={onClose} disabled={saving}>
                Cancel
              </button>
            </>
          }
        />
      </form>
    </Modal>
  );
};

export default BugFormModal;