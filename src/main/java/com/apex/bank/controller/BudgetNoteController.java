package com.apex.bank.controller;

import com.apex.bank.Service.OpenAiBudgetService;
import com.apex.bank.dto.BudgetNoteGenerateResponse;
import com.apex.bank.dto.BudgetNoteRequest;
import com.apex.bank.model.BudgetNote;
import com.apex.bank.repository.BudgetNoteRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/budget-notes")
@CrossOrigin(origins = "http://localhost:3000")
public class BudgetNoteController {
    private final BudgetNoteRepository budgetNoteRepository;
    private final OpenAiBudgetService openAiBudgetService;

    public BudgetNoteController(BudgetNoteRepository budgetNoteRepository,
                                OpenAiBudgetService openAiBudgetService) {
        this.budgetNoteRepository = budgetNoteRepository;
        this.openAiBudgetService = openAiBudgetService;
    }


    @PostMapping
    public BudgetNote createBudgetNote(@RequestBody BudgetNoteRequest request) {
        if (request.getUserId() == null) {
            throw new RuntimeException("A userId is required to create a budget note.");
        }

        String trimmedNote = request.getNote() == null ? "" : request.getNote().trim();
        if (trimmedNote.isEmpty()) {
            throw new RuntimeException("Please describe your budget goal before submitting.");
        }

        BudgetNote note = new BudgetNote(request.getUserId(), trimmedNote, null);
        return budgetNoteRepository.save(note);
    }

    @PostMapping("/generate")
    public BudgetNoteGenerateResponse generateBudgetNote(@RequestBody BudgetNoteRequest request) {
        String trimmedPrompt = request.getNote() == null ? "" : request.getNote().trim();
        if (trimmedPrompt.isEmpty()) {
            throw new RuntimeException("Please enter a budget prompt before generating an AI budget.");
        }

        String generatedNote = openAiBudgetService.generateBudget(trimmedPrompt);
        return new BudgetNoteGenerateResponse(generatedNote);
    }

    @GetMapping
    public List<BudgetNote> getBudgetNotes(@RequestParam Long userId) {
        return budgetNoteRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
}
