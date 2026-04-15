package com.apex.bank.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.apex.bank.model.OverdraftAttempt;

public interface OverdraftAttemptRepository
        extends JpaRepository<OverdraftAttempt, Long> {
}
