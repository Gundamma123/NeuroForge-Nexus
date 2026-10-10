package com.neuroforge.nexus.controller;

import com.neuroforge.nexus.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/github")
public class GithubStatusController {

    private final UserService userService;

    public GithubStatusController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getStatus() {
        String email = currentEmail();
        return ResponseEntity.ok(userService.getGithubStatus(email));
    }

    @DeleteMapping("/disconnect")
    public ResponseEntity<Void> disconnect() {
        String email = currentEmail();
        userService.disconnectGithub(email);
        return ResponseEntity.noContent().build();
    }

    private String currentEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth.getName();
    }
}