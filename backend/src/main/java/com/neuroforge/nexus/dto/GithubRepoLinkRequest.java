package com.neuroforge.nexus.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class GithubRepoLinkRequest {

    @NotBlank(message = "Repository owner is required")
    private String repoOwner;

    @NotBlank(message = "Repository name is required")
    private String repoName;
}