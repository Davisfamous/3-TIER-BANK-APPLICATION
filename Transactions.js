import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import LoggedInMenu from "./components/LoggedInMenu";

import "./css/TransactionPage.css";
import {
  deposit,
  getAccountById,
  getAccounts,
  getTransactions,
  transferBetweenAccounts,
  withdraw
} from "./api/bankApi";

const readAccountIdFromLocation = (location) => {
  const params = new URLSearchParams(location.search);
  const value = params.get("accountId");
  return value ? Number(value) : null;
};

const resolveAccountList = (payload) => {
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

const getTransactionType = (tx) =>
  (tx.type || tx.transactionType || "").toString().toLowerCase();

const getErrorMessage = (err, fallback) => {
  const apiError = err?.response?.data;
  if (typeof apiError === "string") return apiError;
  if (apiError && typeof apiError === "object") {
    if (typeof apiError.message === "string" && apiError.message.trim()) return apiError.message;
    return fallback;
  }
  if (typeof err?.message === "string" && err.message.trim()) return err.message;
  return fallback;
};

const normalizeAccountType = (account) => {
  const rawType = (account?.type || "").toString().trim().toLowerCase();
  if (rawType.includes("current")) return "CURRENT";
  if (rawType.includes("saving")) return "SAVINGS";
  return "";
};

const normalize = (value) => (value || "").toString().trim().toLowerCase();

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

export default function TransactionPage() {
  const location = useLocation();
  const preselectedAccountId = readAccountIdFromLocation(location);

  const [authUser, setAuthUser] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState(preselectedAccountId);
  const [targetAccountId, setTargetAccountId] = useState(null);
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const selectedAccount = useMemo(
    () => accounts.find((account) => Number(account.id) === Number(selectedAccountId)),
    [accounts, selectedAccountId]
  );

  const hasSavingsAccount = useMemo(
    () => accounts.some((account) => normalizeAccountType(account) === "SAVINGS"),
    [accounts]
  );

  const totalAvailableBalance = useMemo(
    () =>
      accounts.reduce((sum, account) => {
        const value =
          account?.balance ?? account?.availableBalance ?? account?.currentBalance ?? 0;
        return sum + Number(value);
      }, 0),
    [accounts]
  );

  const transferTargetOptions = useMemo(
    () => accounts.filter((account) => Number(account.id) !== Number(selectedAccountId)),
    [accounts, selectedAccountId]
  );

  useEffect(() => {
    const rawUser = localStorage.getItem("authUser");
    if (!rawUser) return;
    try {
      setAuthUser(JSON.parse(rawUser));
    } catch {
      setAuthUser(null);
    }
  }, []);

  const refreshAccountData = useCallback(async (accountIdToUse = selectedAccountId) => {
    if (!accountIdToUse) return;

    const [accountResponse, transactionsResponse, accountsResponse] = await Promise.all([
      getAccountById(accountIdToUse),
      getTransactions(accountIdToUse),
      getAccounts()
    ]);

    const accountData = accountResponse.data?.account || accountResponse.data;
    const resolvedBalance =
      accountData?.balance ?? accountData?.availableBalance ?? accountData?.currentBalance ?? 0;

    const resolvedAccounts = resolveAccountList(accountsResponse.data).filter((account) =>
      accountBelongsToUser(account, authUser)
    );
    setAccounts(resolvedAccounts);
    setBalance(Number(resolvedBalance));
    setTransactions(resolveTransactions(transactionsResponse.data));

    const fallbackTarget = resolvedAccounts.find(
      (account) => Number(account.id) !== Number(accountIdToUse)
    );

    setTargetAccountId((previousTarget) => {
      if (
        previousTarget &&
        Number(previousTarget) !== Number(accountIdToUse) &&
        resolvedAccounts.some((account) => Number(account.id) === Number(previousTarget))
      ) {
        return previousTarget;
      }
      return fallbackTarget?.id || null;
    });
  }, [selectedAccountId, authUser]);

  useEffect(() => {
    const loadAccounts = async () => {
      setLoading(true);
      setError("");

      try {
        if (!authUser) {
          setAccounts([]);
          setTransactions([]);
          setBalance(0);
          return;
        }

        const accountsResponse = await getAccounts();
        const resolvedAccounts = resolveAccountList(accountsResponse.data).filter((account) =>
          accountBelongsToUser(account, authUser)
        );
        setAccounts(resolvedAccounts);

        if (!resolvedAccounts.length) {
          setTransactions([]);
          setBalance(0);
          return;
        }

        const defaultAccountId =
          preselectedAccountId &&
          resolvedAccounts.some((account) => Number(account.id) === Number(preselectedAccountId))
            ? preselectedAccountId
            : resolvedAccounts[0].id;

        setSelectedAccountId(defaultAccountId);

        const defaultTarget = resolvedAccounts.find(
          (account) => Number(account.id) !== Number(defaultAccountId)
        );
        setTargetAccountId(defaultTarget?.id || null);
      } catch (err) {
        setError(getErrorMessage(err, "Failed to load accounts"));
      } finally {
        setLoading(false);
      }
    };

    loadAccounts();
  }, [preselectedAccountId, authUser]);

  useEffect(() => {
    if (!selectedAccountId) return;

    const refreshData = async () => {
      setError("");
      try {
        await refreshAccountData(selectedAccountId);
      } catch (err) {
        setError(getErrorMessage(err, "Failed to load account details"));
      }
    };

    refreshData();
  }, [selectedAccountId, refreshAccountData]);

  const handleDeposit = async () => {
    const value = Number(amount);
    if (value <= 0) return alert("Enter a valid amount");
    if (!selectedAccountId) return;

    setSubmitting(true);
    setError("");

    try {
      await deposit(selectedAccountId, value);
      await refreshAccountData(selectedAccountId);
      setAmount("");
    } catch (err) {
      setError(getErrorMessage(err, "Deposit failed"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdraw = async () => {
    const value = Number(amount);
    if (value <= 0) return alert("Enter a valid amount");
    if (!selectedAccountId) return;

    setSubmitting(true);
    setError("");

    try {
      await withdraw(selectedAccountId, value);
      await refreshAccountData(selectedAccountId);
      setAmount("");
    } catch (err) {
      setError(getErrorMessage(err, "Withdraw failed"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleTransfer = async () => {
    const value = Number(transferAmount);
    if (value <= 0) return alert("Enter a valid transfer amount");
    if (!selectedAccountId || !targetAccountId) return alert("Select both source and target accounts");

    setSubmitting(true);
    setError("");

    try {
      await transferBetweenAccounts(selectedAccountId, targetAccountId, value);
      await refreshAccountData(selectedAccountId);
      setTransferAmount("");
    } catch (err) {
      setError(getErrorMessage(err, "Transfer failed"));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="transaction-page">
        <h2>Account Transactions</h2>
        <p className="empty">Loading accounts...</p>
      </div>
    );
  }

  return (
    <div className="transaction-page">
      <LoggedInMenu />
      <h2>Account Transactions</h2>

      {error && <p className="error-message">{error}</p>}

      {!accounts.length ? (
        <p className="empty">No accounts available yet.</p>
      ) : (
        <>
          <div className="account-picker">
            <label htmlFor="accountSelect">Select Account</label>
            <select
              id="accountSelect"
              value={selectedAccountId || ""}
              onChange={(e) => setSelectedAccountId(Number(e.target.value))}
            >
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.type} - {account.accountNumber}
                </option>
              ))}
              {!hasSavingsAccount && (
                <option value="" disabled>
                  Savings Account - Not available
                </option>
              )}
            </select>
          </div>

          {selectedAccount && (
            <div className="selected-account-meta">
              <p>
                <strong>Account Number:</strong> {selectedAccount.accountNumber}
              </p>
              <p>
                <strong>Account Type:</strong> {selectedAccount.type}
              </p>
            </div>
          )}

          <div className="balance-card">
            <p>Current Balance</p>
            <h1>£{Number(balance).toLocaleString()}</h1>
            <small>Total Available (Current + Savings): £{totalAvailableBalance.toLocaleString()}</small>
          </div>

          <div className="action-card">
            <input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />

            <div className="buttons">
              <button onClick={handleDeposit} disabled={submitting}>
                {submitting ? "Processing..." : "Deposit"}
              </button>
              <button className="withdraw" onClick={handleWithdraw} disabled={submitting}>
                {submitting ? "Processing..." : "Withdraw"}
              </button>
            </div>
          </div>

          <div className="action-card transfer-card">
            <h3>Move funds between your accounts</h3>
            <label htmlFor="targetAccountSelect">Transfer to</label>
            <select
              id="targetAccountSelect"
              value={targetAccountId || ""}
              onChange={(e) => setTargetAccountId(Number(e.target.value))}
              disabled={!transferTargetOptions.length}
            >
              {!transferTargetOptions.length ? (
                <option value="">No target account available</option>
              ) : (
                transferTargetOptions.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.type} - {account.accountNumber}
                  </option>
                ))
              )}
            </select>

            <input
              type="number"
              placeholder="Transfer amount"
              value={transferAmount}
              onChange={(e) => setTransferAmount(e.target.value)}
            />

            <button
              onClick={handleTransfer}
              disabled={submitting || !transferTargetOptions.length || !targetAccountId}
            >
              {submitting ? "Processing..." : "Transfer Between Accounts"}
            </button>
          </div>

          <div className="history-card">
            <h3>Transaction History</h3>

            {transactions.length === 0 ? (
              <p className="empty">No transactions yet</p>
            ) : (
              <ul>
                {transactions.map((tx, index) => {
                  const txType = getTransactionType(tx);
                  const amountValue = Number(tx.amount ?? tx.value ?? 0);
                  const dateValue = tx.timestamp || tx.date || tx.createdAt || "";

                  return (
                    <li key={tx.id || `${txType}-${index}`}>
                      <span className={txType === "withdraw" ? "withdraw" : "deposit"}>
                        {(tx.type || tx.transactionType || "Transaction").toString()}
                      </span>
                      <span>£{amountValue.toLocaleString()}</span>
                      <small>{dateValue ? new Date(dateValue).toLocaleString() : "N/A"}</small>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </>
      )}

      <Link to="/AccountDetails" className="back-to-accounts-link">
        Back to Account Details
      </Link>
    </div>
  );
}
