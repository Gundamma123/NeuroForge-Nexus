package com.neuroforge.nexus.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
public class TeamRequest {

    @NotBlank(message = "Team name is required")
    private String name;

    private Long projectId;

    private Integer memberCount;

    // Optional: IDs from the Member pool selected on the Select Members page.
    // When provided, this takes priority over memberCount (which is auto-derived instead).
    private List<Long> memberIds;
}