import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import { getDashboardSummary } from "../services/userService";

const FALLBACK_DATA = {
  activeProjects: 247,
  registeredUsers: 2847,
  activeTeams: 47,
  userService: {
    project: "FinCore Nexus",
    status: "Active",
    teamSize: 12,
    users: "Admin, PM, 5 Devs, 3 Testers, 2 DevOps",
    rbacProvider: "Keycloak",
    roles: "Admin, PM, Dev, QA",
    teams: "Backend, Frontend, QA, DevOps",
    sprint: { name: "Sprint 12", tasks: 23, points: 67 },
    milestone: { name: "Release 2.3", dueDate: "20-Jun-2026" },
  },
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(FALLBACK_DATA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getDashboardSummary()
      .then((res) => {
        if (!cancelled && res) setData(res);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const us = data.userService || FALLBACK_DATA.userService;

  return (
    <div className="nf-app">
      <Navbar />
      <div className="nf-body">
        <Sidebar />
        <main className="nf-main">
          <h1 className="nf-page-title">RBAC &amp; Team Setup</h1>

          <div className="nf-stat-grid">
            <div className="nf-card">
              <div className="nf-stat-label">Active Projects</div>
              <div className="nf-stat-value">{data.activeProjects?.toLocaleString()}</div>
              <div className="nf-stat-tag">Running</div>
            </div>
            <div className="nf-card">
              <div className="nf-stat-label">Users</div>
              <div className="nf-stat-value">{data.registeredUsers?.toLocaleString()}</div>
              <div className="nf-stat-tag">Registered</div>
            </div>
            <div className="nf-card">
              <div className="nf-stat-label">Teams</div>
              <div className="nf-stat-value">{data.activeTeams?.toLocaleString()}</div>
              <div className="nf-stat-tag">Active</div>
            </div>
          </div>

          <div className="nf-panel">
            <h3>User Service - RBAC Management</h3>

            <div className="nf-detail-row">
              Project: <b>{us.project}</b> | Status: <b>{us.status}</b> | Team: <b>{us.teamSize}</b>
            </div>
            <div className="nf-detail-row">Users: {us.users}</div>
            <div className="nf-detail-row">
              RBAC: <b>{us.rbacProvider}</b> | Roles: {us.roles}
            </div>
            <div className="nf-detail-row">Teams: {us.teams}</div>
            <div className="nf-detail-row">
              Sprint: <b>{us.sprint?.name}</b> | {us.sprint?.tasks} tasks | {us.sprint?.points} points
            </div>
            <div className="nf-detail-row">
              Milestone: <b>{us.milestone?.name}</b> | Due: {us.milestone?.dueDate}
            </div>

            <div className="nf-actions">
              <button className="nf-btn" onClick={() => navigate("/projects/create")}>
                Create Project
              </button>
              <button className="nf-btn secondary" onClick={() => navigate("/teams/assign")}>
                Assign Team
              </button>
              <button className="nf-btn secondary" onClick={() => navigate("/sprints/create")}>
                Plan Sprint
              </button>
            </div>
          </div>

          {loading && (
            <p style={{ color: "var(--nf-text-faint)", fontSize: 12, marginTop: 14 }}>
              Syncing with Project Service...
            </p>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;