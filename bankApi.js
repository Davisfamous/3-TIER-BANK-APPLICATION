import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8080/api",
});

export const createAccount = (data) =>
  API.post("/accounts", data);

export const getAccounts = () =>
  API.get("/accounts");

export const getAccountById = (id) =>
  API.get(`/accounts/${id}`);

export const deposit = (id, amount) =>
  API.post(`/accounts/${id}/deposit`, { amount });

export const withdraw = (id, amount) =>
  API.post(`/accounts/${id}/withdraw`, { amount });

export const getTransactions = (id) =>
  API.get(`/accounts/${id}/transactions`);

export const loginUser = (data) =>
  API.post("/login", data);

export const transferBetweenAccounts = (fromAccountId, toAccountId, amount) =>
  API.post("/accounts/transfer", {
    fromAccountId,
    toAccountId,
    amount
  });
