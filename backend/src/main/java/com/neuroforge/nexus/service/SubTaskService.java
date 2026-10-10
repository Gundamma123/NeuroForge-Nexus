package com.neuroforge.nexus.service;

import com.neuroforge.nexus.dto.SubTaskRequest;
import com.neuroforge.nexus.entity.Member;
import com.neuroforge.nexus.entity.SubTask;
import com.neuroforge.nexus.entity.Task;
import com.neuroforge.nexus.exception.ResourceNotFoundException;
import com.neuroforge.nexus.repository.MemberRepository;
import com.neuroforge.nexus.repository.SubTaskRepository;
import com.neuroforge.nexus.repository.TaskRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SubTaskService {

    private final SubTaskRepository subTaskRepository;
    private final TaskRepository taskRepository;
    private final MemberRepository memberRepository;

    public SubTaskService(SubTaskRepository subTaskRepository,
                           TaskRepository taskRepository,
                           MemberRepository memberRepository) {
        this.subTaskRepository = subTaskRepository;
        this.taskRepository = taskRepository;
        this.memberRepository = memberRepository;
    }

    public List<SubTask> getSubTasksByTask(Long taskId) {
        return subTaskRepository.findByTaskId(taskId);
    }

    public SubTask getSubTaskById(Long id) {
        return subTaskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sub-task not found with id: " + id));
    }

    public SubTask createSubTask(SubTaskRequest request) {
        if (request.getTaskId() == null) {
            throw new IllegalArgumentException("A sub-task must belong to a task.");
        }
        Task task = taskRepository.findById(request.getTaskId())
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + request.getTaskId()));

        SubTask subTask = new SubTask();
        subTask.setTask(task);
        applyRequest(subTask, request);
        return subTaskRepository.save(subTask);
    }

    public SubTask updateSubTask(Long id, SubTaskRequest request) {
        SubTask subTask = getSubTaskById(id);
        applyRequest(subTask, request);
        return subTaskRepository.save(subTask);
    }

    public void deleteSubTask(Long id) {
        subTaskRepository.delete(getSubTaskById(id));
    }

    private void applyRequest(SubTask subTask, SubTaskRequest request) {
        subTask.setTitle(request.getTitle());
        subTask.setDescription(request.getDescription());
        subTask.setStatus(request.getStatus() != null ? request.getStatus() : "Pending");

        subTask.setTier(request.getTier() != null ? request.getTier() : "Cross-Functional");
        subTask.setDueDate(request.getDueDate());

        if (request.getAssigneeId() != null) {
            Member assignee = memberRepository.findById(request.getAssigneeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Member not found with id: " + request.getAssigneeId()));
            subTask.setAssignee(assignee);
        } else {
            subTask.setAssignee(null);
        }
    }
}