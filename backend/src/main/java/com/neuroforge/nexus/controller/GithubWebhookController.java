package com.neuroforge.nexus.controller;

import com.neuroforge.nexus.service.GithubWebhookService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/webhooks/github")
public class GithubWebhookController {

    private final GithubWebhookService githubWebhookService;

    public GithubWebhookController(GithubWebhookService githubWebhookService) {
        this.githubWebhookService = githubWebhookService;
    }

    @PostMapping
    public ResponseEntity<String> receiveWebhook(
            @RequestHeader(value = "X-Hub-Signature-256", required = false) String signature,
            @RequestHeader(value = "X-GitHub-Event", required = false) String eventType,
            @RequestBody String payload,
            HttpServletRequest request) {

        boolean valid = githubWebhookService.verifySignature(payload, signature);
        if (!valid) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid signature");
        }

        githubWebhookService.processEvent(eventType, payload);
        return ResponseEntity.ok("Received");
    }
}