package com.apex.bank.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.apex.bank.Service.BankService;
import com.apex.bank.model.Transaction;


@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/legacy/accounts")
public class BankController {

    private final BankService service;

    public BankController(BankService service) {
        this.service = service;
    }
    
    @GetMapping("/ping")
public String ping() {
    return "API is working";
}


    @PostMapping("/{accNo}/deposit")
    public void deposit(@PathVariable String accNo,
                        @RequestParam double amount) {
        service.deposit(accNo, amount);
    }

    @PostMapping("/{accNo}/withdraw")
    public void withdraw(@PathVariable String accNo,
    
    @RequestParam double amount) {
        service.withdraw(accNo, amount);
    }

    @GetMapping("/{accNo}/transactions")
    public List<Transaction> transactions(@PathVariable String accNo) {
        return service.transactions(accNo);
        
    }
}
