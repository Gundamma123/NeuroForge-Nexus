package com.neuroforge.nexus.dto;

import com.neuroforge.nexus.entity.Bug;

import java.time.Instant;

// What the API returns. Never the raw entity, so no user emails or tokens leak.
public record BugResponse(
        Long id,
        String key,
        String title,
        String description,
        Long projectId,
        String projectName,
        String moduleFeature,
        String environment,
        String severity,
        String priority,
        String status,
        Long assignedToId,
        String assignedToName,
        Long reportedById,
        String reportedByName,
        Instant createdAt,
        Instant updatedAt,
        boolean canDelete) {

    public static BugResponse from(Bug b, boolean canDelete) {
        return new BugResponse(
                b.getId(),
                "BUG-" + b.getId(),
                b.getTitle(),
                b.getDescription(),
                b.getProject().getId(),
                b.getProject().getName(),
                b.getModuleFeature(),
                b.getEnvironment(),
                b.getSeverity(),
                b.getPriority(),
                b.getStatus(),
                b.getAssignedTo() != null ? b.getAssignedTo().getId() : null,
                b.getAssignedTo() != null ? b.getAssignedTo().getName() : null,
                b.getReportedBy().getId(),
                b.getReportedBy().getName(),
                b.getCreatedAt(),
                b.getUpdatedAt(),
                canDelete);
    }
}