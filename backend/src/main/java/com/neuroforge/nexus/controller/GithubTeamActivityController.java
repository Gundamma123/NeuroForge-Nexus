// package com.neuroforge.nexus.controller;

// import com.neuroforge.nexus.entity.ProjectGithubRepository;
// import com.neuroforge.nexus.entity.User;
// import com.neuroforge.nexus.repository.UserRepository;
// import com.neuroforge.nexus.service.GithubApiService;
// import com.neuroforge.nexus.service.GithubRepoLinkService;
// import org.springframework.http.HttpStatus;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.*;

// import java.util.ArrayList;
// import java.util.LinkedHashMap;
// import java.util.List;
// import java.util.Map;
// import org.springframework.security.core.Authentication;

// @RestController
// @RequestMapping("/github/projects/{projectId}/team-activity")
// public class GithubTeamActivityController {

//     private final GithubRepoLinkService linkService;
//     private final GithubApiService githubApiService;
//     private final UserRepository userRepository;

//     public GithubTeamActivityController(GithubRepoLinkService linkService,
//                                          GithubApiService githubApiService,
//                                          UserRepository userRepository) {
//         this.linkService = linkService;
//         this.githubApiService = githubApiService;
//         this.userRepository = userRepository;
//     }

//     // For every NeuroForge user who has connected a GitHub account, returns
//     // their last commit date on this project's linked repository (null if
//     // they have never committed there, or have no GitHub account connected).
   
//     @GetMapping
//      public ResponseEntity<?> teamActivity(@PathVariable Long projectId) {
//      ProjectGithubRepository link = linkService.getLink(projectId);

//         if (link == null) {
//         return ResponseEntity.status(HttpStatus.NOT_FOUND)
//                 .body(Map.of("message",
//                         "No repository is linked to this project."));
//            }

//            if (link.getLinkedBy() == null) {
//             return ResponseEntity.status(HttpStatus.CONFLICT)
//                 .body(Map.of("message",
//                         "The repository has no linked user recorded. "
//                         + "Please unlink and relink the repository."));
//           }

//            String email = link.getLinkedBy().getEmail();
//            String token = githubApiService.tokenFor(email);
//             System.out.println("GitHub link token lookup for email: " + email);

//              if (token == null || token.isBlank()) {
//                return ResponseEntity.status(HttpStatus.CONFLICT)
//                 .body(Map.of("message",
//                         "The linking user's GitHub account is disconnected. "
//                         + "Reconnect GitHub and relink the repository."));
//     }

//     List<Map<String, Object>> rows = new ArrayList<>();

//     for (User user : userRepository.findAll()) {
//         if (user.getGithubUsername() == null
//                 || user.getGithubUsername().isBlank()) {
//             continue;
//         }

//         String lastCommit = githubApiService.lastCommitDate(
//                 token,
//                 link.getRepoOwner(),
//                 link.getRepoName(),
//                 user.getGithubUsername()
//         );

//         Map<String, Object> row = new LinkedHashMap<>();
//         row.put("name", user.getName());
//         row.put("githubUsername", user.getGithubUsername());
//         row.put("lastCommitAt", lastCommit);
//         rows.add(row);
//     }

//     return ResponseEntity.ok(rows);
//  }


// }
package com.neuroforge.nexus.controller;

import com.neuroforge.nexus.entity.ProjectGithubRepository;
import com.neuroforge.nexus.entity.User;
import com.neuroforge.nexus.repository.UserRepository;
import com.neuroforge.nexus.service.GithubApiService;
import com.neuroforge.nexus.service.GithubRepoLinkService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/github/projects/{projectId}/team-activity")
public class GithubTeamActivityController {

    private final GithubRepoLinkService linkService;
    private final GithubApiService githubApiService;
    private final UserRepository userRepository;

    public GithubTeamActivityController(GithubRepoLinkService linkService,
                                        GithubApiService githubApiService,
                                        UserRepository userRepository) {
        this.linkService = linkService;
        this.githubApiService = githubApiService;
        this.userRepository = userRepository;
    }

    // For every NeuroForge user who has connected a GitHub account, returns
    // their last commit date on this project's linked repository (null if
    // they have never committed there, or have no GitHub account connected).
    //
    // Token used to call GitHub:
    //   1. the token of the user who linked the repository, if available;
    //   2. otherwise the token of the currently logged-in user.
    @GetMapping
    public ResponseEntity<?> teamActivity(@PathVariable Long projectId,
                                          Authentication authentication) {

        ProjectGithubRepository link = linkService.getLink(projectId);

        if (link == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message",
                            "No repository is linked to this project."));
        }

        String token = null;

        // 1) Token of the user who linked the repository
        if (link.getLinkedBy() != null) {
            String linkedEmail = link.getLinkedBy().getEmail();
            System.out.println("Team activity: token lookup for linking user: " + linkedEmail);
            token = githubApiService.tokenFor(linkedEmail);
        } else {
            System.out.println("Team activity: repository has no linked user recorded.");
        }

        // 2) Fall back to the logged-in user's own GitHub connection
        if ((token == null || token.isBlank())
                && authentication != null
                && authentication.isAuthenticated()
                && authentication.getName() != null
                && !"anonymousUser".equals(authentication.getName())) {
            System.out.println("Team activity: falling back to logged-in user: "
                    + authentication.getName());
            token = githubApiService.tokenFor(authentication.getName());
        }

        if (token == null || token.isBlank()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message",
                            "No connected GitHub account is available. "
                            + "Connect GitHub, then try again."));
        }

        List<Map<String, Object>> rows = new ArrayList<>();

        for (User user : userRepository.findAll()) {
            if (user.getGithubUsername() == null
                    || user.getGithubUsername().isBlank()) {
                continue;
            }

            String lastCommit = githubApiService.lastCommitDate(
                    token,
                    link.getRepoOwner(),
                    link.getRepoName(),
                    user.getGithubUsername()
            );

            Map<String, Object> row = new LinkedHashMap<>();
            row.put("name", user.getName());
            row.put("githubUsername", user.getGithubUsername());
            row.put("lastCommitAt", lastCommit);
            rows.add(row);
        }

        return ResponseEntity.ok(rows);
    }
}