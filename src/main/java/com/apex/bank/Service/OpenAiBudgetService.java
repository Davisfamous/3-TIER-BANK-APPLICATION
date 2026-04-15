package com.apex.bank.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class OpenAiBudgetService {
    private static final int MAX_STORED_TEXT_LENGTH = 3900;

    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    private final String apiKey;
    private final String model;

    public OpenAiBudgetService(@Value("${gemini.base-url:https://generativelanguage.googleapis.com/v1beta}") String baseUrl,
                               @Value("${gemini.api-key:}") String apiKey,
                               @Value("${gemini.model:gemini-2.5-flash}") String model) {
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .build();
        this.objectMapper = new ObjectMapper();
        this.apiKey = apiKey;
        this.model = model;
    }

    public String generateBudget(String prompt) {
        if (prompt == null || prompt.trim().isEmpty()) {
            throw new RuntimeException("Please enter a budget prompt before generating an AI budget.");
        }
        if (apiKey == null || apiKey.isBlank()) {
            throw new RuntimeException("AI budget generation is not configured. Set GEMINI_API_KEY before using this feature.");
        }

        Map<String, Object> requestBody = new LinkedHashMap<>();
        requestBody.put("systemInstruction", Map.of(
                "parts", List.of(
                        Map.of(
                                "text", """
                                        You are a personal budgeting assistant for a banking app.
                                        Read the user's note and produce a practical monthly budget plan.
                                        Keep the answer concise, realistic, and easy to follow.
                                        Include:
                                        1. a short summary of the user's situation,
                                        2. a recommended monthly allocation with percentages or amounts,
                                        3. 3 to 5 concrete next steps,
                                        4. one risk or tradeoff to watch.
                                        Stay under 1500 characters.
                                        """
                        )
                )
        ));
        requestBody.put("contents", List.of(
                Map.of(
                        "role", "user",
                        "parts", List.of(
                                Map.of(
                                        "text", "Create a budget from this user prompt: " + prompt.trim()
                                )
                        )
                )
        ));
        requestBody.put("generationConfig", Map.of(
                "temperature", 0.7,
                "maxOutputTokens", 1200,
                "thinkingConfig", Map.of(
                        "thinkingBudget", 0
                )
        ));

        try {
            String responseBody = restClient.post()
                    .uri(uriBuilder -> uriBuilder
                            .path("/models/{model}:generateContent")
                            .build(model))
                    .contentType(MediaType.APPLICATION_JSON)
                    .header("x-goog-api-key", apiKey)
                    .body(requestBody)
                    .retrieve()
                    .body(String.class);

            String output = extractText(responseBody);
            if (output.isBlank()) {
                throw new RuntimeException("The AI service returned an empty budget. Please try rephrasing your prompt.");
            }
            return truncate(toPlainText(output));
        } catch (RestClientResponseException ex) {
            throw new RuntimeException(resolveApiErrorMessage(ex), ex);
        } catch (RuntimeException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new RuntimeException("We couldn't generate a budget right now. Please try again in a moment.", ex);
        }
    }

    String extractText(String responseBody) throws Exception {
        JsonNode root = objectMapper.readTree(responseBody);
        JsonNode candidates = root.path("candidates");
        if (candidates.isArray()) {
            for (JsonNode candidate : candidates) {
                JsonNode parts = candidate.path("content").path("parts");
                if (!parts.isArray()) {
                    continue;
                }
                StringBuilder combinedText = new StringBuilder();
                for (JsonNode part : parts) {
                    String text = part.path("text").asText("");
                    if (!text.isBlank()) {
                        if (!combinedText.isEmpty()) {
                            combinedText.append("\n");
                        }
                        combinedText.append(text.trim());
                    }
                }
                String result = combinedText.toString().trim();
                if (!result.isBlank()) {
                    return result;
                }
            }
        }

        return "";
    }

    String toPlainText(String value) {
        String normalized = value
                .replace("\\$", "$")
                .replace("\r\n", "\n")
                .replace("\r", "\n")
                .replaceAll("\\*\\*(.*?)\\*\\*", "$1")
                .replaceAll("(?m)^\\*\\s+", "- ")
                .replaceAll("(?m)^\\*\\s{2,}", "- ")
                .replaceAll("(?m)^\\s*[-*]\\s+", "- ")
                .replaceAll("(?m)^\\s*(\\d+)\\.\\s+", "$1. ")
                .replaceAll("(?m)[ \\t]+$", "")
                .replaceAll("(?m)^[ \\t]+", "")
                .replaceAll("[ \\t]+", " ")
                .trim();

        normalized = normalized
                .replaceAll("(?<!\\n)\\n(- |\\d+\\. )", "\n\n$1")
                .replaceAll("(?m)(- .*)\\n\\n(- )", "$1\n$2")
                .replaceAll("(?m)(\\d+\\. .*)\\n\\n(\\d+\\. )", "$1\n$2")
                .replaceAll("\\n{3,}", "\n\n");

        return normalized;
    }

    private String resolveApiErrorMessage(RestClientResponseException ex) {
        try {
            JsonNode root = objectMapper.readTree(ex.getResponseBodyAsString());
            String message = root.path("error").path("message").asText("");
            if (!message.isBlank()) {
                return "Gemini request failed: " + message;
            }
        } catch (Exception ignored) {
        }
        return "Gemini request failed with status " + ex.getStatusCode() + ".";
    }

    private String truncate(String value) {
        if (value.length() <= MAX_STORED_TEXT_LENGTH) {
            return value;
        }
        return value.substring(0, MAX_STORED_TEXT_LENGTH - 3).trim() + "...";
    }
}
