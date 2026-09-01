package com.neuroforge.nexus.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

@Data
public class MilestoneRequest {

    @NotBlank(message = "Milestone name is required")
    private String name;

    private Long projectId;

    private LocalDate dueDate;

    private String status;
}