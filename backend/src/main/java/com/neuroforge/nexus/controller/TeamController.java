package com.neuroforge.nexus.controller;

import com.neuroforge.nexus.dto.TeamRequest;
import com.neuroforge.nexus.entity.Team;
import com.neuroforge.nexus.service.TeamService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/teams")
public class TeamController {

    private final TeamService teamService;

    public TeamController(TeamService teamService) {
        this.teamService = teamService;
    }

    @GetMapping
    public ResponseEntity<List<Team>> getAllTeams() {
        return ResponseEntity.ok(teamService.getAllTeams());
    }

    // Powers the Project Details "Team" panel — teams belonging to one project
    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<Team>> getTeamsByProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(teamService.getTeamsByProject(projectId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Team> getTeamById(@PathVariable Long id) {
        return ResponseEntity.ok(teamService.getTeamById(id));
    }

    @PostMapping
    public ResponseEntity<Team> createTeam(@Valid @RequestBody TeamRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(teamService.createTeam(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Team> updateTeam(@PathVariable Long id, @Valid @RequestBody TeamRequest request) {
        return ResponseEntity.ok(teamService.updateTeam(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTeam(@PathVariable Long id) {
        teamService.deleteTeam(id);
        return ResponseEntity.noContent().build();
    }
    // Add this method to the existing TeamController class:

@GetMapping("/assigned-members")
public ResponseEntity<List<Long>> getAssignedMemberIds(
        @RequestParam(required = false) Long excludeTeamId) {
    return ResponseEntity.ok(teamService.getAssignedMemberIds(excludeTeamId));
}

@DeleteMapping("/{teamId}/members/{memberId}")
public ResponseEntity<Team> removeMember(@PathVariable Long teamId, @PathVariable Long memberId) {
    return ResponseEntity.ok(teamService.removeMemberFromTeam(teamId, memberId));
}


}