package com.apex.bank.dto;

public class LoginResponse {
    private Long userId;
    private String firstName;
    private String lastName;
    private Long accountId;

    public LoginResponse(Long userId, String firstName, String lastName, Long accountId) {
        this.userId = userId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.accountId = accountId;
    }

    public Long getUserId() {
        return userId;
    }

    public Long getId() {
        return userId;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public Long getAccountId() {
        return accountId;
    }
}
