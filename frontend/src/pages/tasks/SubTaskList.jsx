// import { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import Navbar from "../../components/Navbar";
// import Sidebar from "../../components/Sidebar";
// import Footer from "../../components/Footer";
// import { getTaskById } from "../../services/taskService";
// import { getSubTasksByTask, updateSubTask, deleteSubTask } from "../../services/subTaskService";

// const STATUSES = ["Pending", "In Progress", "Completed"];

// const SubTaskList = () => {
//   const { taskId } = useParams();
//   const navigate = useNavigate();
//   const [task, setTask] = useState(null);
//   const [subTasks, setSubTasks] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const load = () => {
//     Promise.all([getTaskById(taskId), getSubTasksByTask(taskId)])
//       .then(([taskData, subTaskData]) => {
//         setTask(taskData);
//         setSubTasks(Array.isArray(subTaskData) ? subTaskData : []);
//       })
//       .catch(() => setError("Unable to load subtasks."))
//       .finally(() => setLoading(false));
//   };

//   useEffect(() => {
//     load();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [taskId]);

//   const handleStatusChange = async (subTask, newStatus) => {
//     setSubTasks((prev) => prev.map((s) => (s.id === subTask.id ? { ...s, status: newStatus } : s)));
//     try {
//       await updateSubTask(subTask.id, {
//         title: subTask.title, taskId: Number(taskId), assigneeId: subTask.assignee?.id || null,
//         status: newStatus, dueDate: subTask.dueDate,
//       });
//     } catch {
//       setError("Failed to update status.");
//       load();
//     }
//   };

//   const handleDelete = async (id) => {
//     try {
//       await deleteSubTask(id);
//       setSubTasks((prev) => prev.filter((s) => s.id !== id));
//     } catch {
//       setError("Failed to delete subtask.");
//     }
//   };

//   if (loading) {
//     return (
//       <div className="nf-app"><Navbar /><div className="nf-body"><Sidebar />
//         <main className="nf-main"><div className="nf-loading">Loading subtasks...</div></main>
//       </div><Footer /></div>
//     );
//   }

//   const completed = subTasks.filter((s) => s.status === "Completed").length;
//   const progress = subTasks.length > 0 ? Math.round((completed / subTasks.length) * 100) : 0;

//   return (
//     <div className="nf-app">
//       <Navbar />
//       <div className="nf-body">
//         <Sidebar />
//         <main className="nf-main">
//           <span className="nf-back-link" onClick={() => navigate(`/tasks/${taskId}`)}>← Back to Task</span>
//           <h1 className="nf-page-title">{task?.title} — Subtasks</h1>

//           {error && <div className="nf-form-error">{error}</div>}

//           <div className="nf-panel">
//             <div className="nf-toolbar">
//               {subTasks.length > 0 && (
//                 <div className="nf-detail-row" style={{ margin: 0 }}>
//                   {completed}/{subTasks.length} Completed — {progress}%
//                 </div>
//               )}
//               <div style={{ flex: 1 }} />
//               <button className="nf-btn" onClick={() => navigate(`/tasks/${taskId}/subtasks/create`)}>
//                 + Add Subtask
//               </button>
//             </div>

//             <div className="nf-table-wrap">
//               <table className="nf-table">
//                 <thead>
//                   <tr>
//                     <th style={{ width: 36 }}></th>
//                     <th>Title</th>
//                     <th>Assignee</th>
//                     <th>Status</th>
//                     <th>Due Date</th>
//                     <th>Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {subTasks.map((s) => (
//                     <tr key={s.id}>
//                       <td>
//                         <input
//                           type="checkbox"
//                           checked={s.status === "Completed"}
//                           onChange={() => handleStatusChange(s, s.status === "Completed" ? "Pending" : "Completed")}
//                         />
//                       </td>
//                       <td style={{ textDecoration: s.status === "Completed" ? "line-through" : "none" }}>{s.title}</td>
//                       <td>{s.assignee?.name || "Unassigned"}</td>
//                       <td>
//                         <select
//                           className="nf-inline-select"
//                           value={s.status}
//                           onChange={(e) => handleStatusChange(s, e.target.value)}
//                         >
//                           {STATUSES.map((st) => <option key={st} value={st}>{st}</option>)}
//                         </select>
//                       </td>
//                       <td>{s.dueDate || "—"}</td>
//                       <td>
//                         <div className="nf-table-actions">
//                           <button className="nf-link-btn" onClick={() => navigate(`/subtasks/${s.id}`)}>View</button>
//                           <button className="nf-link-btn danger" onClick={() => handleDelete(s.id)}>Delete</button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//               {subTasks.length === 0 && <div className="nf-empty-state">No subtasks found for this task.</div>}
//             </div>
//           </div>
//         </main>
//       </div>
//       <Footer />
//     </div>
//   );
// };

