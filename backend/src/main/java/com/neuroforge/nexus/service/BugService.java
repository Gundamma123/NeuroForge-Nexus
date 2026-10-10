package com.neuroforge.nexus.service;

import com.neuroforge.nexus.dto.AssigneeOption;
import com.neuroforge.nexus.dto.BugRequest;
import com.neuroforge.nexus.dto.BugResponse;
import com.neuroforge.nexus.dto.BugStats;
import com.neuroforge.nexus.dto.BugUpdateRequest;
import com.neuroforge.nexus.entity.Bug;
import com.neuroforge.nexus.entity.Project;
import com.neuroforge.nexus.entity.User;
import com.neuroforge.nexus.exception.ResourceNotFoundException;
import com.neuroforge.nexus.repository.BugRepository;
import com.neuroforge.nexus.repository.ProjectRepository;
import com.neuroforge.nexus.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
public class BugService {

    private static final Logger log = LoggerFactory.getLogger(BugService.class);

    // Mapped to a 403 response by BugController.
    public static class ForbiddenException extends RuntimeException {
        public ForbiddenException(String message) {
            super(message);
        }
    }

    private final BugRepository bugRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public BugService(BugRepository bugRepository,
                      ProjectRepository projectRepository,
                      UserRepository userRepository) {
        this.bugRepository = bugRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }

    // ---------- helpers ----------

