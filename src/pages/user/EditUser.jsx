import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import api from "../../services/api";

const ROLES = ["Admin", "Project Manager", "Developer", "Tester", "DevOps Engineer"];

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", role: "Developer" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/users/${id}`)
      .then(({ data }) => setForm(data))
      .catch(() => setError("Unable to load this user."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.put(`/users/${id}`, form);
      navigate("/dashboard");
    } catch {
      setError("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="nf-app">
      <Navbar />
      <div className="nf-body">
        <Sidebar />
        <main className="nf-main">
          <h1 className="nf-page-title">Edit User</h1>
          <div className="nf-panel" style={{ maxWidth: 420 }}>
            {loading ? (
              <p className="nf-detail-row">Loading...</p>
            ) : (
              <form onSubmit={handleSave}>
                {error && <div className="nf-form-error">{error}</div>}
                <div className="nf-field">
                  <label>Name</label>
                  <input name="name" value={form.name} onChange={handleChange} />
                </div>
                <div className="nf-field">
                  <label>Email</label>
                  <input name="email" value={form.email} onChange={handleChange} />
                </div>
                <div className="nf-field">
                  <label>Role</label>
                  <select name="role" value={form.role} onChange={handleChange}>
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <button className="nf-btn" disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </form>
            )}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default EditUser;