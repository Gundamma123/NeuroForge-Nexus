package com.neuroforge.nexus.service;

import com.neuroforge.nexus.dto.SprintRequest;
import com.neuroforge.nexus.entity.Project;
import com.neuroforge.nexus.entity.Sprint;
import com.neuroforge.nexus.exception.ResourceNotFoundException;
import com.neuroforge.nexus.repository.ProjectRepository;
import com.neuroforge.nexus.repository.SprintRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SprintService {

    private final SprintRepository sprintRepository;
    private final ProjectRepository projectRepository;

    public SprintService(SprintRepository sprintRepository, ProjectRepository projectRepository) {
        this.sprintRepository = sprintRepository;
        this.projectRepository = projectRepository;
    }

    public List<Sprint> getAllSprints() {
        return sprintRepository.findAll();
    }

    public Sprint getSprintById(Long id) {
        return sprintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sprint not found with id: " + id));
    }

    public Sprint createSprint(SprintRequest request) {
        Sprint sprint = new Sprint();
        sprint.setName(request.getName());
        sprint.setTaskCount(request.getTaskCount() != null ? request.getTaskCount() : 0);
        sprint.setPoints(request.getPoints() != null ? request.getPoints() : 0);
        sprint.setStartDate(request.getStartDate());
        sprint.setEndDate(request.getEndDate());
        sprint.setStatus(request.getStatus() != null ? request.getStatus() : "Active");

        if (request.getProjectId() != null) {
            Project project = projectRepository.findById(request.getProjectId())
                    .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + request.getProjectId()));
            sprint.setProject(project);
        }

        return sprintRepository.save(sprint);
    }

    public Sprint updateSprint(Long id, SprintRequest request) {
        Sprint sprint = getSprintById(id);
        sprint.setName(request.getName());
        if (request.getTaskCount() != null) sprint.setTaskCount(request.getTaskCount());
        if (request.getPoints() != null) sprint.setPoints(request.getPoints());
        sprint.setStartDate(request.getStartDate());
        sprint.setEndDate(request.getEndDate());
        if (request.getStatus() != null) sprint.setStatus(request.getStatus());
        return sprintRepository.save(sprint);
    }

    public void deleteSprint(Long id) {
        sprintRepository.delete(getSprintById(id));
    }
}