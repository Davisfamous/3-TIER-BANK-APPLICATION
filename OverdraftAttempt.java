package com.apex.bank.model;

import java.math.BigDecimal;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;

@Entity
public class OverdraftAttempt {

    @Id @GeneratedValue
    private Long id;

    private String accountNumber;
    private String customerName;
    private BigDecimal attemptedAmount;
    private BigDecimal balanceAtTime;
    private BigDecimal overdraftLimit;

    protected OverdraftAttempt() {
    }

    public OverdraftAttempt(String accountNumber, String customerName, BigDecimal attemptedAmount,
            BigDecimal balanceAtTime, BigDecimal overdraftLimit) {
        this.accountNumber = accountNumber;
        this.customerName = customerName;
        this.attemptedAmount = attemptedAmount;
        this.balanceAtTime = balanceAtTime;
        this.overdraftLimit = overdraftLimit;
    }

    public Long getId() {
        return id;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public String getCustomerName() {
        return customerName;
    }

    public BigDecimal getAttemptedAmount() {
        return attemptedAmount;
    }

    public BigDecimal getBalanceAtTime() {
        return balanceAtTime;
    }

    public BigDecimal getOverdraftLimit() {
        return overdraftLimit;
    }
}
