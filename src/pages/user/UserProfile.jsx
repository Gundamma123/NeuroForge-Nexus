import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import { getCurrentUser } from "../../services/userService";

const UserProfile = () => {
  const user = getCurrentUser() || { name: "—", email: "—", role: "—" };

  return (
    <div className="nf-app">
      <Navbar />
      <div className="nf-body">
        <Sidebar />
        <main className="nf-main">
          <h1 className="nf-page-title">My Profile</h1>
          <div className="nf-panel">
            <div className="nf-detail-row">Name: <b>{user.name}</b></div>
            <div className="nf-detail-row">Email: <b>{user.email}</b></div>
            <div className="nf-detail-row">Role: <b>{user.role}</b></div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default UserProfile;