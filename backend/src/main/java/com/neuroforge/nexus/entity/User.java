package com.neuroforge.nexus.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    // @Column(nullable = false)
    // private String password;
    @JsonIgnore
    @Column(nullable = false)
    private String password;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;

    @Column
    private String team;

    @Column(nullable = false)
    private String status = "Active";

    @Column(name = "joined_on")
    private LocalDate joinedOn = LocalDate.now();

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // Add inside the User class, alongside existing fields:

@Column(name = "github_access_token", length = 500)
private String githubAccessToken; // stored encrypted via EncryptionUtil

@Column(name = "github_username")
private String githubUsername;

@Column(name = "github_installation_id")
private Long githubInstallationId;

@Column(name = "last_login_at")
private java.time.Instant lastLoginAt;







}




