package com.apex.bank.dto;

import java.math.BigDecimal;

public class AccountResponse {
    private Long id;
    private Long userId;
    private String accountNumber;
    private String type;
    private BigDecimal balance;
    private String status;
    private BigDecimal overdraftLimit;

    public AccountResponse(Long id, Long userId, String accountNumber, String type, BigDecimal balance, String status, BigDecimal overdraftLimit) {
        this.id = id;
        this.userId = userId;
        this.accountNumber = accountNumber;
        this.type = type;
        this.balance = balance;
        this.status = status;
        this.overdraftLimit = overdraftLimit;
    }

    public Long getId() {
        return id;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public Long getUserId() {
        return userId;
    }

    public String getType() {
        return type;
    }

    public String getAccountType() {
        return type;
    }

    public BigDecimal getBalance() {
        return balance;
    }

    public String getStatus() {
        return status;
    }

    public BigDecimal getOverdraftLimit() {
        return overdraftLimit;
    }
}
