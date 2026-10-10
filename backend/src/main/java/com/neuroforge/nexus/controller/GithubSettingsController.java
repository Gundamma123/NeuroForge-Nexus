package com.neuroforge.nexus.controller;

import com.neuroforge.nexus.entity.ProjectGithubRepository;
import com.neuroforge.nexus.service.GithubApiService;
import com.neuroforge.nexus.service.GithubRepoLinkService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/github/projects/{projectId}")
public class GithubSettingsController {

    private final GithubRepoLinkService linkService;
    private final GithubApiService githubApiService;

    public GithubSettingsController(GithubRepoLinkService linkService, GithubApiService githubApiService) {
        this.linkService = linkService;
        this.githubApiService = githubApiService;
    }

    private ResponseEntity<Map<String, String>> message(HttpStatus status, String text) {
        return ResponseEntity.status(status).body(Map.of("message", text));
    }

    // Collaborators and webhooks are fetched with the ACTING user's own token,
    // so GitHub decides who may see them. null means "not visible to your account".
    @GetMapping("/settings")
    public ResponseEntity<?> settings(@PathVariable Long projectId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        Optional<ProjectGithubRepository> opt = linkService.findLink(projectId);
        if (opt.isEmpty()) return message(HttpStatus.NOT_FOUND, "No repository is linked to this project.");
        ProjectGithubRepository link = opt.get();

        String token = githubApiService.tokenFor(email);
        if (token == null) {
            return message(HttpStatus.CONFLICT, "Connect your GitHub account to view repository settings.");
        }

        Map<String, Object> general = githubApiService.getRepoGeneral(token, link.getRepoOwner(), link.getRepoName());
        if (general == null) {
            return message(HttpStatus.BAD_GATEWAY, "Could not load this repository from GitHub with your account.");
        }

        Map<String, Object> sync = new LinkedHashMap<>();
        sync.put("active", link.isSyncActive());
        sync.put("linkedBy", link.getLinkedByEmail() == null ? "" : link.getLinkedByEmail());

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("general", general);
        out.put("sync", sync);
        out.put("collaborators", githubApiService.getCollaborators(token, link.getRepoOwner(), link.getRepoName()));
        out.put("webhooks", githubApiService.getWebhooks(token, link.getRepoOwner(), link.getRepoName()));
        return ResponseEntity.ok(out);
    }

    // Pause / resume the NeuroForge -> GitHub issue sync for this project.
    @PatchMapping("/sync")
    public ResponseEntity<?> setSync(@PathVariable Long projectId, @RequestBody Map<String, Boolean> body) {
        Boolean active = body == null ? null : body.get("active");
        if (active == null) return message(HttpStatus.BAD_REQUEST, "\"active\" (true or false) is required.");

        ProjectGithubRepository saved = linkService.setSyncActive(projectId, active);
        return ResponseEntity.ok(Map.of("syncActive", saved.isSyncActive()));
    }
}