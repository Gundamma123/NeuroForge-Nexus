// import { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import Navbar from "../../components/Navbar";
// import Sidebar from "../../components/Sidebar";
// import Footer from "../../components/Footer";
// import { getTaskById } from "../../services/taskService";
// import { createSubTask } from "../../services/subTaskService";
// import { getTeamsByProject } from "../../services/teamService";

// const STATUSES = ["Pending", "In Progress", "Completed"];

// const CreateSubTask = () => {
//   const { taskId } = useParams();
//   const navigate = useNavigate();

//   const [task, setTask] = useState(null);
//   const [members, setMembers] = useState([]);
//   const [error, setError] = useState("");
//   const [saving, setSaving] = useState(false);
//   const TIERS = ["Database", "Backend", "Frontend", "Cross-Functional"];
//   // const [form, setForm] = useState({ title: "", description: "", assigneeId: "", status: "Pending", dueDate: "", tier: "Cross-Functional" });
//   const [form, setForm] = useState({ title: "", description: "", assigneeId: "", tier: "Cross-Functional", status: "Pending", dueDate: "" });

//   useEffect(() => {
//     getTaskById(taskId)
//       .then((data) => {
//         setTask(data);
//         const projectId = data.sprint?.project?.id;
//         if (projectId) {
//           getTeamsByProject(projectId).then((teams) => {
//             const all = (Array.isArray(teams) ? teams : []).flatMap((t) => t.members || []);
//             setMembers(Array.from(new Map(all.map((m) => [m.id, m])).values()));
//           });
//         }
//       })
//       .catch(() => setError("Unable to load task."));
//   }, [taskId]);

//   const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!form.title.trim()) {
//       setError("Subtask title is required.");
//       return;
//     }
//     setSaving(true);
//     setError("");
//     try {
//       await createSubTask({
//         ...form,
//         taskId: Number(taskId),
//         assigneeId: form.assigneeId ? Number(form.assigneeId) : null,
//         dueDate: form.dueDate || null,
//       });
//       navigate(`/tasks/${taskId}/subtasks`);
//     } catch (err) {
//       setError(err?.response?.data?.message || "Failed to create subtask.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <div className="nf-app">
//       <Navbar />
//       <div className="nf-body">
//         <Sidebar />
//         <main className="nf-main">
//           <span className="nf-back-link" onClick={() => navigate(`/tasks/${taskId}/subtasks`)}>
//             ← Back to Subtasks
//           </span>
//           <h1 className="nf-page-title">Add Subtask {task && `— ${task.title}`}</h1>

//           <div className="nf-panel" style={{ maxWidth: 460 }}>
//             {error && <div className="nf-form-error">{error}</div>}

//             <form onSubmit={handleSubmit}>
//               <div className="nf-field"><label>Subtask Title</label><input name="title" value={form.title} onChange={handleChange} required /></div>
//               <div className="nf-field"><label>Description</label><input name="description" value={form.description} onChange={handleChange} /></div>
//               <div className="nf-field">
//                 <label>Assigned To</label>
//                 <select name="assigneeId" value={form.assigneeId} onChange={handleChange}>
//                   <div className="nf-field">
//   <label>Tier</label>
//   <select name="tier" value={form.tier} onChange={handleChange}>
//     {TIERS.map((t) => <option key={t} value={t}>{t}</option>)}
//   </select>
// </div>
//                   <option value="">Unassigned</option>
//                   {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
//                 </select>
//               </div>
//               <div className="nf-field">
//                 <label>Status</label>
//                 <select name="status" value={form.status} onChange={handleChange}>
//                   {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
//                 </select>
//               </div>
//               <div className="nf-field"><label>Due Date</label><input name="dueDate" type="date" value={form.dueDate} onChange={handleChange} /></div>

//               <div className="nf-actions">
//                 <button type="submit" className="nf-btn" disabled={saving}>{saving ? "Creating..." : "Create Subtask"}</button>
//                 <button type="button" className="nf-btn secondary" onClick={() => navigate(`/tasks/${taskId}/subtasks`)}>Cancel</button>
//               </div>
//             </form>
//           </div>
//         </main>
//       </div>
//       <Footer />
//     </div>
//   );
// };

// export default CreateSubTask;
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import { getTaskById } from "../../services/taskService";
import { createSubTask } from "../../services/subTaskService";
import { getTeamsByProject } from "../../services/teamService";
import FormShell from "../../components/FormShell";


const STATUSES = ["Pending", "In Progress", "Completed"];

