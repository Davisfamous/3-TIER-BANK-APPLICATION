package com.apex.bank.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class BudgetNote {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(length = 4000)
    private String note;

    @Column(length = 4000)
    private String aiSuggestion;

    private LocalDateTime createdAt;

    public BudgetNote() {
        this.createdAt = LocalDateTime.now();
    }

    public BudgetNote(Long userId, String note, String aiSuggestion) {
        this.userId = userId;
        this.note = note;
        this.aiSuggestion = aiSuggestion;
        this.createdAt = LocalDateTime.now();
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
    public String getAiSuggestion() { return aiSuggestion; }
    public void setAiSuggestion(String aiSuggestion) { this.aiSuggestion = aiSuggestion; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
