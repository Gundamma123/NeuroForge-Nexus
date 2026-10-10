package com.neuroforge.nexus.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "project_github_repositories")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProjectGithubRepository {


     @ManyToOne(fetch = FetchType.LAZY)
     @JoinColumn(name = "linked_by_user_id")
     @JsonIgnore
     private User linkedBy;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(name = "repo_owner", nullable = false)
    private String repoOwner;

    @Column(name = "repo_name", nullable = false)
    private String repoName;

    @Column(name = "installation_id")
    private Long installationId;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @Column(name = "webhook_secret")
    private String webhookSecret;

    @Column(name = "is_sync_active", nullable = false)
    private boolean syncActive = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public String getLinkedByEmail() {
        return linkedBy != null ? linkedBy.getEmail() : null;
     }
}