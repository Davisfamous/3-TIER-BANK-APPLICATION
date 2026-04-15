import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getAccounts } from "./api/bankApi";
import LoggedInMenu from "./components/LoggedInMenu";
import "./css/Accountpage.css";

const resolveAccountList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.accounts)) return payload.accounts;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

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

const normalize = (value) => (value || "").toString().trim().toLowerCase();

const normalizeAccountType = (account) => {
  const rawType = normalize(account?.type);
  if (rawType.includes("current")) return "CURRENT";
  if (rawType.includes("saving")) return "SAVINGS";
  return "";
};

const accountBelongsToUser = (account, authUser) => {
  if (!authUser) return false;

  const authIds = [authUser?.userId, authUser?.id, authUser?.customerId]
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value) && value > 0);

  const accountIds = [
    account?.userId,
    account?.customerId,
    account?.ownerId,
    account?.customer?.id
  ]
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value) && value > 0);

  if (authIds.length && accountIds.length && authIds.some((id) => accountIds.includes(id))) {
    return true;
  }

  const firstName = normalize(authUser?.firstName);
  const lastName = normalize(authUser?.lastName);
  const fullName = `${firstName} ${lastName}`.trim() || normalize(authUser?.customerName);
  if (!firstName || !lastName) {
    return Boolean(fullName && normalize(account?.customerName || account?.customer?.name) === fullName);
  }

  const accountFirstName = normalize(account?.firstName || account?.customer?.firstName);
  const accountLastName = normalize(account?.lastName || account?.customer?.lastName);
  const accountCustomerName = normalize(account?.customerName || account?.customer?.name);

  return (
    (accountFirstName === firstName && accountLastName === lastName) ||
    accountCustomerName === fullName
  );
};

export default function AccountDashboard() {
  const [authUser, setAuthUser] = useState(null);
  const [userAccounts, setUserAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [totalBalance, setTotalBalance] = useState(0);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [balanceError, setBalanceError] = useState("");

  const ads = [
    {
      title: "Earn up to 5% per annum",
      description:
        "Save smarter with our Savings Account and enjoy competitive annual returns.",
      legal: "Terms and conditions apply."
    },
    {
      title: "Secure Savings Account",
      description: "Your funds are protected with bank-grade security and deposit insurance.",
      legal: "Savings are subject to bank policy."
    }
  ];

  const [currentAd, setCurrentAd] = useState(0);

  const displayName = useMemo(() => {
    const firstName = (authUser?.firstName || "").trim();
    const lastName = (authUser?.lastName || "").trim();
    if (firstName || lastName) return `${firstName} ${lastName}`.trim();

    const fullName = (authUser?.customerName || authUser?.name || "").trim();
    return fullName || "Customer";
  }, [authUser]);

  useEffect(() => {
    const rawUser = localStorage.getItem("authUser");
    if (!rawUser) return;

    try {
      setAuthUser(JSON.parse(rawUser));
    } catch {
      setAuthUser(null);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAd((prev) => (prev + 1) % ads.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [ads.length]);

  useEffect(() => {
    const resolveBalance = (account) =>
      Number(account?.balance ?? account?.availableBalance ?? account?.currentBalance ?? 0);

    const loadDashboardData = async () => {
      setBalanceLoading(true);
      setBalanceError("");

      try {
        if (!authUser) {
          setUserAccounts([]);
          setSelectedAccount(null);
          setTotalBalance(0);
          return;
        }

        const accountsResponse = await getAccounts();
        const accounts = resolveAccountList(accountsResponse.data);

        if (!accounts.length) {
          setUserAccounts([]);
          setSelectedAccount(null);
          setTotalBalance(0);
          return;
        }

        const relevantAccounts = accounts.filter((account) => {
          const accountType = normalizeAccountType(account);
          if (accountType !== "CURRENT" && accountType !== "SAVINGS") return false;
          return accountBelongsToUser(account, authUser);
        });

        setUserAccounts(relevantAccounts);
        setSelectedAccount(relevantAccounts[0] || null);
        setTotalBalance(
          relevantAccounts.reduce((sum, account) => sum + resolveBalance(account), 0)
        );
      } catch (err) {
        setBalanceError(getErrorMessage(err, "Failed to load account balance"));
        setTotalBalance(0);
      } finally {
        setBalanceLoading(false);
      }
    };

    loadDashboardData();
  }, [authUser]);

  const transactionsPath = selectedAccount?.id
    ? `/transactions?accountId=${selectedAccount.id}`
    : "/transactions";

  return (
    <div className="dashboard">
      <div className="dashboard-container">
        <LoggedInMenu />

        <div className="top-bar">
          <div className="brand-section">
            <h1 className="brand">APEX</h1>
            <div className="profile">
            
              <span className="greeting">Good day, {displayName}</span>
            </div>
          </div>

          <div className="top-actions">
            <Link to="/" className="home-btn">
              Home
            </Link>
          </div>
        </div>

        <div className="ads-slider">
          <h3>{ads[currentAd].title}</h3>
          <p>{ads[currentAd].description}</p>
          <small>{ads[currentAd].legal}</small>
        </div>

        <div className="balance-card">
          <p>Total Balance</p>
          <h1>£{Number(totalBalance).toLocaleString()}</h1>
          {balanceLoading && <small>Loading balance from backend...</small>}
          {balanceError && <small className="balance-error">{balanceError}</small>}
        </div>

        <div className="actions">
          <div className="action">
            <span className="action-icon" aria-hidden="true">💳</span>
            <p>BLIK</p>
          </div>

          <Link to={transactionsPath} className="action">
            <span className="action-icon" aria-hidden="true">💸</span>
            <p>Transfer</p>
          </Link>

          <div className="action">
            <span className="action-icon" aria-hidden="true">🧾</span>
            <p>History</p>
          </div>

          <div className="action">
            <span className="action-icon" aria-hidden="true">⚙️</span>
            <p>More</p>
          </div>
        </div>

        <div className="transfer-link-row">
          <Link to="/AccountDetails" className="open-transactions-link">
            Go to Account Details Page
          </Link>
        </div>

        <div className="info-grid">
          <div className="info-card">
            <p>Account Type</p>
            <h4>{selectedAccount?.type || "N/A"}</h4>
          </div>

          <div className="info-card">
            <p>Account Status</p>
            <h4>{selectedAccount?.status || "Active"}</h4>
          </div>

          <div className="info-card">
            <p>Linked Accounts</p>
            <h4>{userAccounts.length}</h4>
          </div>
        </div>

        <div className="activity-card">
          <h3>Account Activity</h3>
          <ul>
            <li>Transfers enabled</li>
            <li>Online payments enabled</li>
            <li>International access enabled</li>
            <li>Notifications active</li>
          </ul>
        </div>

        <div className="support-card">
          <h3>Help and Security</h3>
          <p>
            Manage your security settings, update personal information, and control how your
            account is accessed.
          </p>

          <div className="support-actions">
            <button>Security Settings</button>
            <button>Contact Support</button>
          </div>
        </div>
      </div>
    </div>
  );
}
