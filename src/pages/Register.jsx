import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../services/userService";

const ROLES = ["Admin", "Project Manager", "Developer", "Tester", "DevOps Engineer"];

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Developer",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Full name is required";
    if (!form.email.trim()) {
      next.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      next.email = "Enter a valid email address";
    }
    if (!form.password) {
      next.password = "Password is required";
    } else if (form.password.length < 6) {
      next.password = "Password must be at least 6 characters";
    }
    if (form.confirmPassword !== form.password) {
      next.confirmPassword = "Passwords do not match";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    if (!validate()) return;

    setLoading(true);
    try {
      const { confirmPassword, ...payload } = form;
      await register(payload);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setServerError(
        err?.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="nf-auth-wrap">
      <div className="nf-auth-card">
        <div className="nf-auth-brand">NeuroForge Nexus</div>
        <p className="nf-auth-sub">Create your account to join the platform</p>

        {serverError && <div className="nf-form-error">{serverError}</div>}
        {success && (
          <div
            className="nf-form-error"
            style={{
              background: "rgba(52,211,153,0.1)",
              borderColor: "rgba(52,211,153,0.35)",
              color: "#6ee7b7",
            }}
          >
            Account created successfully. Redirecting to sign in...
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="nf-field">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Jane Doe"
              value={form.name}
              onChange={handleChange}
              autoComplete="name"
            />
            {errors.name && <div className="nf-field-error">{errors.name}</div>}
          </div>

          <div className="nf-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@company.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="username"
            />
            {errors.email && <div className="nf-field-error">{errors.email}</div>}
          </div>

          <div className="nf-field">
            <label htmlFor="role">Role</label>
            <select id="role" name="role" value={form.role} onChange={handleChange}>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className="nf-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
            />
            {errors.password && <div className="nf-field-error">{errors.password}</div>}
          </div>

          <div className="nf-field">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={form.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
            />
            {errors.confirmPassword && (
              <div className="nf-field-error">{errors.confirmPassword}</div>
            )}
          </div>

          <button type="submit" className="nf-btn nf-auth-submit" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <div className="nf-auth-switch">
          Already have an account? <a onClick={() => navigate("/login")}>Sign in</a>
        </div>
      </div>
    </div>
  );
};

export default Register;