import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "./api/bankApi";
import "./css/LoginPage.css";

const getErrorMessage = (err, fallback) => {
  const apiError = err?.response?.data;
  if (typeof apiError === "string") return apiError;
  if (apiError && typeof apiError === "object") {
    if (typeof apiError.message === "string" && apiError.message.trim()) {
      return apiError.message;
    }
    return fallback;
  }
  if (typeof err?.message === "string" && err.message.trim()) return err.message;
  return fallback;
};

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        firstName: form.firstName.trim().toLowerCase(),
        lastName: form.lastName.trim().toLowerCase(),
        password: form.password
      };

      const response = await loginUser(payload);
      const authUser = {
        ...(response.data || {}),
        firstName: response.data?.firstName || payload.firstName,
        lastName: response.data?.lastName || payload.lastName
      };
      localStorage.setItem("authUser", JSON.stringify(authUser));
      navigate("/Accountpage");
    } catch (err) {
      setError(getErrorMessage(err, "Invalid login details"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      <form className="login-page-card" onSubmit={handleSubmit}>
        <h2>Login</h2>
        <p className="login-subtitle">Enter your details to continue</p>

        {error && <div className="login-error">{error}</div>}

        <label>First Name</label>
        <input
          type="text"
          name="firstName"
          value={form.firstName}
          onChange={handleChange}
          required
        />

        <label>Last Name</label>
        <input
          type="text"
          name="lastName"
          value={form.lastName}
          onChange={handleChange}
          required
        />

        <label>Password</label>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <Link to="/createAccount" className="login-create-link">
          Need an account? Create one
        </Link>
      </form>
    </div>
  );
}
