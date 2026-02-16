package com.apex.bank.model;

import jakarta.persistence.Entity;


@Entity
public class SavingsAccount extends BankAccount {

    @Override
    protected boolean canOverdraw(double amount) {
        return false;
    }

    @Override
    public void withdraw(double amount) {
        double previousBalance = balance;
        balance -= amount;
        recordTransaction("Withdraw", amount);
        if (balance < 0) {
            balance = previousBalance;
            recordTransaction("Reversal", amount);
            throw new RuntimeException("Savings cannot go overdrawn. Transaction reversed.");
        }
    }
}
