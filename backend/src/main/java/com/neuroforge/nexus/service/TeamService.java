package com.neuroforge.nexus.service;

import com.neuroforge.nexus.dto.TeamRequest;
import com.neuroforge.nexus.entity.Project;
import com.neuroforge.nexus.entity.Team;
import com.neuroforge.nexus.exception.ResourceNotFoundException;
import com.neuroforge.nexus.repository.ProjectRepository;
import com.neuroforge.nexus.repository.TeamRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TeamService {

    private final TeamRepository teamRepository;
    private final ProjectRepository projectRepository;

    public TeamService(TeamRepository teamRepository, ProjectRepository projectRepository) {
        this.teamRepository = teamRepository;
        this.projectRepository = projectRepository;
    }

    public List<Team> getAllTeams() {
        return teamRepository.findAll();
    }

    public Team getTeamById(Long id) {
        return teamRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with id: " + id));
    }

    public Team createTeam(TeamRequest request) {
        Team team = new Team();
        team.setName(request.getName());
        team.setMemberCount(request.getMemberCount() != null ? request.getMemberCount() : 0);

        if (request.getProjectId() != null) {
            Project project = projectRepository.findById(request.getProjectId())
                    .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + request.getProjectId()));
            team.setProject(project);
        }

        return teamRepository.save(team);
    }

    public Team updateTeam(Long id, TeamRequest request) {
        Team team = getTeamById(id);
        team.setName(request.getName());
        if (request.getMemberCount() != null) team.setMemberCount(request.getMemberCount());

        if (request.getProjectId() != null) {
            Project project = projectRepository.findById(request.getProjectId())
                    .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + request.getProjectId()));
            team.setProject(project);
        }

        return teamRepository.save(team);
    }

    public void deleteTeam(Long id) {
        teamRepository.delete(getTeamById(id));
    }
}