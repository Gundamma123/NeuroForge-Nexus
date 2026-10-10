import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import Modal from "../components/Modal";
import { getSprintById, updateSprint } from "../services/sprintService";
import {
  getTasksBySprint,
  createTask,
  updateTask,
} from "../services/taskService";
import { getTeamsByProject } from "../services/teamService";
import FormShell from "../components/FormShell";

const COLUMNS = ["To Do", "In Progress", "In Review", "Done"];

const PRIORITIES = ["Low", "Medium", "High", "Critical"];

const PRIORITY_CLASS = {
  Low: "role-dev",
  Medium: "role-pm",
  High: "role-admin",
  Critical: "role-admin",
};

const SPRINT_STATUSES = ["Planned", "Active", "Completed", "Cancelled"];

// Remove duplicate tasks by ID
const dedupeById = (arr) =>
  Array.from(
    new Map(arr.map((item) => [item.id, item])).values()
  );

const SprintDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [sprint, setSprint] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Board or List view
  const [boardView, setBoardView] = useState("Board");

  const [form, setForm] = useState({
    title: "",
    description: "",
    assigneeId: "",
    priority: "Medium",
    status: "To Do",
    storyPoints: "",
    dueDate: "",
  });

  const loadAll = () => {
    getSprintById(id)
      .then((sprintData) => {
        setSprint(sprintData);

        return Promise.all([
          getTasksBySprint(id),
          sprintData.project?.id
            ? getTeamsByProject(sprintData.project.id)
            : Promise.resolve([]),
        ]);
      })
      .then(([taskData, teamsData]) => {
        // Remove duplicate task rows
        setTasks(
          dedupeById(
            Array.isArray(taskData) ? taskData : []
          )
        );

        const all = (
          Array.isArray(teamsData) ? teamsData : []
        ).flatMap((t) => t.members || []);

        setMembers(
          Array.from(
            new Map(
              all.map((m) => [m.id, m])
            ).values()
          )
        );
      })
      .catch((err) => {
        console.error("Failed to load sprint:", err);
        setError("Unable to load this sprint's board.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setLoading(true);
    setError("");
    loadAll();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleFormChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      await createTask({
        ...form,
        sprintId: Number(id),
        assigneeId: form.assigneeId
          ? Number(form.assigneeId)
          : null,
        storyPoints: form.storyPoints
          ? Number(form.storyPoints)
          : 0,
        dueDate: form.dueDate || null,
      });

      setModalOpen(false);

      setForm({
        title: "",
        description: "",
        assigneeId: "",
        priority: "Medium",
        status: "To Do",
        storyPoints: "",
        dueDate: "",
      });

      loadAll();
    } catch (err) {
      console.error("Failed to create task:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to create task."
      );
    } finally {
      setSaving(false);
    }
  };

  const moveTask = async (task, newStatus) => {
    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id
          ? { ...t, status: newStatus }
          : t
      )
    );

    try {
      await updateTask(task.id, {
        title: task.title,
        description: task.description,
        sprintId: Number(id),
        assigneeId: task.assignee?.id || null,
        priority: task.priority,
        status: newStatus,
        storyPoints: task.storyPoints,
        dueDate: task.dueDate,
      });
    } catch (err) {
      console.error("Failed to move task:", err);

      setError("Failed to move task.");
      loadAll();
    }
  };

  const changeSprintStatus = async (newStatus) => {
    if (!sprint) return;

    setError("");

    try {
      const updated = await updateSprint(id, {
        name: sprint.name,
        goal: sprint.goal,
        startDate: sprint.startDate,
        endDate: sprint.endDate,
        status: newStatus,
      });

      setSprint(updated);
    } catch (err) {
      console.error("Failed to update sprint status:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to update sprint status."
      );
    }
  };

  if (loading) {
    return (
      <div className="nf-app">
        <Navbar />

        <div className="nf-body">
          <Sidebar />

          <main className="nf-main">
            <div className="nf-loading">
              Loading sprint board...
            </div>
          </main>
        </div>

        <Footer />
      </div>
    );
  }

  if (!sprint) {
    return (
      <div className="nf-app">
        <Navbar />

        <div className="nf-body">
          <Sidebar />

          <main className="nf-main">
            <div className="nf-form-error">
              {error || "Sprint not found."}
            </div>

            <button
              className="nf-btn"
              onClick={() => navigate("/sprints")}
            >
              Back to Sprints
            </button>
          </main>
        </div>

        <Footer />
      </div>
    );
  }

  const counts = COLUMNS.reduce((acc, col) => {
    acc[col] = tasks.filter(
      (t) => t.status === col
    ).length;

    return acc;
  }, {});

  const totalPoints = tasks.reduce(
    (sum, t) => sum + (t.storyPoints || 0),
    0
  );

  const completedPoints = tasks
    .filter((t) => t.status === "Done")
    .reduce(
      (sum, t) => sum + (t.storyPoints || 0),
      0
    );

  let daysLeft = null;

  if (sprint.endDate) {
    const diffMs =
      new Date(sprint.endDate) - new Date();

    daysLeft = Math.max(
      0,
      Math.ceil(
        diffMs / (1000 * 60 * 60 * 24)
      )
    );
  }

  // Pace calculation based on actual sprint dates and story points
  let paceStatus = "—";

  if (
    sprint.startDate &&
    sprint.endDate &&
    totalPoints > 0
  ) {
    const totalDays = Math.max(
      1,
      (new Date(sprint.endDate) -
        new Date(sprint.startDate)) /
        (1000 * 60 * 60 * 24)
    );

    const elapsedDays = Math.min(
      totalDays,
      (new Date() -
        new Date(sprint.startDate)) /
        (1000 * 60 * 60 * 24)
    );

    const expectedPct = Math.min(
      100,
      Math.round(
        (elapsedDays / totalDays) * 100
      )
    );

    const actualPct = Math.round(
      (completedPoints / totalPoints) * 100
    );

    paceStatus =
      actualPct >= expectedPct
        ? "On Track"
        : actualPct >= expectedPct - 15
        ? "At Risk"
        : "Delayed";
  }

  return (
    <div className="nf-app">
      <Navbar />

      <div className="nf-body">
        <Sidebar />

        <main className="nf-main">
          <span
            className="nf-back-link"
            onClick={() =>
              navigate(
                `/projects/${sprint.project?.id}/sprints`
              )
            }
          >
            ← Back to Sprints
          </span>

          <h1
            className="nf-page-title"
            style={{ marginBottom: 4 }}
          >
            {sprint.name} — Kanban Board
          </h1>

          <p
            className="nf-detail-row"
            style={{ marginTop: -8 }}
          >
            {sprint.goal || "No goal set"}

            {daysLeft !== null && (
              <>
                &nbsp;•&nbsp; {daysLeft} day
                {daysLeft !== 1 ? "s" : ""} left
              </>
            )}

            &nbsp;•&nbsp;

            <span className="nf-badge">
              {sprint.status}
            </span>
          </p>

          {error && (
            <div className="nf-form-error">
              {error}
            </div>
          )}

          {/* Sprint statistics */}
          <div
            className="nf-stat-grid"
            style={{ marginBottom: 14 }}
          >
            {COLUMNS.map((c) => (
              <div
                className="nf-card"
                key={c}
              >
                <div className="nf-stat-label">
                  {c}
                </div>

                <div className="nf-stat-value">
                  {counts[c]}
                </div>
              </div>
            ))}

            <div className="nf-card">
              <div className="nf-stat-label">
                Story Points
              </div>

              <div className="nf-stat-value">
                {completedPoints} / {totalPoints}
              </div>

              <div className="nf-stat-tag">
                {paceStatus}
              </div>
            </div>
          </div>

          {/* Toolbar */}
          <div className="nf-toolbar">
            {sprint.status === "Planned" && (
              <button
                className="nf-btn secondary"
                onClick={() =>
                  changeSprintStatus("Active")
                }
              >
                Start Sprint
              </button>
            )}

            {sprint.status === "Active" && (
              <>
                <button
                  className="nf-btn secondary"
                  onClick={() =>
                    changeSprintStatus("Completed")
                  }
                >
                  Complete Sprint
                </button>

                <button
                  className="nf-btn secondary"
                  onClick={() =>
                    changeSprintStatus("Cancelled")
                  }
                >
                  Cancel Sprint
                </button>
              </>
            )}

            {/* Timeline */}
            <button
              className="nf-btn secondary"
              onClick={() =>
                navigate(
                  `/sprints/${id}/timeline`
                )
              }
            >
              Timeline
            </button>

            {/* Calendar */}
            <button
              className="nf-btn secondary"
              onClick={() =>
                navigate(
                  `/sprints/${id}/calendar`
                )
              }
            >
              Calendar
            </button>

            {/* Board/List toggle */}
            <div
              className="nf-cal-toggle"
              style={{ marginLeft: 8 }}
            >
              <button
                className={
                  boardView === "Board"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setBoardView("Board")
                }
              >
                Board View
              </button>

              <button
                className={
                  boardView === "List"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setBoardView("List")
                }
              >
                List View
              </button>
            </div>
          </div>

          {/* =====================================================
              BOARD VIEW
              ===================================================== */}
          {boardView === "Board" ? (
            <div className="nf-kanban-board">
              {COLUMNS.map((col) => (
                <div
                  className="nf-kanban-column"
                  key={col}
                >
                  <div className="nf-kanban-column-header">
                    <span>{col}</span>

                    <span className="nf-badge">
                      {counts[col]}
                    </span>
                  </div>

                  <div className="nf-kanban-column-body">
                    {tasks
                      .filter(
                        (t) => t.status === col
                      )
                      .map((task) => {
                        const idx =
                          COLUMNS.indexOf(
                            task.status
                          );

                        const prev =
                          idx > 0
                            ? COLUMNS[idx - 1]
                            : null;

                        const next =
                          idx <
                          COLUMNS.length - 1
                            ? COLUMNS[idx + 1]
                            : null;

                        return (
                          <div
                            key={task.id}
                            className="nf-kanban-card"
                            onClick={() =>
                              navigate(
                                `/tasks/${task.id}`
                              )
                            }
                          >
                            <div className="nf-kanban-card-title">
                              {task.title}
                            </div>

                            <div className="nf-kanban-card-meta">
                              <span
                                className={`nf-badge ${
                                  PRIORITY_CLASS[
                                    task.priority
                                  ] || ""
                                }`}
                              >
                                {task.priority}
                              </span>

                              {task.storyPoints >
                                0 && (
                                <span className="nf-badge">
                                  {task.storyPoints} pts
                                </span>
                              )}
                            </div>

                            {task.assignee && (
                              <div className="nf-kanban-card-assignee">
                                👤{" "}
                                {task.assignee.name}
                              </div>
                            )}

                            {task.dueDate && (
                              <div className="nf-kanban-card-due">
                                Due {task.dueDate}
                              </div>
                            )}

                            <div
                              className="nf-kanban-card-actions"
                              onClick={(e) =>
                                e.stopPropagation()
                              }
                            >
                              {prev && (
                                <button
                                  className="nf-link-btn"
                                  onClick={() =>
                                    moveTask(
                                      task,
                                      prev
                                    )
                                  }
                                >
                                  ← {prev}
                                </button>
                              )}

                              {next && (
                                <button
                                  className="nf-link-btn"
                                  onClick={() =>
                                    moveTask(
                                      task,
                                      next
                                    )
                                  }
                                >
                                  {next} →
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}

                    {counts[col] === 0 && (
                      <div className="nf-kanban-empty">
                        No tasks
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* =================================================
               LIST VIEW
               ================================================= */
            <div className="nf-table-wrap">
              <table className="nf-table">
                <thead>
                  <tr>
                    <th>Key</th>
                    <th>Summary</th>
                    <th>Assignee</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Story Points</th>
                    <th>Due Date</th>
                  </tr>
                </thead>

                <tbody>
                  {tasks.map((task) => (
                    <tr
                      key={task.id}
                      className="clickable"
                      onClick={() =>
                        navigate(
                          `/tasks/${task.id}`
                        )
                      }
                    >
                      <td>
                        <b>
                          NF-{100 + task.id}
                        </b>
                      </td>

                      <td>
                        {task.title}
                      </td>

                      <td>
                        {task.assignee?.name ||
                          "Unassigned"}
                      </td>

                      <td>
                        <span
                          className={`nf-badge ${
                            PRIORITY_CLASS[
                              task.priority
                            ] || ""
                          }`}
                        >
                          {task.priority ||
                            "Medium"}
                        </span>
                      </td>

                      <td>
                        <span className="nf-badge">
                          {task.status ||
                            "To Do"}
                        </span>
                      </td>

                      <td>
                        {task.storyPoints ?? 0}
                      </td>

                      <td>
                        {task.dueDate || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {tasks.length === 0 && (
                <div className="nf-empty-state">
                  No tasks in this sprint.
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      <Footer />

      {/* Create Task Modal */}
      <Modal
        open={modalOpen}
        onClose={() =>
          setModalOpen(false)
        }
        title="Create Task"
        wide
      >
        <form onSubmit={handleCreateTask}>
          <FormShell
            asPanel={false}
            main={
              <>
                <div className="nf-field">
                  <label>Title</label>

                  <input
                    name="title"
                    value={form.title}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="nf-field">
                  <label>Description</label>

                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleFormChange}
                    placeholder="Describe the task..."
                  />
                </div>
              </>
            }
            sidebar={
              <>
                <div className="nf-field">
                  <label>Assigned To</label>

                  <select
                    name="assigneeId"
                    value={form.assigneeId}
                    onChange={handleFormChange}
                  >
                    <option value="">
                      Unassigned
                    </option>

                    {members.map((m) => (
                      <option
                        key={m.id}
                        value={m.id}
                      >
                        {m.name} — {m.role}
                      </option>
                    ))}
                  </select>

                  {members.length === 0 && (
                    <div className="nf-field-error">
                      No team members found for
                      this project.
                    </div>
                  )}
                </div>

                <div className="nf-field">
                  <label>Priority</label>

                  <select
                    name="priority"
                    value={form.priority}
                    onChange={handleFormChange}
                  >
                    {PRIORITIES.map((p) => (
                      <option
                        key={p}
                        value={p}
                      >
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="nf-field">
                  <label>Story Points</label>

                  <input
                    name="storyPoints"
                    type="number"
                    min="0"
                    value={form.storyPoints}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="nf-field">
                  <label>Due Date</label>

                  <input
                    name="dueDate"
                    type="date"
                    value={form.dueDate}
                    onChange={handleFormChange}
                  />
                </div>
              </>
            }
            actions={
              <>
                <button
                  type="submit"
                  className="nf-btn"
                  disabled={saving}
                >
                  {saving
                    ? "Creating..."
                    : "Create Task"}
                </button>

                <button
                  type="button"
                  className="nf-btn secondary"
                  onClick={() =>
                    setModalOpen(false)
                  }
                >
                  Cancel
                </button>
              </>
            }
          />
        </form>
      </Modal>
    </div>
  );
};

export default SprintDetails;