import { useEffect, useState } from "react";
import { getBudgetNotes } from "./api/budgetApi";
import "./css/Accountpage.css";

export default function BudgetNotesPage({ authUser }) {
  const [budgetNotes, setBudgetNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authUser?.id) return;
    setLoading(true);
    getBudgetNotes(authUser.id)
      .then((res) => setBudgetNotes(res.data || []))
      .catch(() => setError("Failed to load budget notes"))
      .finally(() => setLoading(false));
  }, [authUser]);

  return (
    <div className="dashboard-container">
      <h2>Budget Notes</h2>
      {loading && <div>Loading budget notes...</div>}
      {error && <div className="budget-error">{error}</div>}
      <ul className="budget-notes-list">
        {budgetNotes.map((note, idx) => (
          <li key={note.id || idx}>
            <div>{note.note}</div>
            {note.aiSuggestion && (
              <div className="ai-suggestion-inline">
                <em>Generated budget: {note.aiSuggestion}</em>
              </div>
            )}
            <small>{note.createdAt ? new Date(note.createdAt).toLocaleString() : ""}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}
