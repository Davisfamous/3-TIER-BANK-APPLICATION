package com.apex.bank.Service;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.stereotype.Service;

import com.apex.bank.model.BankAccount;
import com.apex.bank.model.CurrentAccount;
import com.apex.bank.model.OverdraftAttempt;
import com.apex.bank.model.SavingsAccount;
import com.apex.bank.model.Transaction;
import com.apex.bank.repository.BankAccountRepository;
import com.apex.bank.repository.OverdraftAttemptRepository;
import com.apex.bank.repository.TransactionRepository;

@Service
public class BankService {

    private final BankAccountRepository accountRepo;
    private final TransactionRepository txRepo;
    private final OverdraftAttemptRepository overdraftAttemptRepo;
    private final RewardService rewardService;
    
    public BankService(BankAccountRepository a, TransactionRepository t, OverdraftAttemptRepository o, RewardService r) {
        this.accountRepo = a;
        this.txRepo = t;
        this.overdraftAttemptRepo = o;
        this.rewardService = r;
    }

    public void deposit(String accNo, double amount) {
        BankAccount acc = accountRepo.findById(accNo).orElseThrow();
        acc.deposit(amount);
        if (acc instanceof SavingsAccount savings && savings.shouldTriggerReward()) {
            accountRepo.save(acc);
            String rewardDescription = rewardService.getReward();
            throw new RuntimeException("Customer qualifies for mystery reward: " + rewardDescription);
        }
        accountRepo.save(acc);
    }

    public void withdraw(String accNo, double amount) {
        BankAccount acc = accountRepo.findById(accNo).orElseThrow();
        double balanceAtTime = acc.getBalance();
        BigDecimal overdraftLimit = null;
        if (acc instanceof CurrentAccount current) {
            overdraftLimit = BigDecimal.valueOf(current.getOverdraftLimit());
        }

        try {
            acc.withdraw(amount);
            accountRepo.save(acc);
        } catch (RuntimeException e) {
            accountRepo.save(acc);
            String message = e.getMessage();
            if (message != null && (message.contains("overdrawn") || message.contains("Overdraft limit exceeded"))) {
                overdraftAttemptRepo.save(new OverdraftAttempt(
                        acc.getAccountNumber(),
                        acc.getFirstName() + " " + acc.getLastName(),
                        BigDecimal.valueOf(amount),
                        BigDecimal.valueOf(balanceAtTime),
                        overdraftLimit
                ));
            }
            throw e;
        }
    }

    public List<Transaction> transactions(String accNo) {
        return txRepo.findByAccountAccountNumber(accNo);
    }

    public List<Transaction> allTransactions() {
        return txRepo.findAll();
    }

    public List<BankAccount> getAllAccounts() {
        return accountRepo.findAll();


    }
}
