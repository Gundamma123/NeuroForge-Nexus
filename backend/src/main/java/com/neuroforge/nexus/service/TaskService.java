package com.neuroforge.nexus.service;

import com.neuroforge.nexus.dto.TaskRequest;
import com.neuroforge.nexus.entity.Member;
import com.neuroforge.nexus.entity.Sprint;
import com.neuroforge.nexus.entity.Task;
import com.neuroforge.nexus.entity.Team;
import com.neuroforge.nexus.exception.ResourceNotFoundException;
import com.neuroforge.nexus.repository.MemberRepository;
import com.neuroforge.nexus.repository.SprintRepository;
import com.neuroforge.nexus.repository.TaskRepository;
import com.neuroforge.nexus.repository.TeamRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final SprintRepository sprintRepository;
    private final MemberRepository memberRepository;
    private final TeamRepository teamRepository;
    private final GithubSyncService githubSyncService;

    public TaskService(TaskRepository taskRepository,
                       SprintRepository sprintRepository,
                       MemberRepository memberRepository,
                       TeamRepository teamRepository,
                       GithubSyncService githubSyncService) {
        this.taskRepository = taskRepository;
        this.sprintRepository = sprintRepository;
        this.memberRepository = memberRepository;
        this.teamRepository = teamRepository;
        this.githubSyncService = githubSyncService;
    }

    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    public List<Task> getTasksBySprint(Long sprintId) {
        return taskRepository.findBySprintId(sprintId);
    }

    public Task getTaskById(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));
    }

    public Task createTask(TaskRequest request) {
        if (request.getSprintId() == null) {
            throw new IllegalArgumentException("A task must belong to a sprint.");
        }
        Sprint sprint = sprintRepository.findById(request.getSprintId())
                .orElseThrow(() -> new ResourceNotFoundException("Sprint not found with id: " + request.getSprintId()));

        Task task = new Task();
        task.setSprint(sprint);
        applyRequest(task, request, sprint);

        Task saved = taskRepository.save(task);
        githubSyncService.syncTaskToGithub(saved);
        return saved;
    }

    public Task updateTask(Long id, TaskRequest request) {
        Task task = getTaskById(id);
        applyRequest(task, request, task.getSprint());
        Task saved = taskRepository.save(task);
        githubSyncService.syncTaskToGithub(saved);
        return saved;
    }

    public void deleteTask(Long id) {
        taskRepository.delete(getTaskById(id));
    }

    private void applyRequest(Task task, TaskRequest request, Sprint sprint) {
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setPriority(request.getPriority() != null ? request.getPriority() : "Medium");
        task.setStatus(request.getStatus() != null ? request.getStatus() : "To Do");
        task.setStoryPoints(request.getStoryPoints() != null ? request.getStoryPoints() : 0);
        task.setStartDate(request.getStartDate());
        task.setDueDate(request.getDueDate());

        if (request.getAssigneeId() != null) {
            Member assignee = memberRepository.findById(request.getAssigneeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Member not found with id: " + request.getAssigneeId()));

            if (sprint != null && sprint.getProject() != null) {
                validateAssigneeBelongsToProject(assignee, sprint.getProject().getId());
            }

            task.setAssignee(assignee);
        } else {
            task.setAssignee(null);
        }
    }

    private void validateAssigneeBelongsToProject(Member assignee, Long projectId) {
        List<Team> projectTeams = teamRepository.findByProjectId(projectId);
        List<Long> validMemberIds = projectTeams.stream()
                .flatMap(t -> t.getMembers().stream())
                .map(Member::getId)
                .collect(Collectors.toList());

        if (!validMemberIds.contains(assignee.getId())) {
            throw new IllegalArgumentException(
                    "This member does not belong to the project's team and cannot be assigned this task.");
        }
    }
}