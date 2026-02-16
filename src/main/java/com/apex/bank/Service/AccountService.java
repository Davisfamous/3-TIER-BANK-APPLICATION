package com.apex.bank.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.apex.bank.dto.AccountResponse;
import com.apex.bank.dto.CreateAccountRequest;
import com.apex.bank.dto.LoginRequest;
import com.apex.bank.dto.LoginResponse;
import com.apex.bank.dto.TransactionResponse;
import com.apex.bank.model.Account;
import com.apex.bank.model.AccountTransaction;
import com.apex.bank.model.User;
import com.apex.bank.repository.AccountRepository;
import com.apex.bank.repository.AccountTransactionRepository;
import com.apex.bank.repository.UserRepository;

@Service
public class AccountService {

    private static final BigDecimal ZERO = BigDecimal.ZERO;

    private final AccountRepository accountRepository;
    private final UserRepository userRepository;
    private final AccountTransactionRepository accountTransactionRepository;
    private final Accountnumgenerator accountNumGenerator;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AccountService(AccountRepository accountRepository,
            UserRepository userRepository,
            AccountTransactionRepository accountTransactionRepository,
            Accountnumgenerator accountNumGenerator) {
        this.accountRepository = accountRepository;
        this.userRepository = userRepository;
        this.accountTransactionRepository = accountTransactionRepository;
        this.accountNumGenerator = accountNumGenerator;
    }

    @Transactional
    public AccountResponse create(CreateAccountRequest request) {
        normalizeNamesFromCustomerName(request);
        validateCreateRequest(request);
        com.apex.bank.Enums.AccountType type = resolveType(request);
        BigDecimal overdraftLimit = type == com.apex.bank.Enums.AccountType.CURRENT
                ? request.getOverdraftLimit()
                : null;
        BigDecimal openingBalance = request.getOpeningBalance() == null
                ? ZERO
                : request.getOpeningBalance();
        if (openingBalance.signum() < 0) {
            throw new IllegalArgumentException("openingBalance must be >= 0");
        }

        User user = findOrCreateUser(request);

        Account account = new Account(
                user,
                accountNumGenerator.generateAccountNumber(type),
                type.name(),
                openingBalance,
                "ACTIVE",
                overdraftLimit
        );
        Account saved = accountRepository.save(account);

        return toAccountResponse(saved);
    }

    public LoginResponse login(LoginRequest request) {
        User user = userRepository
                .findByFirstNameIgnoreCaseAndLastNameIgnoreCase(request.getFirstName(), request.getLastName())
                .orElseThrow(() -> new RuntimeException("Invalid firstName, lastName, or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid firstName, lastName, or password");
        }

        Long accountId = accountRepository.findFirstByUserIdOrderByIdDesc(user.getId())
                .map(Account::getId)
                .orElse(null);
        return new LoginResponse(user.getId(), user.getFirstName(), user.getLastName(), accountId);
    }

    public List<AccountResponse> getAccounts(Long userId) {
        if (userId == null) {
            return accountRepository.findAll().stream().map(this::toAccountResponse).toList();
        }
        userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        return accountRepository.findByUserId(userId).stream().map(this::toAccountResponse).toList();
    }

    public AccountResponse getAccount(Long id, Long userId) {
        Account account = getOwnedAccount(id, userId);
        return toAccountResponse(account);
    }

    @Transactional
    public AccountResponse deposit(Long id, Long userId, BigDecimal amount) {
        validatePositiveAmount(amount);
        Account account = getOwnedAccount(id, userId);
        account.setBalance(account.getBalance().add(amount));
        accountTransactionRepository.save(new AccountTransaction(account, AccountTransaction.Type.DEPOSIT, amount, null));
        Account saved = accountRepository.save(account);
        return toAccountResponse(saved);
    }

    @Transactional
    public AccountResponse withdraw(Long id, Long userId, BigDecimal amount) {
        validatePositiveAmount(amount);
        Account account = getOwnedAccount(id, userId);
        BigDecimal newBalance = computeNewBalanceOrThrow(account, amount);
        account.setBalance(newBalance);
        accountTransactionRepository.save(new AccountTransaction(account, AccountTransaction.Type.WITHDRAW, amount, null));
        return toAccountResponse(accountRepository.save(account));
    }

    @Transactional
    public void transfer(Long userId, Long fromAccountId, Long toAccountId, BigDecimal amount) {
        validatePositiveAmount(amount);
        Account from = getOwnedAccount(fromAccountId, userId);
        Account to = getOwnedAccount(toAccountId, userId);
        if (from.getId().equals(to.getId())) {
            throw new IllegalArgumentException("fromAccountId and toAccountId must differ");
        }

        BigDecimal newFromBalance = computeNewBalanceOrThrow(from, amount);

        String reference = "TRF-" + UUID.randomUUID();
        from.setBalance(newFromBalance);
        to.setBalance(to.getBalance().add(amount));
        accountRepository.save(from);
        Account savedTo = accountRepository.save(to);
        accountTransactionRepository.save(new AccountTransaction(from, AccountTransaction.Type.TRANSFER_OUT, amount, reference));
        accountTransactionRepository.save(new AccountTransaction(savedTo, AccountTransaction.Type.TRANSFER_IN, amount, reference));
    }

