package com.neuroforge.nexus.service;

import com.neuroforge.nexus.dto.TeamRequest;
import com.neuroforge.nexus.entity.Member;
import com.neuroforge.nexus.entity.Project;
import com.neuroforge.nexus.entity.Team;
import com.neuroforge.nexus.exception.ResourceNotFoundException;
import com.neuroforge.nexus.repository.MemberRepository;
import com.neuroforge.nexus.repository.ProjectRepository;
import com.neuroforge.nexus.repository.TeamRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class TeamService {

    private final TeamRepository teamRepository;
    private final ProjectRepository projectRepository;
    private final MemberRepository memberRepository;

    public TeamService(TeamRepository teamRepository,
                        ProjectRepository projectRepository,
                        MemberRepository memberRepository) {
        this.teamRepository = teamRepository;
        this.projectRepository = projectRepository;
        this.memberRepository = memberRepository;
    }

    public List<Team> getAllTeams() {
        return teamRepository.findAll();
    }

    public List<Team> getTeamsByProject(Long projectId) {
        return teamRepository.findByProjectId(projectId);
    }

    public Team getTeamById(Long id) {
        return teamRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with id: " + id));
    }

    public List<Long> getAssignedMemberIds(Long excludeTeamId) {
        return teamRepository.findAssignedMemberIds(excludeTeamId);
    }

    public Team createTeam(TeamRequest request) {
        Team team = new Team();
        team.setName(request.getName());

        Project project = null;
        if (request.getProjectId() != null) {
            project = projectRepository.findById(request.getProjectId())
                    .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + request.getProjectId()));
            team.setProject(project);
        }

        List<Member> members = resolveMembers(request.getMemberIds());
        validateNoDuplicateAssignment(members, null);
        validateTeamSize(project, members.size());

        if (!members.isEmpty()) {
            team.setMembers(members);
            team.setMemberCount(members.size());
        } else {
            team.setMemberCount(request.getMemberCount() != null ? request.getMemberCount() : 0);
        }

        return teamRepository.save(team);
    }

    public Team updateTeam(Long id, TeamRequest request) {
        Team team = getTeamById(id);
        team.setName(request.getName());

        Project project = team.getProject();
        if (request.getProjectId() != null) {
            project = projectRepository.findById(request.getProjectId())
                    .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + request.getProjectId()));
            team.setProject(project);
        }

        List<Member> members = resolveMembers(request.getMemberIds());
        if (!members.isEmpty()) {
            validateNoDuplicateAssignment(members, id);
            validateTeamSize(project, members.size());
            team.setMembers(members);
            team.setMemberCount(members.size());
        } else if (request.getMemberCount() != null) {
            team.setMemberCount(request.getMemberCount());
        }

        return teamRepository.save(team);
    }

    public void deleteTeam(Long id) {
        teamRepository.delete(getTeamById(id));
    }

    private List<Member> resolveMembers(List<Long> memberIds) {
        if (memberIds == null || memberIds.isEmpty()) {
            return new ArrayList<>();
        }
        return memberRepository.findAllById(memberIds);
    }

    // Enforces: a member can belong to only one team at a time.
    // excludeTeamId lets an existing team keep its own current members
    // without falsely flagging them as duplicates of themselves.
    private void validateNoDuplicateAssignment(List<Member> members, Long excludeTeamId) {
        List<Long> alreadyAssigned = teamRepository.findAssignedMemberIds(excludeTeamId);
        for (Member m : members) {
            if (alreadyAssigned.contains(m.getId())) {
                throw new IllegalArgumentException(
                        "Member '" + m.getName() + "' is already assigned to another team.");
            }
        }
    }

    private void validateTeamSize(Project project, int selectedCount) {
        if (project == null || project.getTeamSize() == null || project.getTeamSize() <= 0) {
            return;
        }
        int required = project.getTeamSize();
        if (selectedCount != required) {
            throw new IllegalArgumentException(
                    "This project requires exactly " + required + " members. You selected " + selectedCount + ".");
        }
    }

    public Team removeMemberFromTeam(Long teamId, Long memberId) {
    Team team = getTeamById(teamId);
    team.getMembers().removeIf(m -> m.getId().equals(memberId));
    team.setMemberCount(team.getMembers().size());
    return teamRepository.save(team);
}
}