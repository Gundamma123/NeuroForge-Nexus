package com.neuroforge.nexus.controller;

import com.neuroforge.nexus.dto.AssigneeOption;
import com.neuroforge.nexus.dto.BugRequest;
import com.neuroforge.nexus.dto.BugResponse;
import com.neuroforge.nexus.dto.BugStats;
import com.neuroforge.nexus.dto.BugUpdateRequest;
import com.neuroforge.nexus.service.BugService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/bugs")
public class BugController {

    private final BugService bugService;

    public BugController(BugService bugService) {
        this.bugService = bugService;
    }

    // Local handler, so the shared GlobalExceptionHandler's wording isn't used for 403s here.
    @ExceptionHandler(BugService.ForbiddenException.class)
    public ResponseEntity<Map<String, String>> onForbidden(BugService.ForbiddenException e) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", e.getMessage()));
    }

    private String email() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    // GET /api/bugs?status=&severity=&projectId=
    @GetMapping
    public ResponseEntity<List<BugResponse>> list(@RequestParam(required = false) String status,
                                                  @RequestParam(required = false) String severity,
                                                  @RequestParam(required = false) Long projectId) {
        return ResponseEntity.ok(bugService.list(status, severity, projectId, email()));
    }

    // GET /api/bugs/stats
    @GetMapping("/stats")
    public ResponseEntity<BugStats> stats() {
        return ResponseEntity.ok(bugService.stats());
    }

    // GET /api/bugs/assignees (id + name only, for the dropdown)
    @GetMapping("/assignees")
    public ResponseEntity<List<AssigneeOption>> assignees() {
        return ResponseEntity.ok(bugService.assignees());
    }

    @GetMapping("/{id:\\d{1,18}}")
    public ResponseEntity<BugResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(bugService.get(id, email()));
    }

    // POST /api/bugs
    @PostMapping
    public ResponseEntity<BugResponse> create(@Valid @RequestBody BugRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(bugService.create(request, email()));
    }

    // PUT /api/bugs/:id (partial update, including status transitions)
    @PutMapping("/{id:\\d{1,18}}")
    public ResponseEntity<BugResponse> update(@PathVariable Long id,
                                              @Valid @RequestBody BugUpdateRequest request) {
        return ResponseEntity.ok(bugService.update(id, request, email()));
    }

    // DELETE /api/bugs/:id
    @DeleteMapping("/{id:\\d{1,18}}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        bugService.delete(id, email());
        return ResponseEntity.noContent().build();
    }
}