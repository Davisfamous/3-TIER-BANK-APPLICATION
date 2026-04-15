package com.apex.bank.dto;

public class BudgetNoteRequest {
    private Long userId;
    private String note;

    // Optional: allow user to specify if AI suggestion is wanted
    private Boolean ai;

    public BudgetNoteRequest() {}

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }

    public Boolean getAi() { return ai; }
    public void setAi(Boolean ai) { this.ai = ai; }
}
