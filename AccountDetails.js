import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAccounts, getTransactions } from "./api/bankApi";
import LoggedInMenu from "./components/LoggedInMenu";
import "./css/AccountDetails.css";

const resolveAccounts = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.accounts)) return payload.accounts;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const resolveTransactions = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.transactions)) return payload.transactions;
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

const resolveAccountOwner = (account) => {
  const firstName = normalize(account?.firstName || account?.customer?.firstName);
  const lastName = normalize(account?.lastName || account?.customer?.lastName);
  const customerName = normalize(account?.customerName || account?.customer?.name);
  return { firstName, lastName, customerName };
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
    return Boolean(fullName && resolveAccountOwner(account).customerName === fullName);
  }

  const owner = resolveAccountOwner(account);
  return (
    (owner.firstName === firstName && owner.lastName === lastName) ||
    owner.customerName === fullName
  );
};

export default function AccountDetails() {
  const [authUser, setAuthUser] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [activeAccount, setActiveAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
    const loadAccounts = async () => {
      setLoading(true);
      setError("");

      try {
        if (!authUser) {
          setAccounts([]);
          setActiveAccount(null);
          return;
        }

        const response = await getAccounts();
        const resolved = resolveAccounts(response.data);

        const typeMatchedAccounts = resolved.filter(
          (account) => normalizeAccountType(account) === "CURRENT" || normalizeAccountType(account) === "SAVINGS"
        );

        const personalAccounts = typeMatchedAccounts.filter((account) =>
          accountBelongsToUser(account, authUser)
        );

        setAccounts(personalAccounts);

        if (personalAccounts.length) {
          const currentAccount =
            personalAccounts.find((account) => normalizeAccountType(account) === "CURRENT") ||
            personalAccounts[0];
          setActiveAccount(currentAccount);
        } else {
          setActiveAccount(null);
        }
      } catch (err) {
        setError(getErrorMessage(err, "Failed to load accounts"));
      } finally {
        setLoading(false);
      }
    };

    loadAccounts();
  }, [authUser]);

  const currentAccount = accounts.find((account) => normalizeAccountType(account) === "CURRENT");
  const savingsAccount = accounts.find((account) => normalizeAccountType(account) === "SAVINGS");

  useEffect(() => {
    if (!activeAccount?.id) {
      setTransactions([]);
      return;
    }

    const loadTransactions = async () => {
      setError("");
      try {
        const response = await getTransactions(activeAccount.id);
        setTransactions(resolveTransactions(response.data));
      } catch (err) {
        setError(getErrorMessage(err, "Failed to load transactions"));
      }
    };

    loadTransactions();
  }, [activeAccount?.id]);

  if (loading) {
    return (
      <div className="account-wrapper">
        <h2>My Accounts</h2>
        <p>Loading accounts...</p>
      </div>
    );
  }

  return (
    <div className="account-wrapper">
      <LoggedInMenu />
      <h2>My Accounts</h2>

      {error && <p className="account-error">{error}</p>}

      {!accounts.length ? (
        <p>No current or savings accounts available yet.</p>
      ) : (
        <>
          <div className="account-type-switch">
            {currentAccount && (
              <button
                className={`account-type-btn ${activeAccount?.id === currentAccount.id ? "active" : ""}`}
                onClick={() => setActiveAccount(currentAccount)}
              >
                Current Account
              </button>
            )}

            {savingsAccount && (
              <button
                className={`account-type-btn ${activeAccount?.id === savingsAccount.id ? "active" : ""}`}
                onClick={() => setActiveAccount(savingsAccount)}
              >
                Savings Account
              </button>
            )}
          </div>

          {activeAccount && (
            <div className="account-details-card">
              <h3>{activeAccount.type}</h3>

              <div className="details-row">
                <span>Customer</span>
                <strong>
                  {activeAccount.customerName ||
                    activeAccount.customer?.name ||
                    `${activeAccount.firstName || activeAccount.customer?.firstName || ""} ${
                      activeAccount.lastName || activeAccount.customer?.lastName || ""
                    }`.trim() ||
                    "N/A"}
                </strong>
              </div>

              <div className="details-row">
                <span>Account Number</span>
                <strong>{activeAccount.accountNumber}</strong>
              </div>

              <div className="details-row">
                <span>Status</span>
                <strong
                  className={
                    (activeAccount.status || "ACTIVE").toUpperCase() === "ACTIVE"
                      ? "status active"
                      : "status dormant"
                  }
                >
                  {activeAccount.status || "ACTIVE"}
                </strong>
              </div>

              <div className="balance-box">
                <p>Available Balance</p>
                <h1>
                  £
                  {Number(
                    activeAccount.balance ??
                      activeAccount.availableBalance ??
                      activeAccount.currentBalance ??
                      0
                  ).toLocaleString()}
                </h1>
              </div>

              <Link
                to={`/transactions?accountId=${activeAccount.id}`}
                className="open-transactions-link"
              >
                Deposit / Withdraw and View Full History
              </Link>

              <div className="account-history-preview">
                <h4>Recent Transactions</h4>
                {transactions.length === 0 ? (
                  <p>No transactions yet.</p>
                ) : (
                  <ul>
                    {transactions.slice(0, 5).map((tx, index) => (
                      <li key={tx.id || index}>
                        <span>{tx.type || tx.transactionType || "Transaction"}</span>
                        <span>£{Number(tx.amount ?? tx.value ?? 0).toLocaleString()}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
