package com.neuroforge.nexus.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;

@Entity
@Table(name = "bugs", indexes = {
        @Index(name = "idx_bugs_status", columnList = "status"),
        @Index(name = "idx_bugs_severity", columnList = "severity"),
        @Index(name = "idx_bugs_project", columnList = "project_id")
})
@Getter
@Setter
@NoArgsConstructor
public class Bug {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // shown to users as "BUG-" + id

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(name = "module_feature", length = 100)
    private String moduleFeature;

    // columnDefinition makes Hibernate create real MySQL ENUM columns;
    // "not null" is appended by Hibernate because nullable = false.
    @Column(nullable = false, columnDefinition = "ENUM('Development','Staging','Production')")
    private String environment = "Development";

    @Column(nullable = false, columnDefinition = "ENUM('Low','Medium','High','Critical')")
    private String severity = "Medium";

    @Column(nullable = false, columnDefinition = "ENUM('Low','Medium','High')")
    private String priority = "Medium";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to")
    private User assignedTo; // null = Unassigned

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "reported_by", nullable = false)
    private User reportedBy;

    @Column(nullable = false,
            columnDefinition = "ENUM('New','Triaged','Assigned','In Progress','Fixed','Retest','Closed') DEFAULT 'New'")
    private String status = "New";

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}