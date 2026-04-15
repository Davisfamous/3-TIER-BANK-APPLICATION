package com.apex.bank.model;

import jakarta.persistence.Entity;


@Entity
public class SavingsAccount extends BankAccount {

    private boolean rewardEligible = true;
    private double nextRewardThreshold = 1000.0;


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

    public boolean shouldTriggerReward() {
        if (!rewardEligible && balance >= nextRewardThreshold) {
            rewardEligible = true;
        }

        if (rewardEligible && balance >= nextRewardThreshold) {
            rewardEligible = false;
            nextRewardThreshold += 1000.0;
            return true;
        }
        return false;
    }
}