    private User currentUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));
    }

    // Reporter, Project Manager or Admin may delete.
    private boolean canDelete(Bug bug, User user) {
        String role = user.getRole() != null ? user.getRole().getName() : "";
        boolean privileged = "Admin".equals(role) || "Project Manager".equals(role);
        boolean reporter = bug.getReportedBy() != null && bug.getReportedBy().getId().equals(user.getId());
        return privileged || reporter;
    }

    private String blankToNull(String s) {
        return (s == null || s.isBlank()) ? null : s.trim();
    }

    private String pick(String value, List<String> allowed, String fallback, String label) {
        if (value == null || value.isBlank()) return fallback;
        String v = value.trim();
        if (!allowed.contains(v)) throw new IllegalArgumentException("Invalid " + label + ".");
        return v;
    }

    private Project requireProject(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found."));
    }

    private User requireAssignee(Long id) {
        User u = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assignee not found."));
        if (isInactive(u)) throw new IllegalArgumentException("That user can't be assigned bugs right now.");
        return u;
    }

    private boolean isInactive(User u) {
        return "Inactive".equals(u.getStatus()) || "Suspended".equals(u.getStatus());
    }

    private void moveStatus(Bug bug, String target) {
        if (!BugWorkflow.STATUSES.contains(target)) throw new IllegalArgumentException("Invalid status.");
        if (target.equals(bug.getStatus())) return;
        if (!BugWorkflow.canMove(bug.getStatus(), target)) {
            throw new IllegalArgumentException(
                    "A bug can't move from " + bug.getStatus() + " to " + target + ". Move it one step at a time.");
        }
        if ("Assigned".equals(target) && bug.getAssignedTo() == null) {
            throw new IllegalArgumentException("Assign the bug to someone before moving it to Assigned.");
        }
        bug.setStatus(target);
    }

    // ---------- queries ----------

    @Transactional(readOnly = true)
    public List<BugResponse> list(String status, String severity, Long projectId, String email) {
        User me = currentUser(email);
        String s = blankToNull(status);
        String sev = blankToNull(severity);
        if (s != null && !BugWorkflow.STATUSES.contains(s)) throw new IllegalArgumentException("Unknown status filter.");
        if (sev != null && !BugWorkflow.SEVERITIES.contains(sev)) throw new IllegalArgumentException("Unknown severity filter.");

        return bugRepository.search(s, sev, projectId).stream()
                .map(b -> BugResponse.from(b, canDelete(b, me)))
                .toList();
    }

    @Transactional(readOnly = true)
    public BugResponse get(Long id, String email) {
        User me = currentUser(email);
        Bug bug = bugRepository.findDetailedById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bug not found."));
        return BugResponse.from(bug, canDelete(bug, me));
    }

    @Transactional(readOnly = true)
    public BugStats stats() {
        return new BugStats(
                bugRepository.count(),                                          // all bugs
                bugRepository.countByStatusNot("Closed"),                       // open
                bugRepository.countBySeverityAndStatusNot("Critical", "Closed"),// critical and still open
                bugRepository.countByStatus("Closed"));                         // closed
    }

    @Transactional(readOnly = true)
    public List<AssigneeOption> assignees() {
        return userRepository.findAll().stream()
                .filter(u -> !isInactive(u))
                .map(u -> new AssigneeOption(u.getId(), u.getName(), u.getRole() != null ? u.getRole().getName() : ""))
                .sorted(Comparator.comparing(a -> a.name() == null ? "" : a.name().toLowerCase()))
                .toList();
    }

    // ---------- writes ----------

    @Transactional
    public BugResponse create(BugRequest r, String email) {
        User me = currentUser(email);

        Bug bug = new Bug();
        bug.setTitle(r.getTitle().trim());
        bug.setDescription(r.getDescription());
        bug.setProject(requireProject(r.getProjectId()));
        bug.setModuleFeature(blankToNull(r.getModuleFeature()));
        bug.setEnvironment(pick(r.getEnvironment(), BugWorkflow.ENVIRONMENTS, "Development", "environment"));
        bug.setSeverity(pick(r.getSeverity(), BugWorkflow.SEVERITIES, "Medium", "severity"));
        bug.setPriority(pick(r.getPriority(), BugWorkflow.PRIORITIES, "Medium", "priority"));
        bug.setAssignedTo(r.getAssignedToId() != null ? requireAssignee(r.getAssignedToId()) : null);
        bug.setReportedBy(me);
        bug.setStatus("New");

        Bug saved = bugRepository.save(bug);
        log.info("BUG-{} reported by {}", saved.getId(), email);
        return BugResponse.from(saved, canDelete(saved, me));
    }

    @Transactional
    public BugResponse update(Long id, BugUpdateRequest r, String email) {
        User me = currentUser(email);
        Bug bug = bugRepository.findDetailedById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bug not found."));

        if (r.getTitle() != null) {
            String t = r.getTitle().trim();
            if (t.isEmpty()) throw new IllegalArgumentException("Title cannot be empty.");
            bug.setTitle(t);
        }
        if (r.getDescription() != null) bug.setDescription(r.getDescription());
        if (r.getProjectId() != null) bug.setProject(requireProject(r.getProjectId()));
        if (r.getModuleFeature() != null) bug.setModuleFeature(blankToNull(r.getModuleFeature()));
        if (r.getEnvironment() != null) {
            bug.setEnvironment(pick(r.getEnvironment(), BugWorkflow.ENVIRONMENTS, bug.getEnvironment(), "environment"));
        }
        if (r.getSeverity() != null) {
            bug.setSeverity(pick(r.getSeverity(), BugWorkflow.SEVERITIES, bug.getSeverity(), "severity"));
        }
        if (r.getPriority() != null) {
            bug.setPriority(pick(r.getPriority(), BugWorkflow.PRIORITIES, bug.getPriority(), "priority"));
        }

        // Assignee first, so one request can both assign and move to "Assigned".
        if (r.getAssignedToId() != null) {
            bug.setAssignedTo(r.getAssignedToId().map(this::requireAssignee).orElse(null));
        }
        if (r.getStatus() != null) moveStatus(bug, r.getStatus().trim());

        Bug saved = bugRepository.save(bug);
        return BugResponse.from(saved, canDelete(saved, me));
    }

    @Transactional
    public void delete(Long id, String email) {
        User me = currentUser(email);
        Bug bug = bugRepository.findDetailedById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bug not found."));

        if (!canDelete(bug, me)) {
            throw new ForbiddenException("Only the reporter, a Project Manager or an Admin can delete this bug.");
        }
        bugRepository.delete(bug);
        log.info("BUG-{} deleted by {}", id, email);
    }
}