package com.neuroforge.nexus.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "teams")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Team {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name; // Backend | Frontend | QA | DevOps

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "project_id")
    private Project project;

    @Column(name = "member_count")
    private Integer memberCount = 0;

    // Actual assigned members, set via the Create Team -> Select Members flow.
    // memberCount is kept in sync with this list's size whenever members are assigned.
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "team_members",
            joinColumns = @JoinColumn(name = "team_id"),
            inverseJoinColumns = @JoinColumn(name = "member_id")
    )
    private List<Member> members = new ArrayList<>();
}