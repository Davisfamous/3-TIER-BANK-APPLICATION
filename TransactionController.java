package com.apex.bank.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.apex.bank.Service.BankService;
import com.apex.bank.model.Transaction;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = "http://localhost:3000")

public class TransactionController {

    private final BankService service;

    public TransactionController(BankService service) {
        this.service = service;
    }

    @GetMapping
    public List<Transaction> getByAccountNumber() {
        return service.allTransactions();
        
        
    }
}
