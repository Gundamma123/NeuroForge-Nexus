import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/userService";

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const next = {};
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
      await login(form);
      navigate("/dashboard");
    } catch (err) {
      setServerError(
        err?.response?.data?.message || "Invalid email or password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="nf-auth-wrap">
      <div className="nf-auth-card">
        <div className="nf-auth-brand">NeuroForge Nexus</div>
        <p className="nf-auth-sub">Sign in to access the SDLC management platform</p>

        {serverError && <div className="nf-form-error">{serverError}</div>}

        <form onSubmit={handleSubmit} noValidate>
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
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
            />
            {errors.password && <div className="nf-field-error">{errors.password}</div>}
          </div>

          <button type="submit" className="nf-btn nf-auth-submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="nf-auth-switch">
          Don't have an account? <a onClick={() => navigate("/register")}>Create one</a>
        </div>
      </div>
    </div>
  );
};

export default Login;