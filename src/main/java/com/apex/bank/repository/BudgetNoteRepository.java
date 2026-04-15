package com.apex.bank.repository;

import com.apex.bank.model.BudgetNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BudgetNoteRepository extends JpaRepository<BudgetNote, Long> {
    List<BudgetNote> findByUserIdOrderByCreatedAtDesc(Long userId);
}
