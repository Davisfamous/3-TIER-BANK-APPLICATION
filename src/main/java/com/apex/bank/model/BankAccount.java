package com.apex.bank.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
import jakarta.persistence.OneToMany;

@Entity
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
public abstract class BankAccount {

    @Id
    protected String accountNumber;

    protected String firstName;
    protected String lastName;
    protected double balance;
    protected LocalDateTime dateOpened;
    protected int age;
    protected String email;

    @OneToMany(mappedBy = "account", cascade = CascadeType.ALL)
    protected List<Transaction> transactions = new ArrayList<>();

    public void deposit(double amount) {
        if (amount <= 0) {
            throw new IllegalArgumentException("Deposit amount must be greater than zero");
        }
        balance += amount;
        recordTransaction("Deposit", amount);
    }

    protected abstract boolean canOverdraw(double amount);

    public abstract void withdraw(double amount);

    protected void recordTransaction(String type, double amount) {
        transactions.add(new Transaction(type, amount, balance, this));
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public double getBalance() {
        return balance;
    }
}
