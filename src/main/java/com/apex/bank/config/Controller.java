package com.apex.bank.config;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.apex.bank.Service.BankService;
import com.apex.bank.model.BankAccount;

@RestController
@RequestMapping("/api/legacy/bank-accounts")
@CrossOrigin(origins = "http://localhost:3000")
public class Controller {

    private final BankService bankService;

    public Controller(BankService bankService) {
        this.bankService = bankService;
    }

    @GetMapping
    public List<BankAccount> getAllAccounts() {
        return bankService.getAllAccounts();
    }
}
