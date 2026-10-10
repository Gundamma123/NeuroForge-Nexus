package com.neuroforge.nexus.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class ChatRequest {

    @NotEmpty(message = "At least one message is required")
    private List<ChatMessage> messages;

    @Data
    public static class ChatMessage {
        private String role;
        private String content;
    }
}