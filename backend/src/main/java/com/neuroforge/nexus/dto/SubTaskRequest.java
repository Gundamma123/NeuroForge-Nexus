package com.neuroforge.nexus.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

@Data
public class SubTaskRequest {

    @NotBlank(message = "Sub-task title is required")
    private String title;

    private String description;

    private Long taskId;

    private Long assigneeId;

    private String status;

    private LocalDate dueDate;

    // Add this field inside SubTaskRequest, alongside the existing fields:

    private String tier;
}