package com.apex.bank.Service;

import java.util.concurrent.ThreadLocalRandom;

import org.springframework.stereotype.Component;

@Component
public class Accountnumgenerator {
    public String generateAccountNumber(com.apex.bank.Enums.AccountType type) {
        long randomNumber = ThreadLocalRandom.current().nextLong(10_000_000_000L);
        String digits = String.format("%010d", randomNumber);
        return type == com.apex.bank.Enums.AccountType.CURRENT ? "CUR-" + digits : "SAV-" + digits;
    }
}
