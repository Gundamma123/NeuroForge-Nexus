import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ComingSoon from "./pages/ComingSoon";

import UserProfile from "./pages/user/UserProfile";
import UserList from "./pages/user/UserList";
import UserManagement from "./pages/user/UserManagement";
import UserDetails from "./pages/user/UserDetails";
import EditUser from "./pages/user/EditUser";

import TeamManagement from "./pages/team/TeamManagement";
import CreateTeam from "./pages/team/CreateTeam";
import AssignTeam from "./pages/team/AssignTeam";

import ProjectList from "./pages/project/ProjectList";
import CreateProject from "./pages/project/CreateProject";
import ProjectDetails from "./pages/project/ProjectDetails";

import SprintPlanning from "./pages/sprint/SprintPlanning";
import CreateSprint from "./pages/sprint/CreateSprint";
import SprintDetails from "./pages/sprint/SprintDetails";

import MilestoneTracking from "./pages/milestone/MilestoneTracking";
import CreateMilestone from "./pages/milestone/CreateMilestone";
import MilestoneDetails from "./pages/milestone/MilestoneDetails";

import { isAuthenticated } from "./services/userService";

const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />

        {/* User Management */}
        <Route path="/users" element={<ProtectedRoute><UserList /></ProtectedRoute>} />
        <Route path="/users/management" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
        <Route path="/users/:id" element={<ProtectedRoute><UserDetails /></ProtectedRoute>} />
        <Route path="/users/:id/edit" element={<ProtectedRoute><EditUser /></ProtectedRoute>} />

        {/* Project Management */}
        <Route path="/projects" element={<ProtectedRoute><ProjectList /></ProtectedRoute>} />
        <Route path="/projects/create" element={<ProtectedRoute><CreateProject /></ProtectedRoute>} />
        <Route path="/projects/:id" element={<ProtectedRoute><ProjectDetails /></ProtectedRoute>} />

        {/* Team Management */}
        <Route path="/teams" element={<ProtectedRoute><TeamManagement /></ProtectedRoute>} />
        <Route path="/teams/create" element={<ProtectedRoute><CreateTeam /></ProtectedRoute>} />
        <Route path="/teams/assign" element={<ProtectedRoute><AssignTeam /></ProtectedRoute>} />

        {/* Sprint Planning */}
        <Route path="/sprints" element={<ProtectedRoute><SprintPlanning /></ProtectedRoute>} />
        <Route path="/sprints/create" element={<ProtectedRoute><CreateSprint /></ProtectedRoute>} />
        <Route path="/sprints/:id" element={<ProtectedRoute><SprintDetails /></ProtectedRoute>} />

        {/* Milestone Tracking */}
        <Route path="/milestones" element={<ProtectedRoute><MilestoneTracking /></ProtectedRoute>} />
        <Route path="/milestones/create" element={<ProtectedRoute><CreateMilestone /></ProtectedRoute>} />
        <Route path="/milestones/:id" element={<ProtectedRoute><MilestoneDetails /></ProtectedRoute>} />

        {/* Not built in Milestone 1 */}
        <Route path="/cicd" element={<ProtectedRoute><ComingSoon title="CI/CD" /></ProtectedRoute>} />
        <Route path="/testing" element={<ProtectedRoute><ComingSoon title="Testing" /></ProtectedRoute>} />
        <Route path="/releases" element={<ProtectedRoute><ComingSoon title="Releases" /></ProtectedRoute>} />
        <Route path="/monitoring" element={<ProtectedRoute><ComingSoon title="Monitoring" /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;