// export default SubTaskList;



import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import { getTaskById } from "../../services/taskService";
import { getSubTasksByTask, updateSubTask, deleteSubTask } from "../../services/subTaskService";

const STATUSES = ["Pending", "In Progress", "Completed"];
const TIERS = ["Database", "Backend", "Frontend", "Cross-Functional"];
const TIER_PREFIX = { Database: "DB", Backend: "BE", Frontend: "FE", "Cross-Functional": "XF" };
const TIER_CLASS = { Database: "role-devops", Backend: "role-dev", Frontend: "role-pm", "Cross-Functional": "role-tester" };

const SubTaskList = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [subTasks, setSubTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    Promise.all([getTaskById(taskId), getSubTasksByTask(taskId)])
      .then(([taskData, subTaskData]) => {
        setTask(taskData);
        setSubTasks(Array.isArray(subTaskData) ? subTaskData : []);
      })
      .catch(() => setError("Unable to load subtasks."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId]);

  const handleStatusChange = async (subTask, newStatus) => {
    setSubTasks((prev) => prev.map((s) => (s.id === subTask.id ? { ...s, status: newStatus } : s)));
    try {
      await updateSubTask(subTask.id, {
        title: subTask.title, taskId: Number(taskId), assigneeId: subTask.assignee?.id || null,
        tier: subTask.tier, status: newStatus, dueDate: subTask.dueDate,
      });
    } catch {
      setError("Failed to update status.");
      load();
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteSubTask(id);
      setSubTasks((prev) => prev.filter((s) => s.id !== id));
    } catch {
      setError("Failed to delete subtask.");
    }
  };

  if (loading) {
    return (
      <div className="nf-app"><Navbar /><div className="nf-body"><Sidebar />
        <main className="nf-main"><div className="nf-loading">Loading subtasks...</div></main>
      </div><Footer /></div>
    );
  }

  const completed = subTasks.filter((s) => s.status === "Completed").length;
  const progress = subTasks.length > 0 ? Math.round((completed / subTasks.length) * 100) : 0;

  return (
    <div className="nf-app">
      <Navbar />
      <div className="nf-body">
        <Sidebar />
        <main className="nf-main">
          <span className="nf-back-link" onClick={() => navigate(`/tasks/${taskId}`)}>← Back to Task</span>
          <h1 className="nf-page-title">{task?.title} — Subtasks</h1>

          {error && <div className="nf-form-error">{error}</div>}

          <div className="nf-panel">
            <div className="nf-toolbar">
              {subTasks.length > 0 && (
                <div className="nf-detail-row" style={{ margin: 0 }}>
                  {completed}/{subTasks.length} Completed — {progress}%
                </div>
              )}
              <div style={{ flex: 1 }} />
              <button className="nf-btn" onClick={() => navigate(`/tasks/${taskId}/subtasks/create`)}>
                + Add Subtask
              </button>
            </div>

            {TIERS.map((tier) => {
              const tierSubTasks = subTasks.filter((s) => (s.tier || "Cross-Functional") === tier);
              if (tierSubTasks.length === 0) return null;
              return (
                <div key={tier} style={{ marginBottom: 18 }}>
                  <h3 style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span className={`nf-badge ${TIER_CLASS[tier]}`}>{TIER_PREFIX[tier]}</span>
                    {tier}
                  </h3>
                  <table className="nf-table">
                    <thead>
                      <tr>
                        <th style={{ width: 36 }}></th>
                        <th>Title</th>
                        <th>Owner</th>
                        <th>Status</th>
                        <th>Due Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tierSubTasks.map((s) => (
                        <tr key={s.id}>
                          <td>
                            <input
                              type="checkbox"
                              checked={s.status === "Completed"}
                              onChange={() => handleStatusChange(s, s.status === "Completed" ? "Pending" : "Completed")}
                            />
                          </td>
                          <td style={{ textDecoration: s.status === "Completed" ? "line-through" : "none" }}>{s.title}</td>
                          <td>{s.assignee?.name || "Unassigned"}</td>
                          <td>
                            <select
                              className="nf-inline-select"
                              value={s.status}
                              onChange={(e) => handleStatusChange(s, e.target.value)}
                            >
                              {STATUSES.map((st) => <option key={st} value={st}>{st}</option>)}
                            </select>
                          </td>
                          <td>{s.dueDate || "—"}</td>
                          <td>
                            <div className="nf-table-actions">
                              <button className="nf-link-btn" onClick={() => navigate(`/subtasks/${s.id}`)}>View</button>
                              <button className="nf-link-btn danger" onClick={() => handleDelete(s.id)}>Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })}

            {subTasks.length === 0 && <div className="nf-empty-state">No subtasks found for this task.</div>}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default SubTaskList;