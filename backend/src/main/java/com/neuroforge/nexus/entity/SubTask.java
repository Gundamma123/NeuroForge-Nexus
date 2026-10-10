package com.neuroforge.nexus.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "sub_tasks")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    
    private Long id;

    // Add this field inside the SubTask class, alongside the existing fields:

// Database | Backend | Frontend | Cross-Functional
@Column(nullable = false)
private String tier = "Cross-Functional";

    @Column(nullable = false)
    private String title;

    @Column(length = 1000)
    private String description;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "task_id", nullable = false)
    private Task task;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "assignee_id")
    private Member assignee;

    // Pending | In Progress | Completed
    @Column(nullable = false)
    private String status = "Pending";

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
}