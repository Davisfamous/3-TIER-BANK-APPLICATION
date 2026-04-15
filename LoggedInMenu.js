import { NavLink, useNavigate } from "react-router-dom";
import "../css/LoggedInMenu.css";

export default function LoggedInMenu() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("authUser");
    navigate("/login");
  };

  return (
    <nav className="loggedin-menu">
      <NavLink to="/" className="menu-link">
        Home
      </NavLink>
      <NavLink to="/Accountpage" className="menu-link">
        Dashboard
      </NavLink>
      <NavLink to="/AccountDetails" className="menu-link">
        Account Details
      </NavLink>
      <NavLink to="/transactions" className="menu-link">
        Transactions
      </NavLink>
      <NavLink to="/Savingsbenefits" className="menu-link">
        Savings Benefits
      </NavLink>
      <NavLink to="/createAccount" className="menu-link">
        Create Account
      </NavLink>
      <button type="button" className="menu-logout-btn" onClick={handleLogout}>
        Logout
      </button>
    </nav>
  );
}
