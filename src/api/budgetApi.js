import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8080/api",
});

export const createBudgetNote = (data) =>
  API.post("/budget-notes", data);

export const generateBudgetNote = (data) =>
  API.post("/budget-notes/generate", data);

export const getBudgetNotes = (userId) =>
  API.get(`/budget-notes?userId=${userId}`);
