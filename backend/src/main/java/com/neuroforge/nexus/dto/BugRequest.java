package com.neuroforge.nexus.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

// Create request. "reportedBy" is deliberately NOT here: it always comes from the
// logged-in user, so a client can't report a bug in someone else's name.
@Data
public class BugRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title must be 255 characters or fewer")
    private String title;

    @Size(max = 20000, message = "Description is too long")
    private String description;

    @NotNull(message = "Project is required")
    private Long projectId;

    @Size(max = 100, message = "Module / feature must be 100 characters or fewer")
    private String moduleFeature;

    private String environment;
    private String severity;
    private String priority;
    private Long assignedToId;
}