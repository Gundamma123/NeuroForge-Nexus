package com.neuroforge.nexus.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

@Data
public class SprintRequest {

    @NotBlank(message = "Sprint name is required")
    private String name;

    private Long projectId;

    private Integer taskCount;

    private Integer points;

    private LocalDate startDate;

    private LocalDate endDate;

    private String status;
}