package com.apex.bank.dto;

public class BudgetNoteGenerateResponse {
    private String generatedNote;

    public BudgetNoteGenerateResponse() {
    }

    public BudgetNoteGenerateResponse(String generatedNote) {
        this.generatedNote = generatedNote;
    }

    public String getGeneratedNote() {
        return generatedNote;
    }

    public void setGeneratedNote(String generatedNote) {
        this.generatedNote = generatedNote;
    }
}
