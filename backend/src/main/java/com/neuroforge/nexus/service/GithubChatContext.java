package com.neuroforge.nexus.service;

import com.neuroforge.nexus.entity.ProjectGithubRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;

@Component
public class GithubChatContext {

    private static final Logger log = LoggerFactory.getLogger(GithubChatContext.class);

    private final GithubApiService githubApiService;

    public GithubChatContext(GithubApiService githubApiService) {
        this.githubApiService = githubApiService;
    }

    public String describe(ProjectGithubRepository link) {
        String owner = link.getRepoOwner();
        String repo = link.getRepoName();
        StringBuilder sb = new StringBuilder("GitHub repository: ").append(owner).append("/").append(repo).append("\n");

        try {
            String token = githubApiService.tokenFor(link.getLinkedByEmail());
            if (token == null) {
                return sb.append("GitHub activity: unavailable (the linking GitHub account is disconnected).\n").toString();
            }

            List<Map<String, Object>> commits = githubApiService.getSection(token, owner, repo, "commits");
            if (commits == null) {
                return sb.append("GitHub activity: unavailable right now.\n").toString();
            }

            sb.append("Recent commits (newest first):\n");
            if (commits.isEmpty()) sb.append("  none\n");
            for (Map<String, Object> c : commits.stream().limit(5).toList()) {
                sb.append("  - ").append(clip(c.get("message"), 100))
                  .append(" | by ").append(c.get("author"))
                  .append(" | ").append(ago(c.get("date"))).append("\n");
            }

            List<Map<String, Object>> pulls = githubApiService.getSection(token, owner, repo, "pulls");
            sb.append("Open pull requests:\n");
            int openPrs = 0;
            if (pulls != null) {
                for (Map<String, Object> p : pulls) {
                    if (!"open".equals(p.get("state")) || openPrs >= 5) continue;
                    openPrs++;
                    sb.append("  - #").append(p.get("number")).append(" ").append(clip(p.get("title"), 100))
                      .append(" | by ").append(p.get("author"))
                      .append(" | updated ").append(ago(p.get("date"))).append("\n");
                }
            }
            if (openPrs == 0) sb.append("  none\n");

            List<Map<String, Object>> runs = githubApiService.getSection(token, owner, repo, "runs");
            sb.append("Recent pipeline runs (newest first):\n");
            if (runs == null || runs.isEmpty()) {
                sb.append("  none\n");
            } else {
                for (Map<String, Object> r : runs.stream().limit(3).toList()) {
                    String status = "completed".equals(r.get("status")) ? String.valueOf(r.get("conclusion")) : String.valueOf(r.get("status"));
                    sb.append("  - ").append(clip(r.get("name"), 60))
                      .append(" | ").append(status)
                      .append(" | branch ").append(r.get("branch"))
                      .append(" | by ").append(r.get("actor"))
                      .append(" | ").append(ago(r.get("createdAt"))).append("\n");
                }
            }
        } catch (RuntimeException e) {
            log.warn("GitHub context for {}/{} failed: {}", owner, repo, e.toString());
            sb.append("GitHub activity: unavailable right now.\n");
        }
        return sb.toString();
    }

    private String clip(Object value, int max) {
        if (value == null) return "n/a";
        String oneLine = String.valueOf(value).replaceAll("\\s+", " ").trim();
        return oneLine.length() > max ? oneLine.substring(0, max) + "..." : oneLine;
    }

    private String ago(Object iso) {
        if (iso == null) return "unknown time";
        try {
            long mins = Duration.between(Instant.parse(iso.toString()), Instant.now()).toMinutes();
            if (mins < 1) return "just now";
            if (mins < 60) return mins + " minutes ago";
            long hrs = mins / 60;
            if (hrs < 48) return hrs + " hours ago";
            return (hrs / 24) + " days ago";
        } catch (Exception e) {
            return "unknown time";
        }
    }
}