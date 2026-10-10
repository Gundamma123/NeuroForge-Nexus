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
import ProjectList from "./pages/project/ProjectList";
import CreateProject from "./pages/project/CreateProject";
import ProjectDetails from "./pages/project/ProjectDetails";
import TeamManagement from "./pages/team/TeamManagement";
import CreateTeam from "./pages/team/CreateTeam";
import SelectMembers from "./pages/team/SelectMembers";
import TeamDetails from "./pages/team/TeamDetails";
import TeamMembers from "./pages/team/TeamMembers";
import SprintPlanning from "./pages/sprint/SprintPlanning";
import CreateSprint from "./pages/sprint/CreateSprint";
import SprintDetails from "./pages/sprint/SprintDetails";
import SprintBoardPage from "./pages/sprint/SprintBoardPage";
import { isAuthenticated } from "./services/userService";
import ChatWidget from "./components/ChatWidget";
import Repositories from "./pages/github/Repositories";

import Pipelines from "./pages/Pipelines";
import Monitoring from "./pages/Monitoring";
import Deployments from "./pages/Deployments";
import Releases from "./pages/Releases";

import RepositoryBrowser from "./pages/github/RepositoryBrowser";
import ProjectSettings from "./pages/project/ProjectSettings";
import BugTracker from "./pages/testing/BugTracker";


const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <BrowserRouter future={{ v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />

        <Route path="/users" element={<ProtectedRoute><UserList /></ProtectedRoute>} />
        <Route path="/users/management" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
        <Route path="/users/:id" element={<ProtectedRoute><UserDetails /></ProtectedRoute>} />
        <Route path="/users/:id/edit" element={<ProtectedRoute><EditUser /></ProtectedRoute>} />

        <Route path="/projects" element={<ProtectedRoute><ProjectList /></ProtectedRoute>} />
        <Route path="/projects/create" element={<ProtectedRoute><CreateProject /></ProtectedRoute>} />
        <Route path="/projects/:id" element={<ProtectedRoute><ProjectDetails /></ProtectedRoute>} />
        <Route path="/projects/:projectId/sprints" element={<ProtectedRoute><SprintPlanning /></ProtectedRoute>} />

        <Route path="/teams" element={<ProtectedRoute><TeamManagement /></ProtectedRoute>} />
        <Route path="/teams/create" element={<ProtectedRoute><CreateTeam /></ProtectedRoute>} />
        <Route path="/teams/select-members" element={<ProtectedRoute><SelectMembers /></ProtectedRoute>} />
        <Route path="/teams/:id" element={<ProtectedRoute><TeamDetails /></ProtectedRoute>} />
        <Route path="/teams/:id/members" element={<ProtectedRoute><TeamMembers /></ProtectedRoute>} />

        <Route path="/sprints" element={<ProtectedRoute><SprintPlanning /></ProtectedRoute>} />
        <Route path="/sprints/create" element={<ProtectedRoute><CreateSprint /></ProtectedRoute>} />
        <Route path="/sprints/:id" element={<ProtectedRoute><SprintDetails /></ProtectedRoute>} />
        <Route path="/sprints/:id/board" element={<ProtectedRoute><SprintBoardPage /></ProtectedRoute>} />

        <Route path="/cicd" element={<ProtectedRoute><ComingSoon title="CI/CD" /></ProtectedRoute>} />
        {/* <Route path="/testing" element={<ProtectedRoute><ComingSoon title="Testing" /></ProtectedRoute>} /> */}
        {/* <Route path="/releases" element={<ProtectedRoute><ComingSoon title="Releases" /></ProtectedRoute>}/>  */}

        <Route path="/testing" element={<ProtectedRoute><BugTracker /></ProtectedRoute>} />
        
        <Route path="/releases" element={<ProtectedRoute><Releases /></ProtectedRoute>} />
        
        
        <Route path="/deployments" element={<ProtectedRoute><Deployments /></ProtectedRoute>} />
        {/* <Route path="/monitoring" element={<ProtectedRoute><ComingSoon title="Monitoring" /></ProtectedRoute>} /> */}
        
        <Route path="/monitoring" element={<ProtectedRoute><Monitoring /></ProtectedRoute>} />

        {/* <Route path="/repositories" element={<ProtectedRoute><Repositories /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/login" replace />} />
        <Route path="/pipelines" element={<ProtectedRoute><Pipelines /></ProtectedRoute>} /> */}
        <Route path="/repositories" element={<ProtectedRoute><Repositories /></ProtectedRoute>} />

<Route path="/pipelines" element={<ProtectedRoute><Pipelines /></ProtectedRoute>} />

<Route path="*" element={<Navigate to="/login" replace />} />




      </Routes>

      <ChatWidget />
    </BrowserRouter>
  );
}

export default App;