    public List<TransactionResponse> getTransactions(Long accountId, Long userId) {
        getOwnedAccount(accountId, userId);
        return accountTransactionRepository.findByAccountIdOrderByCreatedAtDesc(accountId).stream()
                .map(this::toTransactionResponse)
                .toList();
    }

    private void validateCreateRequest(CreateAccountRequest request) {
        if (request.getFirstName() == null || request.getFirstName().isBlank()) {
            throw new IllegalArgumentException("firstName is required");
        }
        if (request.getLastName() == null || request.getLastName().isBlank()) {
            throw new IllegalArgumentException("lastName is required");
        }
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new IllegalArgumentException("password is required");
        }
    }

    private void normalizeNamesFromCustomerName(CreateAccountRequest request) {
        if ((request.getFirstName() == null || request.getFirstName().isBlank())
                && (request.getLastName() == null || request.getLastName().isBlank())
                && request.getCustomerName() != null && !request.getCustomerName().isBlank()) {
            String[] parts = request.getCustomerName().trim().split("\\s+", 2);
            request.setFirstName(parts[0]);
            request.setLastName(parts.length > 1 ? parts[1] : "");
        }
    }

    private AccountResponse toAccountResponse(Account account) {
        return new AccountResponse(
                account.getId(),
                account.getUser().getId(),
                account.getAccountNumber(),
                account.getAccountType(),
                account.getBalance(),
                account.getStatus(),
                account.getOverdraftLimit()
        );
    }

    private Account getOwnedAccount(Long accountId, Long userId) {
        Account account = accountRepository.findById(accountId).orElseThrow(() -> new RuntimeException("Account not found"));
        if (userId != null && !account.getUser().getId().equals(userId)) {
            throw new RuntimeException("Forbidden account access");
        }
        return account;
    }

    private com.apex.bank.Enums.AccountType resolveType(CreateAccountRequest request) {
        String rawType = request.getType() != null && !request.getType().isBlank()
                ? request.getType()
                : request.getAccountType();
        if (rawType == null) {
            throw new IllegalArgumentException("type is required");
        }
        if ("CURRENT".equalsIgnoreCase(rawType)) {
            return com.apex.bank.Enums.AccountType.CURRENT;
        }
        if ("SAVINGS".equalsIgnoreCase(rawType)) {
            return com.apex.bank.Enums.AccountType.SAVINGS;
        }
        throw new IllegalArgumentException("type must be CURRENT or SAVINGS");
    }

    private User findOrCreateUser(CreateAccountRequest request) {
        return userRepository
                .findByFirstNameIgnoreCaseAndLastNameIgnoreCase(request.getFirstName(), request.getLastName())
                .map(existing -> validateExistingUserPassword(existing, request.getPassword()))
                .orElseGet(() -> userRepository.save(
                        new User(
                                request.getFirstName(),
                                request.getLastName(),
                                passwordEncoder.encode(request.getPassword())
                        )
                ));
    }

    private User validateExistingUserPassword(User existing, String rawPassword) {
        if (!passwordEncoder.matches(rawPassword, existing.getPasswordHash())) {
            throw new IllegalArgumentException("Existing user password does not match");
        }
        return existing;
    }

    private void validatePositiveAmount(BigDecimal amount) {
        if (amount == null || amount.signum() <= 0) {
            throw new IllegalArgumentException("amount must be > 0");
        }
    }

    private BigDecimal computeNewBalanceOrThrow(Account account, BigDecimal amount) {
        BigDecimal newBalance = account.getBalance().subtract(amount);
        validateBalanceByAccountType(account, newBalance);
        return newBalance;
    }

    private void validateBalanceByAccountType(Account account, BigDecimal newBalance) {
        if ("SAVINGS".equalsIgnoreCase(account.getAccountType()) && newBalance.signum() < 0) {
            throw new RuntimeException("Savings account cannot go below zero");
        }
        if ("CURRENT".equalsIgnoreCase(account.getAccountType()) && account.getOverdraftLimit() != null) {
            BigDecimal minBalance = account.getOverdraftLimit().negate();
            if (newBalance.compareTo(minBalance) < 0) {
                throw new RuntimeException("Overdraft limit exceeded");
            }
        }
    }

    private TransactionResponse toTransactionResponse(AccountTransaction tx) {
        return new TransactionResponse(
                tx.getId(),
                tx.getType().name(),
                tx.getAmount(),
                tx.getCreatedAt(),
                tx.getReference()
        );
    }
}
