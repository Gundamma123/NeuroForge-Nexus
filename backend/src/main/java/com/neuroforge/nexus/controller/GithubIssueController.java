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

// import java.util.List;
// import java.util.Map;
// import java.util.Objects;
// import java.util.Optional;

// @RestController
// @RequestMapping("/github/projects/{projectId}/issues")
// public class GithubIssueController {

//     private static final Logger log = LoggerFactory.getLogger(GithubIssueController.class);

//     public record IssueRequest(String title, String body, List<String> labels) {}

//     private final GithubRepoLinkService linkService;
//     private final GithubApiService githubApiService;

//     public GithubIssueController(GithubRepoLinkService linkService, GithubApiService githubApiService) {
//         this.linkService = linkService;
//         this.githubApiService = githubApiService;
//     }

//     private ResponseEntity<Map<String, Object>> fail(HttpStatus status, String message) {
//         return ResponseEntity.status(status).body(Map.of("created", false, "message", message));
//     }

//     // Creates a real GitHub issue using the ACTING user's own token, so GitHub
//     // decides whether that account may create issues here.
//     @PostMapping
//     public ResponseEntity<Map<String, Object>> create(@PathVariable Long projectId,
//                                                       @RequestBody IssueRequest request) {
//         // String email = SecurityContextHolder.getContext().getAuthentication().getName();
//         var authentication = SecurityContextHolder.getContext().getAuthentication();

// if (authentication == null
//         || !authentication.isAuthenticated()
//         || "anonymousUser".equals(authentication.getName())) {
//     return fail(HttpStatus.UNAUTHORIZED, "Please log in first.");
// }

// String email = authentication.getName();

//         String title = request.title() == null ? "" : request.title().trim();
//         if (title.isEmpty() || title.length() > 256) {
//             return fail(HttpStatus.BAD_REQUEST, "A title is required (maximum 256 characters).");
//         }
//         String body = request.body() == null ? "" : request.body();
//         if (body.length() > 20000) {
//             return fail(HttpStatus.BAD_REQUEST, "The description is too long (maximum 20,000 characters).");
//         }
//         List<String> labels = request.labels() == null ? List.of()
//                 : request.labels().stream()
//                         .filter(Objects::nonNull)
//                         .map(String::trim)
//                         .filter(s -> !s.isEmpty() && s.length() <= 50)
//                         .distinct()
//                         .limit(20)
//                         .toList();

//         // owner/repo come from the database, never from the request
//         Optional<ProjectGithubRepository> opt = linkService.findLink(projectId);
//         if (opt.isEmpty()) return fail(HttpStatus.NOT_FOUND, "No repository is linked to this project.");
//         ProjectGithubRepository link = opt.get();

//         String token = githubApiService.tokenFor(email);
//         if (token == null) return fail(HttpStatus.CONFLICT, "Connect your GitHub account first.");

//         Map<String, Object> result = githubApiService.createIssue(
//                 token, link.getRepoOwner(), link.getRepoName(), title, body, labels);

//         if (Boolean.TRUE.equals(result.get("created"))) {
//             log.info("Issue #{} created in {}/{} by {}", result.get("number"),
//                     link.getRepoOwner(), link.getRepoName(), email);
//             return ResponseEntity.status(HttpStatus.CREATED).body(result);
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

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

@RestController
@RequestMapping("/github/projects/{projectId}/issues")
public class GithubIssueController {

    private static final Logger log = LoggerFactory.getLogger(GithubIssueController.class);

    public record IssueRequest(String title, String body, List<String> labels) {}

    public record StateRequest(String state) {}

    private final GithubRepoLinkService linkService;
    private final GithubApiService githubApiService;

    public GithubIssueController(GithubRepoLinkService linkService, GithubApiService githubApiService) {
        this.linkService = linkService;
        this.githubApiService = githubApiService;
    }

    private ResponseEntity<Map<String, Object>> fail(HttpStatus status, String flag, String message) {
        return ResponseEntity.status(status).body(Map.of(flag, false, "message", message));
    }

    private String email() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    // Creates a real GitHub issue using the ACTING user's own token.
    @PostMapping
    public ResponseEntity<Map<String, Object>> create(@PathVariable Long projectId,
                                                      @RequestBody(required = false) IssueRequest request) {
        String email = email();

        if (request == null) return fail(HttpStatus.BAD_REQUEST, "created", "A request body is required.");

        String title = request.title() == null ? "" : request.title().trim();
        if (title.isEmpty() || title.length() > 256) {
            return fail(HttpStatus.BAD_REQUEST, "created", "A title is required (maximum 256 characters).");
        }
        String body = request.body() == null ? "" : request.body();
        if (body.length() > 20000) {
            return fail(HttpStatus.BAD_REQUEST, "created", "The description is too long (maximum 20,000 characters).");
        }
        List<String> labels = request.labels() == null ? List.of()
                : request.labels().stream()
                        .filter(Objects::nonNull)
                        .map(String::trim)
                        .filter(s -> !s.isEmpty() && s.length() <= 50)
                        .distinct()
                        .limit(20)
                        .toList();

        Optional<ProjectGithubRepository> opt = linkService.findLink(projectId);
        if (opt.isEmpty()) return fail(HttpStatus.NOT_FOUND, "created", "No repository is linked to this project.");
        ProjectGithubRepository link = opt.get();

        String token = githubApiService.tokenFor(email);
        if (token == null) return fail(HttpStatus.CONFLICT, "created", "Connect your GitHub account first.");

        Map<String, Object> result = githubApiService.createIssue(
                token, link.getRepoOwner(), link.getRepoName(), title, body, labels);

        if (Boolean.TRUE.equals(result.get("created"))) {
            log.info("Issue #{} created in {}/{} by {}", result.get("number"),
                    link.getRepoOwner(), link.getRepoName(), email);
            return ResponseEntity.status(HttpStatus.CREATED).body(result);
        }
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(result);
    }

    // Close or reopen an issue, using the ACTING user's own token.
    @PatchMapping("/{number:\\d{1,9}}/state")
    public ResponseEntity<Map<String, Object>> setState(@PathVariable Long projectId,
                                                        @PathVariable int number,
                                                        @RequestBody(required = false) StateRequest request) {
        String email = email();

        String state = (request == null || request.state() == null) ? "" : request.state().trim().toLowerCase();
        if (!state.equals("open") && !state.equals("closed")) {
            return fail(HttpStatus.BAD_REQUEST, "updated", "State must be \"open\" or \"closed\".");
        }

        Optional<ProjectGithubRepository> opt = linkService.findLink(projectId);
        if (opt.isEmpty()) return fail(HttpStatus.NOT_FOUND, "updated", "No repository is linked to this project.");
        ProjectGithubRepository link = opt.get();

        String token = githubApiService.tokenFor(email);
        if (token == null) return fail(HttpStatus.CONFLICT, "updated", "Connect your GitHub account first.");

        Map<String, Object> result = githubApiService.setIssueState(
                token, link.getRepoOwner(), link.getRepoName(), number, state);

        if (Boolean.TRUE.equals(result.get("updated"))) {
            log.info("Issue #{} set to {} in {}/{} by {}", number, state,
                    link.getRepoOwner(), link.getRepoName(), email);
            return ResponseEntity.ok(result);
        }
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(result);
    }
}