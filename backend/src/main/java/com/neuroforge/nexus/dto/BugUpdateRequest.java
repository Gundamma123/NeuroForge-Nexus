package com.neuroforge.nexus.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.Optional;

// Partial update: any field left out of the JSON stays unchanged.
@Data
public class BugUpdateRequest {

    @Size(max = 255, message = "Title must be 255 characters or fewer")
    private String title;

    @Size(max = 20000, message = "Description is too long")
    private String description;

    private Long projectId;

    @Size(max = 100, message = "Module / feature must be 100 characters or fewer")
    private String moduleFeature;

    private String environment;
    private String severity;
    private String priority;
    private String status;

    // Field absent from JSON -> null (leave unchanged)
    // JSON null              -> Optional.empty() (unassign)
    // JSON number            -> Optional.of(id) (assign)
    private Optional<Long> assignedToId;
}