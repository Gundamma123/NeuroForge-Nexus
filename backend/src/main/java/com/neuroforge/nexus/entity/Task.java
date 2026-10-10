package com.neuroforge.nexus.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "tasks")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 1000)
    private String description;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "sprint_id", nullable = false)
    private Sprint sprint;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "assignee_id")
    private Member assignee;

    // Low | Medium | High | Critical
    @Column(nullable = false)
    private String priority = "Medium";

    // To Do | In Progress | In Review | Done
    @Column(nullable = false)
    private String status = "To Do";

    @Column(name = "story_points")
    private Integer storyPoints = 0;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
    // Add inside the Task class, alongside existing fields:

@Column(name = "github_issue_id")
private Long githubIssueId;

@Column(name = "github_issue_number")
private Integer githubIssueNumber;

@Column(name = "github_pr_url")
private String githubPrUrl;

@Column(name = "last_github_sync_timestamp")
private java.time.LocalDateTime lastGithubSyncTimestamp;


}