const CreateSubTask = () => {
const { taskId } = useParams();
const navigate = useNavigate();

const [task, setTask] = useState(null);
const [members, setMembers] = useState([]);
const [error, setError] = useState("");
const [saving, setSaving] = useState(false);
const TIERS = ["Database", "Backend", "Frontend", "Cross-Functional"];
// const [form, setForm] = useState({ title: "", description: "", assigneeId: "", status: "Pending", dueDate: "", tier: "Cross-Functional" });
const [form, setForm] = useState({ title: "", description: "", assigneeId: "", tier: "Cross-Functional", status: "Pending", dueDate: "" });

useEffect(() => {
getTaskById(taskId)
.then((data) => {
setTask(data);
const projectId = data.sprint?.project?.id;
if (projectId) {
getTeamsByProject(projectId).then((teams) => {
const all = (Array.isArray(teams) ? teams : []).flatMap((t) => t.members || []);
setMembers(Array.from(new Map(all.map((m) => [m.id, m])).values()));
});
}
})
.catch(() => setError("Unable to load task."));
}, [taskId]);

const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

const handleSubmit = async (e) => {
e.preventDefault();
if (!form.title.trim()) {
setError("Subtask title is required.");
return;
}
setSaving(true);
setError("");
try {
await createSubTask({
...form,
taskId: Number(taskId),
assigneeId: form.assigneeId ? Number(form.assigneeId) : null,
dueDate: form.dueDate || null,
});
navigate(`/tasks/${taskId}/subtasks`);
} catch (err) {
setError(err?.response?.data?.message || "Failed to create subtask.");
} finally {
setSaving(false);
}
};

// return ( <div className="nf-app"> <Navbar /> <div className="nf-body"> <Sidebar /> <main className="nf-main">
// <span className="nf-back-link" onClick={() => navigate(`/tasks/${taskId}/subtasks`)}>
// ← Back to Subtasks </span> <h1 className="nf-page-title">Add Subtask {task && `— ${task.title}`}</h1>

// ```
//       <div className="nf-panel" style={{ maxWidth: 460 }}>
//         {error && <div className="nf-form-error">{error}</div>}

//         <form onSubmit={handleSubmit}>
//           <div className="nf-field"><label>Subtask Title</label><input name="title" value={form.title} onChange={handleChange} required /></div>
//           <div className="nf-field"><label>Description</label><input name="description" value={form.description} onChange={handleChange} /></div>

//           <div className="nf-field">
//             <label>Assigned To</label>
//             <select name="assigneeId" value={form.assigneeId} onChange={handleChange}>
//               <option value="">Unassigned</option>
//               {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
//             </select>
//           </div>

//           <div className="nf-field">
//             <label>Tier</label>
//             <select name="tier" value={form.tier} onChange={handleChange}>
//               {TIERS.map((t) => <option key={t} value={t}>{t}</option>)}
//             </select>
//           </div>

//           <div className="nf-field">
//             <label>Status</label>
//             <select name="status" value={form.status} onChange={handleChange}>
//               {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
//             </select>
//           </div>

//           <div className="nf-field"><label>Due Date</label><input name="dueDate" type="date" value={form.dueDate} onChange={handleChange} /></div>

//           <div className="nf-actions">
//             <button type="submit" className="nf-btn" disabled={saving}>{saving ? "Creating..." : "Create Subtask"}</button>
//             <button type="button" className="nf-btn secondary" onClick={() => navigate(`/tasks/${taskId}/subtasks`)}>Cancel</button>
//           </div>
//         </form>
//       </div>
//     </main>
//   </div>
//   <Footer />
// </div>


return ( <div className="nf-app">
  <Navbar />
  <div className="nf-body">
    <Sidebar />
    <main className="nf-main">
      <span className="nf-back-link" onClick={() => navigate(`/tasks/${taskId}/subtasks`)}>
        ← Back to Subtasks
      </span>
      <h1 className="nf-page-title">Add Subtask {task && `— ${task.title}`}</h1>

      <div className="nf-panel nf-modal-wide" style={{ maxWidth: 900 }}>
        {error && <div className="nf-form-error">{error}</div>}
        <form onSubmit={handleSubmit}>
  <FormShell
    error={error}
    main={
      <>
        <div className="nf-field"><label>Subtask Title</label><input name="title" value={form.title} onChange={handleChange} required /></div>
        <div className="nf-field"><label>Description</label><textarea name="description" value={form.description} onChange={handleChange} placeholder="Describe this subtask..." /></div>
      </>
    }
    sidebar={
      <>
        <div className="nf-field">
          <label>Assigned To</label>
          <select name="assigneeId" value={form.assigneeId} onChange={handleChange}>
            <option value="">Unassigned</option>
            {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
        <div className="nf-field">
          <label>Status</label>
          <select name="status" value={form.status} onChange={handleChange}>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="nf-field"><label>Due Date</label><input name="dueDate" type="date" value={form.dueDate} onChange={handleChange} /></div>
      </>
    }
    actions={
      <>
        <button type="submit" className="nf-btn" disabled={saving}>{saving ? "Creating..." : "Create Subtask"}</button>
        <button type="button" className="nf-btn secondary" onClick={() => navigate(`/tasks/${taskId}/subtasks`)}>Cancel</button>
      </>
    }
  />
</form>

        
      </div>
    </main>
  </div>
  <Footer />
</div>


);
};

export default CreateSubTask;


