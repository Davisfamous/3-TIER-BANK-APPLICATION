package com.apex.bank.repository;

import com.apex.bank.model.Account;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AccountRepository extends JpaRepository<Account, Long> {
    List<Account> findByUserId(Long userId);
    Optional<Account> findFirstByUserIdOrderByIdDesc(Long userId);
}
