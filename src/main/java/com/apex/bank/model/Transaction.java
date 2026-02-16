package com.apex.bank.model;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;

@Entity
public class Transaction {

    @Id
    @GeneratedValue
    private Long id;

    private String type; // Deposit, Withdraw, Reversal
    private double amount;
    private double balance;
    private LocalDateTime date;

    @ManyToOne
    private BankAccount account;

    protected Transaction() {
    }

    public Transaction(String type, double amount, double balance, BankAccount account) {
        this.type = type;
        this.amount = amount;
        this.balance = balance;
        this.date = LocalDateTime.now();
        this.account = account;
    }

    public Long getId() {
        return id;
    }

    public String getType() {
        return type;
    }

    public double getAmount() {
        return amount;
    }

    public double getBalance() {
        return balance;
    }

    public LocalDateTime getDate() {
        return date;
    }

    public BankAccount getAccount() {
        return account;
    }
}
