package com.apex.bank.Service;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class OpenAiBudgetServiceTest {

    @Test
    void extractTextCombinesAllGeminiTextParts() throws Exception {
        OpenAiBudgetService service = new OpenAiBudgetService(
                "https://generativelanguage.googleapis.com/v1beta",
                "test-key",
                "gemini-2.5-flash"
        );

        String responseBody = """
                {
                  "candidates": [
                    {
                      "content": {
                        "parts": [
                          { "text": "Here's a practical monthly budget plan for you:" },
                          { "text": "**Your Situation:** You earn $3200/month." },
                          { "text": "**Suggested Allocation:** Needs 50%, wants 30%, savings 20%." }
                        ]
                      }
                    }
                  ]
                }
                """;

        String extracted = service.extractText(responseBody);

        assertEquals("""
                Here's a practical monthly budget plan for you:
                **Your Situation:** You earn $3200/month.
                **Suggested Allocation:** Needs 50%, wants 30%, savings 20%.
                """.trim(), extracted);
    }

    @Test
    void toPlainTextRemovesMarkdownFormatting() {
        OpenAiBudgetService service = new OpenAiBudgetService(
                "https://generativelanguage.googleapis.com/v1beta",
                "test-key",
                "gemini-2.5-flash"
        );

        String formatted = """
                Here's your monthly budget:

                **Summary:** You earn \\$3200 and want to save \\$500.

                * **Savings:** \\$500
                * **Food:** \\$400

                1. **Track spending**
                2. **Reduce delivery**
                """;

        String plainText = service.toPlainText(formatted);

        assertEquals("""
                Here's your monthly budget:

                Summary: You earn $3200 and want to save $500.

                - Savings: $500
                - Food: $400

                1. Track spending
                2. Reduce delivery
                """.trim(), plainText);
    }
}
