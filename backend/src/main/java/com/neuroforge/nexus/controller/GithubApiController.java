package com.neuroforge.nexus.controller;

import com.neuroforge.nexus.entity.ProjectGithubRepository;
import com.neuroforge.nexus.repository.ProjectGithubRepositoryRepository;
import com.neuroforge.nexus.service.GithubApiService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/github")
public class GithubApiController {

    private static final Pattern SAFE = Pattern.compile("^[A-Za-z0-9_.-]{1,100}$");
    // private static final Set<String> SECTIONS = Set.of("branches", "commits", "pulls", "issues");
    private static final Set<String> SECTIONS = Set.of(
    "branches",
    "commits",
    "pulls",
    "issues",
    "runs",
    "deployments",
    "releases"
);

    private final GithubApiService githubApiService;
    private final ProjectGithubRepositoryRepository linkRepository;

    public GithubApiController(GithubApiService githubApiService,
                                ProjectGithubRepositoryRepository linkRepository) {
        this.githubApiService = githubApiService;
        this.linkRepository = linkRepository;
    }

    private String email() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    private boolean unsafe(String s) {
        return !SAFE.matcher(s).matches() || s.matches("\\.+");
    }

    // Repos the connected GitHub account can access (feeds the link dropdown)
    @GetMapping("/repos")
public ResponseEntity<List<Map<String, Object>>> myRepos() {
    String token = githubApiService.tokenFor(email());

    if (token == null || token.isBlank()) {
        return ResponseEntity.status(409).body(List.of());
    }

    return ResponseEntity.ok(githubApiService.listRepos(token));
}

    // Repos already linked to NeuroForge projects (feeds the sidebar list)
    @GetMapping("/linked")
    public ResponseEntity<List<ProjectGithubRepository>> linked() {
        return ResponseEntity.ok(linkRepository.findAll());
    }

    @GetMapping("/repos/{owner}/{repo}")
    public ResponseEntity<Map<String, Object>> repo(@PathVariable String owner, @PathVariable String repo) {
        if (unsafe(owner) || unsafe(repo)) return ResponseEntity.badRequest().build();
        String repositoryName = owner + "/" + repo;
        Map<String, Object> details = githubApiService.listRepos(email()).stream()
                .filter(item -> repositoryName.equals(item.get("full_name")))
                .findFirst()
                .orElse(null);
        return details == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(details);
    }

   @GetMapping("/repos/{owner}/{repo}/{section}")
public ResponseEntity<List<Map<String, Object>>> section(
        @PathVariable String owner,
        @PathVariable String repo,
        @PathVariable String section) {

    if (unsafe(owner) || unsafe(repo) || !SECTIONS.contains(section)) {
        return ResponseEntity.badRequest().build();
    }

    String token = githubApiService.tokenFor(email());

    if (token == null || token.isBlank()) {
        return ResponseEntity.status(409).body(List.of());
    }

    List<Map<String, Object>> result =
            githubApiService.getSection(token, owner, repo, section);

    if (result == null) {
        return ResponseEntity.status(502).body(List.of());
    }

    return ResponseEntity.ok(result);
}
}