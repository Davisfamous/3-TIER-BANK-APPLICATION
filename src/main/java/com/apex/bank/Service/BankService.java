package com.apex.bank.Service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.apex.bank.model.BankAccount;
import com.apex.bank.model.Transaction;
import com.apex.bank.repository.BankAccountRepository;
import com.apex.bank.repository.TransactionRepository;

@Service
public class BankService {

    private final BankAccountRepository accountRepo;
    private final TransactionRepository txRepo;
    
    public BankService(BankAccountRepository a, TransactionRepository t) {
        this.accountRepo = a;
        this.txRepo = t;
    }

    public List<Transaction> allTransactions() {
        return txRepo.findAll();
    }

    public List<BankAccount> getAllAccounts() {
        return accountRepo.findAll();
    }
}
