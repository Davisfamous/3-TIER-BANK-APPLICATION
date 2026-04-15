

package com.apex.bank.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.apex.bank.Service.AccountService;
import com.apex.bank.dto.AmountRequest;
import com.apex.bank.dto.AccountResponse;
import com.apex.bank.dto.CreateAccountRequest;
import com.apex.bank.dto.TransferRequest;
import com.apex.bank.dto.TransactionResponse;

@RestController
@RequestMapping("/api/accounts")
@CrossOrigin(origins = "http://localhost:3000")
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @PostMapping
    public AccountResponse createAccount(@RequestBody CreateAccountRequest request) {
        return accountService.create(request);
    }

    @GetMapping
    public List<AccountResponse> getAccounts(@RequestParam(required = false) String userId) {
        return accountService.getAccounts(parseUserId(userId));
    }

    @GetMapping("/{id}")
    public AccountResponse getAccount(@PathVariable Long id, @RequestParam(required = false) String userId) {
        return accountService.getAccount(id, parseUserId(userId));
    }

    @PostMapping("/{id}/deposit")
    public AccountResponse deposit(@PathVariable Long id, @RequestParam(required = false) String userId, @RequestBody AmountRequest request) {
        return accountService.deposit(id, parseUserId(userId), request.getAmount());
    }

    @PostMapping("/{id}/withdraw")
    public AccountResponse withdraw(@PathVariable Long id, @RequestParam(required = false) String userId, @RequestBody AmountRequest request) {
        return accountService.withdraw(id, parseUserId(userId), request.getAmount());
    }

    @PostMapping("/transfer")
    public void transfer(@RequestParam(required = false) String userId, @RequestBody TransferRequest request) {
        accountService.transfer(parseUserId(userId), request.getFromAccountId(), request.getToAccountId(), request.getAmount());
    }

    @GetMapping("/{id}/transactions")
    public List<TransactionResponse> transactions(@PathVariable Long id, @RequestParam(required = false) String userId) {
        return accountService.getTransactions(id, parseUserId(userId));
    }

    private Long parseUserId(String userId) {
        if (userId == null || userId.isBlank() || "undefined".equalsIgnoreCase(userId) || "null".equalsIgnoreCase(userId)) {
            return null;
        }
        try {
            return Long.valueOf(userId);
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
