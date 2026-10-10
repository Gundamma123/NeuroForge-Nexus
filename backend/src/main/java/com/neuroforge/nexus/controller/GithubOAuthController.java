package com.neuroforge.nexus.controller;

import com.neuroforge.nexus.oauth.GitHubOAuthService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/auth/github")
class GitHubOAuthController {

   private final GitHubOAuthService githubOAuthService;
    @Value("${github.app.client-id}")
    private String clientId;

    @Value("${github.app.redirect-uri}")
    private String redirectUri;

    public GitHubOAuthController(GitHubOAuthService githubOAuthService) {
        this.githubOAuthService = githubOAuthService;
    }

    // Step 1: the "Connect GitHub Account" button hits this endpoint.
    // It requires the caller's NeuroForge JWT so we know who to attach the
    // GitHub connection to once GitHub redirects back.
    @GetMapping
    public void startAuth(@RequestParam String token, HttpServletResponse response) throws IOException {
        String encodedRedirect = URLEncoder.encode(redirectUri, StandardCharsets.UTF_8);
        String githubAuthUrl = "https://github.com/login/oauth/authorize"
                + "?client_id=" + clientId
                + "&redirect_uri=" + encodedRedirect
                + "&state=" + token
                + "&scope=repo";

        response.sendRedirect(githubAuthUrl);
    }

    // Step 2: GitHub redirects here after the user approves the connection.
    @GetMapping("/callback")
    public void callback(@RequestParam String code,
                          @RequestParam String state,
                          @RequestParam(required = false) Long installation_id,
                          HttpServletResponse response) throws IOException {
        String frontendRedirect = githubOAuthService.handleCallback(code, state, installation_id);
        response.sendRedirect(frontendRedirect);
    }
}