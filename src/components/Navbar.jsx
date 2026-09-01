import { useNavigate } from "react-router-dom";
import { getCurrentUser, logout } from "../services/userService";

const Navbar = ({ milestoneLabel = "Milestone 1: Project & User Management" }) => {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="nf-navbar">
      <div className="nf-navbar-brand">NeuroForge Nexus</div>
      <div className="nf-navbar-milestone">{milestoneLabel}</div>
      <div className="nf-navbar-right">
        <span>{user?.name || "Admin"}</span>
        <span className="nf-navbar-divider">|</span>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </header>
  );
};

export default Navbar;