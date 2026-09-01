package com.neuroforge.nexus.service;

import com.neuroforge.nexus.dto.MilestoneRequest;
import com.neuroforge.nexus.entity.Milestone;
import com.neuroforge.nexus.entity.Project;
import com.neuroforge.nexus.exception.ResourceNotFoundException;
import com.neuroforge.nexus.repository.MilestoneRepository;
import com.neuroforge.nexus.repository.ProjectRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MilestoneService {

    private final MilestoneRepository milestoneRepository;
    private final ProjectRepository projectRepository;

    public MilestoneService(MilestoneRepository milestoneRepository, ProjectRepository projectRepository) {
        this.milestoneRepository = milestoneRepository;
        this.projectRepository = projectRepository;
    }

    public List<Milestone> getAllMilestones() {
        return milestoneRepository.findAll();
    }

    public Milestone getMilestoneById(Long id) {
        return milestoneRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Milestone not found with id: " + id));
    }

    public Milestone createMilestone(MilestoneRequest request) {
        Milestone milestone = new Milestone();
        milestone.setName(request.getName());
        milestone.setDueDate(request.getDueDate());
        milestone.setStatus(request.getStatus() != null ? request.getStatus() : "Pending");

        if (request.getProjectId() != null) {
            Project project = projectRepository.findById(request.getProjectId())
                    .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + request.getProjectId()));
            milestone.setProject(project);
        }

        return milestoneRepository.save(milestone);
    }

    public Milestone updateMilestone(Long id, MilestoneRequest request) {
        Milestone milestone = getMilestoneById(id);
        milestone.setName(request.getName());
        milestone.setDueDate(request.getDueDate());
        if (request.getStatus() != null) milestone.setStatus(request.getStatus());
        return milestoneRepository.save(milestone);
    }

    public void deleteMilestone(Long id) {
        milestoneRepository.delete(getMilestoneById(id));
    }
}