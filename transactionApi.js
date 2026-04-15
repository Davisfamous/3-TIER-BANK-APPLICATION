import axios from "axios";

export const getTransactions = () => {
  return axios.get("/api/transactions");
};

export const getBalance = () => {
  return axios.get("/api/accounts/balance");
};

export const deposit = (amount) => {
  return axios.post("/api/transactions/deposit", { amount });
};

export const withdraw = (amount) => {
  return axios.post("/api/transactions/withdraw", { amount });
};
