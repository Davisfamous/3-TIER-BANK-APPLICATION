package com.apex.bank.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "account_transactions")
public class AccountTransaction {

    public enum Type {
        DEPOSIT, WITHDRAW, TRANSFER_IN, TRANSFER_OUT
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Type type;

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(name = "timestamp", nullable = false)
    private LocalDateTime createdAt;

    @Column
    private String reference;

    protected AccountTransaction() {
    }

    public AccountTransaction(Account account, Type type, BigDecimal amount, String reference) {
        this.account = account;
        this.type = type;
        this.amount = amount;
        this.createdAt = LocalDateTime.now();
        this.reference = reference;
    }

    public Long getId() {
        return id;
    }

    public Account getAccount() {
        return account;
    }

    public Type getType() {
        return type;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public String getReference() {
        return reference;
    }
}
