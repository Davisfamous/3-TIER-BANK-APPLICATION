package com.apex.bank.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.apex.bank.model.BankAccount;

public interface BankAccountRepository
        extends JpaRepository<BankAccount, String> {
}
