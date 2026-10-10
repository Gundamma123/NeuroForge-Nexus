package com.neuroforge.nexus.controller;

import com.neuroforge.nexus.entity.ProjectGithubRepository;
import com.neuroforge.nexus.service.GithubApiService;
import com.neuroforge.nexus.service.GithubRepoLinkService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/github/projects/{projectId}/runs")
public class GithubWorkflowController {

    private static final Logger log = LoggerFactory.getLogger(GithubWorkflowController.class);

    private final GithubRepoLinkService linkService;
    private final GithubApiService githubApiService;

    public GithubWorkflowController(GithubRepoLinkService linkService, GithubApiService githubApiService) {
        this.linkService = linkService;
        this.githubApiService = githubApiService;
    }

    private ResponseEntity<Map<String, Object>> fail(HttpStatus status, String message) {
        return ResponseEntity.status(status).body(Map.of("rerun", false, "message", message));
    }

    // Re-runs a workflow run using the ACTING user's own token, so GitHub decides who may do it.
    @PostMapping("/{runId:\\d{1,18}}/rerun")
    public ResponseEntity<Map<String, Object>> rerun(@PathVariable Long projectId, @PathVariable long runId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        Optional<ProjectGithubRepository> opt = linkService.findLink(projectId);
        if (opt.isEmpty()) return fail(HttpStatus.NOT_FOUND, "No repository is linked to this project.");
        ProjectGithubRepository link = opt.get();

        String token = githubApiService.tokenFor(email);
        if (token == null) return fail(HttpStatus.CONFLICT, "Connect your GitHub account first.");

        Map<String, Object> result = githubApiService.rerunWorkflow(
                token, link.getRepoOwner(), link.getRepoName(), runId);

        if (Boolean.TRUE.equals(result.get("rerun"))) {
            log.info("Workflow run {} re-run in {}/{} by {}", runId, link.getRepoOwner(), link.getRepoName(), email);
            return ResponseEntity.ok(result);
        }
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(result);
    }
}