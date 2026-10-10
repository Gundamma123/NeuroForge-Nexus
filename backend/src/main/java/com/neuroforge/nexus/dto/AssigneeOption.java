package com.neuroforge.nexus.dto;

// Minimal user info for the "Assigned To" dropdown (no emails, no tokens).
public record AssigneeOption(Long id, String name, String role) {}