import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import { getAllMembers, createMember } from "../../services/memberService";
import { createTeam, getAssignedMemberIds } from "../../services/teamService";
import { getCurrentUser } from "../../services/userService";

const ROLE_CATEGORIES = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Product Manager",
  "QA Tester",
];

const SelectMembers = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = getCurrentUser();
  const isAdmin = currentUser?.role === "Admin";

  const teamDraft = location.state?.teamDraft;
  const requiredSize = teamDraft?.requiredTeamSize || null;
  const editingTeamId = teamDraft?.editingTeamId || null; // present only when editing an existing team

  useEffect(() => {
    if (!teamDraft?.name) {
      navigate("/teams/create", { replace: true });
    }
  }, [teamDraft, navigate]);

  const [members, setMembers] = useState([]);
  const [assignedIds, setAssignedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [activeRole, setActiveRole] = useState(ROLE_CATEGORIES[0]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [error, setError] = useState("");
  const [limitNotice, setLimitNotice] = useState("");
  const [saving, setSaving] = useState(false);

  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({
    name: "", email: "", role: ROLE_CATEGORIES[0], experienceYears: "", skills: "",
  });
  const [addError, setAddError] = useState("");
  const [addSaving, setAddSaving] = useState(false);

  useEffect(() => {
    Promise.all([getAllMembers(), getAssignedMemberIds(editingTeamId)])
      .then(([memberData, assignedData]) => {
        setMembers(Array.isArray(memberData) ? memberData : []);
        setAssignedIds(new Set(assignedData || []));
      })
      .catch(() => setError("Could not load the member pool. Please try again."))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const membersForActiveRole = useMemo(
    () => members.filter((m) => m.role === activeRole),
    [members, activeRole]
  );

  const isMemberAvailable = (memberId) => !assignedIds.has(memberId);

  const toggleMember = (member) => {
    setLimitNotice("");
    if (!isMemberAvailable(member.id)) {
      setLimitNotice(`${member.name} is already assigned to another team and cannot be selected.`);
      return;
    }

    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(member.id)) {
        next.delete(member.id);
        return next;
      }
      if (requiredSize && next.size >= requiredSize) {
        setLimitNotice(
          `Team Size Limit Reached. This project requires exactly ${requiredSize} members. You cannot select more than ${requiredSize} members.`
        );
        return prev;
      }
      next.add(member.id);
      return next;
    });
  };

  const handleAddFormChange = (e) => setAddForm({ ...addForm, [e.target.name]: e.target.value });

  const handleAddMember = async (e) => {
    e.preventDefault();
    setAddError("");
    if (!addForm.name.trim() || !addForm.email.trim()) {
      setAddError("Name and email are required.");
      return;
    }
    setAddSaving(true);
    try {
      const created = await createMember({
        ...addForm,
        experienceYears: addForm.experienceYears ? Number(addForm.experienceYears) : 0,
      });
      setMembers((prev) => [...prev, created]);
      setShowAddForm(false);
      setAddForm({ name: "", email: "", role: ROLE_CATEGORIES[0], experienceYears: "", skills: "" });
    } catch (err) {
      if (err?.response?.status === 403) {
        setAddError("Access Denied. Only administrators are allowed to add members.");
      } else {
        setAddError(err?.response?.data?.message || "Failed to add member.");
      }
    } finally {
      setAddSaving(false);
    }
  };

  const handleCreateTeam = async () => {
    setError("");

    if (requiredSize && selectedIds.size !== requiredSize) {
      const diff = requiredSize - selectedIds.size;
      setError(
        diff > 0
          ? `Cannot create team. This project requires exactly ${requiredSize} members. Please select ${diff} more member${diff > 1 ? "s" : ""}.`
          : `Cannot create team. This project requires exactly ${requiredSize} members. Please remove ${Math.abs(diff)} member${Math.abs(diff) > 1 ? "s" : ""}.`
      );
      return;
    }

    setSaving(true);
    try {
      await createTeam({
        name: teamDraft.name,
        projectId: teamDraft.projectId || null,
        memberIds: Array.from(selectedIds),
      });
      navigate("/teams");
    } catch (err) {
      // Surfaces backend errors like "Member 'X' is already assigned to another team."
      setError(err?.response?.data?.message || "Failed to create team. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (!teamDraft?.name) return null;

  return (
    <div className="nf-app">
      <Navbar />
      <div className="nf-body">
        <Sidebar />
        <main className="nf-main">
          <span className="nf-back-link" onClick={() => navigate("/teams/create")}>
            ← Back to Create Team
          </span>

          <h1 className="nf-page-title">Select Team Members</h1>
          <p className="nf-detail-row" style={{ marginTop: -14 }}>
            Building <b>{teamDraft.name}</b>
            {teamDraft.projectName ? <> for <b>{teamDraft.projectName}</b></> : null}
            {requiredSize ? <> — Required Team Size: <b>{requiredSize}</b></> : null}
          </p>

          {error && <div className="nf-form-error">{error}</div>}
          {limitNotice && <div className="nf-form-error">{limitNotice}</div>}

          <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 20 }}>
            <div className="nf-panel" style={{ padding: 12, height: "fit-content" }}>
              {ROLE_CATEGORIES.map((role) => {
                const roleMembers = members.filter((m) => m.role === role);
                const availableCount = roleMembers.filter((m) => isMemberAvailable(m.id)).length;
                const selectedInRole = roleMembers.filter((m) => selectedIds.has(m.id)).length;
                return (
                  <div
                    key={role}
                    className={`nf-sidebar-link ${activeRole === role ? "active" : ""}`}
                    style={{ justifyContent: "space-between" }}
                    onClick={() => setActiveRole(role)}
                  >
                    <span>{role}</span>
                    <span className="nf-badge" style={{ fontSize: 10.5, padding: "1px 7px" }}>
                      {selectedInRole > 0 ? `${selectedInRole} sel` : `${availableCount} free`}
                    </span>
                  </div>
                );
              })}
            </div>

            <div>
              <div className="nf-panel" style={{ marginBottom: 16 }}>
                <div className="nf-toolbar" style={{ marginBottom: 0 }}>
                  <h3 style={{ margin: 0, flex: 1 }}>{activeRole}s</h3>
                  {isAdmin && (
                    <button
                      className="nf-btn secondary"
                      onClick={() => {
                        setShowAddForm((s) => !s);
                        setAddForm((f) => ({ ...f, role: activeRole }));
                      }}
                    >
                      {showAddForm ? "Cancel" : "+ Add Member"}
                    </button>
                  )}
                </div>

                {showAddForm && (
                  <form
                    onSubmit={handleAddMember}
                    style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--nf-card-border)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
                  >
                    {addError && <div className="nf-form-error" style={{ gridColumn: "1 / -1" }}>{addError}</div>}
                    <div className="nf-field" style={{ margin: 0 }}>
                      <label>Name</label>
                      <input name="name" value={addForm.name} onChange={handleAddFormChange} />
                    </div>
                    <div className="nf-field" style={{ margin: 0 }}>
                      <label>Email</label>
                      <input name="email" value={addForm.email} onChange={handleAddFormChange} />
                    </div>
                    <div className="nf-field" style={{ margin: 0 }}>
                      <label>Role</label>
                      <select name="role" value={addForm.role} onChange={handleAddFormChange}>
                        {ROLE_CATEGORIES.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                    <div className="nf-field" style={{ margin: 0 }}>
                      <label>Experience (years)</label>
                      <input name="experienceYears" type="number" min="0" value={addForm.experienceYears} onChange={handleAddFormChange} />
                    </div>
                    <div className="nf-field" style={{ margin: 0, gridColumn: "1 / -1" }}>
                      <label>Skills</label>
                      <input name="skills" placeholder="e.g. React, JavaScript, HTML, CSS" value={addForm.skills} onChange={handleAddFormChange} />
                    </div>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <button type="submit" className="nf-btn" disabled={addSaving}>
                        {addSaving ? "Adding..." : "Add Member"}
                      </button>
                    </div>
                  </form>
                )}
              </div>

              <div className="nf-table-wrap">
                <table className="nf-table">
                  <thead>
                    <tr>
                      <th style={{ width: 36 }}></th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Experience</th>
                      <th>Skills</th>
                      <th>Team Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {membersForActiveRole.map((m) => {
                      const available = isMemberAvailable(m.id);
                      return (
                        <tr
                          key={m.id}
                          className={available ? "clickable" : ""}
                          style={{ opacity: available ? 1 : 0.5 }}
                          onClick={() => toggleMember(m)}
                        >
                          <td onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={selectedIds.has(m.id)}
                              disabled={!available}
                              onChange={() => toggleMember(m)}
                            />
                          </td>
                          <td><b>{m.name}</b></td>
                          <td>{m.email}</td>
                          <td>{m.experienceYears ?? 0} yrs</td>
                          <td>{m.skills || "—"}</td>
                          <td>
                            <span className={`nf-status-dot ${available ? "" : "inactive"}`}>
                              {available ? "Available" : "Busy / Already Assigned"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {!loading && membersForActiveRole.length === 0 && (
                  <div className="nf-empty-state">No {activeRole}s in the pool yet.</div>
                )}
              </div>
            </div>
          </div>

          <div className="nf-panel" style={{ marginTop: 20, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div className="nf-detail-row" style={{ margin: 0, fontSize: 15 }}>
              Selected Members: <b>{selectedIds.size}</b>
              {requiredSize ? <> / {requiredSize}</> : null}
            </div>
            <div className="nf-actions" style={{ margin: 0 }}>
              <button className="nf-btn" onClick={handleCreateTeam} disabled={saving || selectedIds.size === 0}>
                {saving ? "Creating..." : "Create Team"}
              </button>
              <button className="nf-btn secondary" onClick={() => navigate("/teams")}>
                Cancel
              </button>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default SelectMembers;