package com.neuroforge.nexus.controller;

import com.neuroforge.nexus.dto.SubTaskRequest;
import com.neuroforge.nexus.entity.SubTask;
import com.neuroforge.nexus.service.SubTaskService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/subtasks")
public class SubTaskController {

    private final SubTaskService subTaskService;

    public SubTaskController(SubTaskService subTaskService) {
        this.subTaskService = subTaskService;
    }

    @GetMapping("/task/{taskId}")
    public ResponseEntity<List<SubTask>> getSubTasksByTask(@PathVariable Long taskId) {
        return ResponseEntity.ok(subTaskService.getSubTasksByTask(taskId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SubTask> getSubTaskById(@PathVariable Long id) {
        return ResponseEntity.ok(subTaskService.getSubTaskById(id));
    }

    @PostMapping
    public ResponseEntity<SubTask> createSubTask(@Valid @RequestBody SubTaskRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(subTaskService.createSubTask(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SubTask> updateSubTask(@PathVariable Long id, @Valid @RequestBody SubTaskRequest request) {
        return ResponseEntity.ok(subTaskService.updateSubTask(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSubTask(@PathVariable Long id) {
        subTaskService.deleteSubTask(id);
        return ResponseEntity.noContent().build();
    }
}