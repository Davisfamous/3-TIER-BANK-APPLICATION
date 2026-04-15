package com.apex.bank.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.apex.bank.model.Transaction;

public interface TransactionRepository
        extends JpaRepository<Transaction, Long> {
    List<Transaction> findByAccountAccountNumber(String accountNumber);
}
