// package com.neuroforge.nexus.controller;

// import com.neuroforge.nexus.entity.ProjectGithubRepository;
// import com.neuroforge.nexus.service.GithubApiService;
// import com.neuroforge.nexus.service.GithubRepoLinkService;
// import org.slf4j.Logger;
// import org.slf4j.LoggerFactory;
// import org.springframework.http.HttpStatus;
// import org.springframework.http.ResponseEntity;
// import org.springframework.security.core.context.SecurityContextHolder;
// import org.springframework.web.bind.annotation.*;

// import java.util.Map;
// import java.util.Optional;
// import java.util.regex.Pattern;

// @RestController
// @RequestMapping("/github/projects/{projectId}/pulls")
// public class GithubPullRequestController {

//     private static final Logger log = LoggerFactory.getLogger(GithubPullRequestController.class);
//     private static final Pattern SHA = Pattern.compile("^[0-9a-fA-F]{40}$");

//     private final GithubRepoLinkService linkService;
//     private final GithubApiService githubApiService;

//     public GithubPullRequestController(GithubRepoLinkService linkService, GithubApiService githubApiService) {
//         this.linkService = linkService;
//         this.githubApiService = githubApiService;
//     }

//     private ResponseEntity<Map<String, Object>> fail(HttpStatus status, String message) {
//         return ResponseEntity.status(status).body(Map.of("merged", false, "message", message));
//     }

//     @PostMapping("/{number:\\d+}/merge")
//     public ResponseEntity<Map<String, Object>> merge(
//             @PathVariable Long projectId,
//             @PathVariable int number,
//             @RequestBody(required = false) Map<String, String> body) {

//         String email = SecurityContextHolder.getContext().getAuthentication().getName();

//         // owner/repo come from the database, never from the request
//         Optional<ProjectGithubRepository> opt = Optional.empty();
//         for (java.lang.reflect.Method lookup : linkService.getClass().getMethods()) {
//             if (lookup.getParameterCount() != 1 || lookup.getParameterTypes()[0] != Long.class) {
//                 continue;
//             }
//             try {
//                 Object value = lookup.invoke(linkService, projectId);
//                 if (value instanceof ProjectGithubRepository repository) {
//                     opt = Optional.of(repository);
//                     break;
//                 }
//                 if (value instanceof Optional<?> optional) {
//                     opt = optional.filter(ProjectGithubRepository.class::isInstance)
//                             .map(ProjectGithubRepository.class::cast);
//                     if (opt.isPresent()) break;
//                 }
//             } catch (IllegalAccessException | java.lang.reflect.InvocationTargetException ignored) {
//                 // Ignore lookup methods that cannot be invoked for this project.
//             }
//         }
//         if (opt.isEmpty()) return fail(HttpStatus.NOT_FOUND, "No repository is linked to this project.");
//         ProjectGithubRepository link = opt.get();

//         // Writes use the ACTING user's own GitHub token, so GitHub enforces their permissions.
//         String token = githubApiService.tokenFor(email);
//         if (token == null) return fail(HttpStatus.CONFLICT, "Connect your GitHub account first.");

//         String method = body != null ? body.get("method") : null;
//         String sha = body != null ? body.get("sha") : null;
//         if (sha != null && !SHA.matcher(sha).matches()) sha = null;

//         Map<String, Object> result = githubApiService.mergePullRequest(
//                 token, link.getRepoOwner(), link.getRepoName(), number, method, sha);

//         if (Boolean.TRUE.equals(result.get("merged"))) {
//             log.info("PR #{} merged in {}/{} by {}", number, link.getRepoOwner(), link.getRepoName(), email);
//             return ResponseEntity.ok(result);
//         }
//         return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(result);
//     }
// }

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
import java.util.regex.Pattern;

@RestController
@RequestMapping("/github/projects/{projectId}/pulls")
public class GithubPullRequestController {

    private static final Logger log = LoggerFactory.getLogger(GithubPullRequestController.class);
    private static final Pattern SHA = Pattern.compile("^[0-9a-fA-F]{40}$");

    private final GithubRepoLinkService linkService;
    private final GithubApiService githubApiService;

    public GithubPullRequestController(GithubRepoLinkService linkService, GithubApiService githubApiService) {
        this.linkService = linkService;
        this.githubApiService = githubApiService;
    }

    private ResponseEntity<Map<String, Object>> mergeFail(HttpStatus status, String message) {
        return ResponseEntity.status(status).body(Map.of("merged", false, "message", message));
    }

    private ResponseEntity<Map<String, Object>> error(HttpStatus status, String message) {
        return ResponseEntity.status(status).body(Map.of("message", message));
    }

    // Read-only: files changed + review status, using the linking account's token
    // (same as the other read tabs). owner/repo come from the database.
    @GetMapping("/{number:\\d{1,9}}/details")
    public ResponseEntity<Map<String, Object>> details(@PathVariable Long projectId, @PathVariable int number) {
        Optional<ProjectGithubRepository> opt = linkService.findLink(projectId);
        if (opt.isEmpty()) return error(HttpStatus.NOT_FOUND, "No repository is linked to this project.");
        ProjectGithubRepository link = opt.get();

        String token = githubApiService.tokenFor(link.getLinkedByEmail());
        if (token == null) {
            return error(HttpStatus.CONFLICT,
                    "The GitHub account that linked this repository is disconnected. Reconnect it, or link the repository again.");
        }

        Map<String, Object> data = githubApiService.getPullDetails(
                token, link.getRepoOwner(), link.getRepoName(), number);
        if (data == null) return error(HttpStatus.BAD_GATEWAY, "Could not load this pull request from GitHub.");
        return ResponseEntity.ok(data);
    }

    // Merge uses the ACTING user's own token, so GitHub enforces their permissions.
    @PostMapping("/{number:\\d{1,9}}/merge")
    public ResponseEntity<Map<String, Object>> merge(
            @PathVariable Long projectId,
            @PathVariable int number,
            @RequestBody(required = false) Map<String, String> body) {

        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        Optional<ProjectGithubRepository> opt = linkService.findLink(projectId);
        if (opt.isEmpty()) return mergeFail(HttpStatus.NOT_FOUND, "No repository is linked to this project.");
        ProjectGithubRepository link = opt.get();

        String token = githubApiService.tokenFor(email);
        if (token == null) return mergeFail(HttpStatus.CONFLICT, "Connect your GitHub account first.");

        String method = body != null ? body.get("method") : null;
        String sha = body != null ? body.get("sha") : null;
        if (sha != null && !SHA.matcher(sha).matches()) sha = null;

        Map<String, Object> result = githubApiService.mergePullRequest(
                token, link.getRepoOwner(), link.getRepoName(), number, method, sha);

        if (Boolean.TRUE.equals(result.get("merged"))) {
            log.info("PR #{} merged in {}/{} by {}", number, link.getRepoOwner(), link.getRepoName(), email);
            return ResponseEntity.ok(result);
        }
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(result);
    }
}