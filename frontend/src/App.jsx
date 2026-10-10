import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ProjectDashboard from "./pages/ProjectDashboard";
import ComingSoon from "./pages/ComingSoon";

import UserProfile from "./pages/user/UserProfile";
import UserList from "./pages/user/UserList";
import UserManagement from "./pages/user/UserManagement";
import UserDetails from "./pages/user/UserDetails";
import EditUser from "./pages/user/EditUser";

import ProjectList from "./pages/project/ProjectList";
import CreateProject from "./pages/project/CreateProject";
import ProjectDetails from "./pages/project/ProjectDetails";
import ProjectSettings from "./pages/project/ProjectSettings";

import TeamManagement from "./pages/team/TeamManagement";
import CreateTeam from "./pages/team/CreateTeam";
import SelectMembers from "./pages/team/SelectMembers";
import TeamDetails from "./pages/team/TeamDetails";
import TeamMembers from "./pages/team/TeamMembers";

import SprintManagement from "./pages/SprintManagement";
import SprintDetails from "./pages/SprintDetails";

import TaskManagement from "./pages/tasks/TaskManagement";
import CreateTask from "./pages/tasks/CreateTask";
import TaskDetails from "./pages/tasks/TaskDetails";
import EditTask from "./pages/tasks/EditTask";
import SubTaskList from "./pages/tasks/SubTaskList";
import CreateSubTask from "./pages/tasks/CreateSubTask";
import SubTaskDetails from "./pages/tasks/SubTaskDetails";
import TimelineView from "./pages/tasks/TimelineView";
import CalendarView from "./pages/tasks/CalendarView";
import ListView from "./pages/tasks/ListView";

import MilestoneTracking from "./pages/milestone/MilestoneTracking";
import CreateMilestone from "./pages/milestone/CreateMilestone";
import MilestoneDetails from "./pages/milestone/MilestoneDetails";
import BugTracker from "./pages/testing/BugTracker";
import RepositoryBrowser from "./pages/github/RepositoryBrowser";
import Pipelines from "./pages/Pipelines";
import Deployments from "./pages/Deployments";
import Monitoring from "./pages/Monitoring";
import Releases from "./pages/Releases";
import DeliveryDashboard from "./pages/DeliveryDashboard";

import ChatWidget from "./components/ChatWidget";
import { isAuthenticated } from "./services/userService";

const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
};

const guard = (element) => <ProtectedRoute>{element}</ProtectedRoute>;

function App() {
  return (
    <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/dashboard" element={guard(<ProjectDashboard />)} />
        <Route path="/profile" element={guard(<UserProfile />)} />

        {/* Users */}
        <Route path="/users" element={guard(<UserList />)} />
        <Route path="/users/management" element={guard(<UserManagement />)} />
        <Route path="/users/:id" element={guard(<UserDetails />)} />
        <Route path="/users/:id/edit" element={guard(<EditUser />)} />

        {/* Projects */}
        <Route path="/projects" element={guard(<ProjectList />)} />
        <Route path="/projects/create" element={guard(<CreateProject />)} />
        <Route path="/projects/:id" element={guard(<ProjectDetails />)} />
        <Route path="/projects/:projectId/sprints" element={guard(<SprintManagement />)} />
        <Route path="/projects/:projectId/teams" element={guard(<TeamManagement />)} />
        <Route path="/projects/:projectId/code" element={guard(<RepositoryBrowser />)} />
        <Route path="/projects/:projectId/settings" element={guard(<ProjectSettings />)} />

        {/* Teams */}
        <Route path="/teams" element={guard(<TeamManagement />)} />
        <Route path="/teams/create" element={guard(<CreateTeam />)} />
        <Route path="/teams/select-members" element={guard(<SelectMembers />)} />
        <Route path="/teams/:id" element={guard(<TeamDetails />)} />
        <Route path="/teams/:id/members" element={guard(<TeamMembers />)} />

        {/* Sprints: list, Kanban board, other views */}
        <Route path="/sprints" element={guard(<SprintManagement />)} />
        <Route path="/sprints/:id" element={guard(<SprintDetails />)} />
        <Route path="/sprints/:sprintId/timeline" element={guard(<TimelineView />)} />
        <Route path="/sprints/:sprintId/calendar" element={guard(<CalendarView />)} />
        <Route path="/sprints/:sprintId/list" element={guard(<ListView />)} />

        {/* Tasks */}
        <Route path="/sprints/:sprintId/tasks" element={guard(<TaskManagement />)} />
        <Route path="/sprints/:sprintId/tasks/create" element={guard(<CreateTask />)} />
        <Route path="/tasks/:id" element={guard(<TaskDetails />)} />
        <Route path="/tasks/:id/edit" element={guard(<EditTask />)} />

        {/* Subtasks */}
        <Route path="/tasks/:taskId/subtasks" element={guard(<SubTaskList />)} />
        <Route path="/tasks/:taskId/subtasks/create" element={guard(<CreateSubTask />)} />
        <Route path="/subtasks/:id" element={guard(<SubTaskDetails />)} />

        {/* Milestones */}
        <Route path="/milestones" element={guard(<MilestoneTracking />)} />
        <Route path="/milestones/create" element={guard(<CreateMilestone />)} />
        <Route path="/milestones/:id" element={guard(<MilestoneDetails />)} />

        {/* Delivery */}
        <Route path="/delivery" element={guard(<DeliveryDashboard />)} />
        <Route path="/testing" element={guard(<BugTracker />)} />
        <Route path="/cicd" element={guard(<ComingSoon title="CI/CD" />)} />
        <Route path="/pipelines" element={guard(<Pipelines />)} />
        <Route path="/deployments" element={guard(<Deployments />)} />
        <Route path="/monitoring" element={guard(<Monitoring />)} />
        <Route path="/releases" element={guard(<Releases />)} />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>

      <ChatWidget />
    </BrowserRouter>
  );
}

export default App;