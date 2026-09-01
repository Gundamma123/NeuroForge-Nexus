import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import api from "../../services/api";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/users")
      .then(({ data }) => setUsers(data || []))
      .catch(() => setError("Unable to load users from the User Service."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="nf-app">
      <Navbar />
      <div className="nf-body">
        <Sidebar />
        <main className="nf-main">
          <h1 className="nf-page-title">Registered Users</h1>
          <div className="nf-panel">
            {loading && <p className="nf-detail-row">Loading users...</p>}
            {error && <p className="nf-field-error">{error}</p>}
            {!loading && !error && users.length === 0 && (
              <p className="nf-detail-row">No users found yet.</p>
            )}
            {!loading &&
              users.map((u) => (
                <div className="nf-detail-row" key={u.id}>
                  <b>{u.name}</b> — {u.email} — {u.role}
                </div>
              ))}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default UserList;