package com.apex.bank.model;

import jakarta.persistence.Entity;

@Entity
public class CurrentAccount extends BankAccount {

    private double overdraftLimit;


    @Override
    protected boolean canOverdraw(double amount) {
        return balance - amount >= -overdraftLimit;
    }

    @Override
    public void withdraw(double amount) {
        double previousBalance = balance;
        balance -= amount;
        recordTransaction("Withdraw", amount);

        if (balance < -overdraftLimit) {
            balance = previousBalance;
            recordTransaction("Reversal", amount);
            throw new RuntimeException("Overdraft limit exceeded. Transaction reversed.");
        }
    }

    public double getOverdraftLimit() {
        return overdraftLimit;
    }
}
