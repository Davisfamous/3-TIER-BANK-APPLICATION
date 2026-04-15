package com.apex.bank.controller;

import com.apex.bank.Service.OpenAiBudgetService;
import com.apex.bank.dto.BudgetNoteGenerateResponse;
import com.apex.bank.dto.BudgetNoteRequest;
import com.apex.bank.model.BudgetNote;
import com.apex.bank.repository.BudgetNoteRepository;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class BudgetNoteControllerTest {

    @Test
    void createsManualBudgetNoteWithoutCallingAi() {
        BudgetNoteRepository repository = mock(BudgetNoteRepository.class);
        OpenAiBudgetService aiService = mock(OpenAiBudgetService.class);
        BudgetNoteController controller = new BudgetNoteController(repository, aiService);

        when(repository.save(any(BudgetNote.class))).thenAnswer(invocation -> invocation.getArgument(0));

        BudgetNoteRequest request = new BudgetNoteRequest();
        request.setUserId(7L);
        request.setNote("Track groceries and rent.");
        request.setAi(false);

        BudgetNote saved = controller.createBudgetNote(request);

        assertEquals("Track groceries and rent.", saved.getNote());
        assertNull(saved.getAiSuggestion());
        verify(aiService, never()).generateBudget(any());
    }

    @Test
    void generatesAiBudgetNoteWithoutSaving() {
        BudgetNoteRepository repository = mock(BudgetNoteRepository.class);
        OpenAiBudgetService aiService = mock(OpenAiBudgetService.class);
        BudgetNoteController controller = new BudgetNoteController(repository, aiService);

        when(aiService.generateBudget("Need a family budget for 4000 monthly income")).thenReturn("Generated monthly budget");

        BudgetNoteRequest request = new BudgetNoteRequest();
        request.setUserId(8L);
        request.setNote("Need a family budget for 4000 monthly income");

        BudgetNoteGenerateResponse response = controller.generateBudgetNote(request);

        assertEquals("Generated monthly budget", response.getGeneratedNote());
        verify(aiService).generateBudget("Need a family budget for 4000 monthly income");
        verify(repository, never()).save(any(BudgetNote.class));
    }

    @Test
    void rejectsBlankBudgetPromptWhenGenerating() {
        BudgetNoteRepository repository = mock(BudgetNoteRepository.class);
        OpenAiBudgetService aiService = mock(OpenAiBudgetService.class);
        BudgetNoteController controller = new BudgetNoteController(repository, aiService);

        BudgetNoteRequest request = new BudgetNoteRequest();
        request.setUserId(9L);
        request.setNote("   ");

        RuntimeException exception = assertThrows(RuntimeException.class, () -> controller.generateBudgetNote(request));

        assertEquals("Please enter a budget prompt before generating an AI budget.", exception.getMessage());
    }

    @Test
    void rejectsBlankBudgetNoteWhenSaving() {
        BudgetNoteRepository repository = mock(BudgetNoteRepository.class);
        OpenAiBudgetService aiService = mock(OpenAiBudgetService.class);
        BudgetNoteController controller = new BudgetNoteController(repository, aiService);

        BudgetNoteRequest request = new BudgetNoteRequest();
        request.setUserId(10L);
        request.setNote("   ");

        RuntimeException exception = assertThrows(RuntimeException.class, () -> controller.createBudgetNote(request));

        assertEquals("Please describe your budget goal before submitting.", exception.getMessage());
    }
}
