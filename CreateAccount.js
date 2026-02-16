import { useState } from "react";
import "./css/CreateAccount.css";
import { createAccount } from "./api/bankApi";
import { Link, useNavigate } from "react-router-dom";

export default function CreateAccount() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    password: "",
    type: "CURRENT",
    overdraftLimit: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [createdAccount, setCreatedAccount] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setCreatedAccount(null);
    setLoading(true);

    try {
      const firstName = form.firstName.trim().toLowerCase();
      const lastName = form.lastName.trim().toLowerCase();
      const password = form.password;
      const customerName = `${firstName} ${lastName}`.trim();

      if (!firstName || !lastName || !password) {
        throw new Error("First name, last name, and password are required");
      }

      const response = await createAccount({
        customerName,
        firstName,
        lastName,
        password,
        type: form.type,
        overdraftLimit: form.type === "CURRENT" ? form.overdraftLimit : null
      });

      const accountData = response?.data;
      const accountNumber = accountData?.accountNumber;

      if (!accountNumber) {
        throw new Error("Backend did not return account number");
      }

      setCreatedAccount({
        id: accountData.id,
        customerName: accountData.customerName || customerName,
        accountNumber: accountNumber,
        type: accountData.type,
        overdraftLimit: accountData.overdraftLimit
      });

      const authUser = {
        ...(accountData || {}),
        firstName,
        lastName,
        customerName
      };
      localStorage.setItem("authUser", JSON.stringify(authUser));
    } catch (err) {
      setError(err.response?.data || err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-account-container">
      <form className="create-account-card" onSubmit={submit}>
        <h2>Create a New Account</h2>
        <p className="subtitle">Open a secure account with Apex Bank</p>

        {error && <div className="error">{error}</div>}

        <label>First Name</label>
        <input
          type="text"
          name="firstName"
          placeholder="John"
          value={form.firstName}
          onChange={handleChange}
          required
        />

        <label>Last Name</label>
        <input
          type="text"
          name="lastName"
          placeholder="Doe"
          value={form.lastName}
          onChange={handleChange}
          required
        />

        <label>Password</label>
        <input
          type="password"
          name="password"
          placeholder="Create a password"
          value={form.password}
          onChange={handleChange}
          required
        />

        <label>Account Type</label>
        <select name="type" value={form.type} onChange={handleChange}>
          <option value="CURRENT">Current Account</option>
          <option value="SAVINGS">Savings Account</option>
        </select>

        {form.type === "CURRENT" && (
          <>
            <label>Overdraft Limit (£)</label>
            <input
              type="number"
              name="overdraftLimit"
              placeholder="500"
              value={form.overdraftLimit}
              onChange={handleChange}
            />
          </>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Account"}
        </button>

        {createdAccount && (
          <div className="account-output">
            <h3>Account Created</h3>
            <p>
              <strong>Customer:</strong> {createdAccount.customerName}
            </p>
            <p>
              <strong>Account ID:</strong> {createdAccount.id}
            </p>
            <p>
              <strong>Account Number:</strong> {createdAccount.accountNumber}
            </p>
            <p>
              <strong>Type:</strong> {createdAccount.type}
            </p>
            <p>
              <strong>Overdraft Limit:</strong> {createdAccount.overdraftLimit}
            </p>
            <Link to="/Accountpage" className="account-page-link">
              Go to Account Page
            </Link>
          </div>
        )}

        <span className="back-link" onClick={() => navigate("/")}>
          Back to Home
        </span>
      </form>
    </div>
  );
}
