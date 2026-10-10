package com.neuroforge.nexus.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "members")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    // One of: Frontend Developer | Backend Developer | Full Stack Developer | Product Manager | QA Tester
    @Column(nullable = false)
    private String role;

    @Column(name = "experience_years")
    private Integer experienceYears;

    @Column(length = 500)
    private String skills;

    @Column(nullable = false)
    private String availability = "Available"; // Available | Busy

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}