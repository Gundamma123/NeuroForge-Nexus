package com.neuroforge.nexus.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

@Data
public class TaskRequest {

    @NotBlank(message = "Task title is required")
    private String title;

    private String description;

    private Long sprintId;

    private Long assigneeId;

    private String priority;

    private String status;

    private Integer storyPoints;

    private LocalDate startDate;

    private LocalDate dueDate;
}