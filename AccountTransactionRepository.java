package com.apex.bank.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.apex.bank.model.AccountTransaction;

public interface AccountTransactionRepository extends JpaRepository<AccountTransaction, Long> {
    List<AccountTransaction> findByAccountIdOrderByCreatedAtDesc(Long accountId);
}
