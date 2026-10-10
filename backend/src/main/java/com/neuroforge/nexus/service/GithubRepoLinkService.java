package com.neuroforge.nexus.service;

import com.neuroforge.nexus.dto.GithubRepoLinkRequest;
import com.neuroforge.nexus.entity.Project;
import com.neuroforge.nexus.entity.ProjectGithubRepository;
import com.neuroforge.nexus.exception.ResourceNotFoundException;
import com.neuroforge.nexus.repository.ProjectGithubRepositoryRepository;
import com.neuroforge.nexus.repository.ProjectRepository;
import org.springframework.stereotype.Service;
import com.neuroforge.nexus.entity.User;
import com.neuroforge.nexus.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import java.util.Optional;

@Service
public class GithubRepoLinkService {

    private final ProjectGithubRepositoryRepository repoLinkRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public GithubRepoLinkService(
        ProjectGithubRepositoryRepository repoLinkRepository,
        ProjectRepository projectRepository,
        UserRepository userRepository) {

        this.repoLinkRepository = repoLinkRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
     }
        public Optional<ProjectGithubRepository> findLink(Long projectId) {
       return repoLinkRepository.findByProjectId(projectId);
     }
     

           public ProjectGithubRepository getLink(Long projectId) {
           return repoLinkRepository.findByProjectId(projectId).orElse(null);
          }

           public ProjectGithubRepository setSyncActive(Long projectId, boolean active) {
           ProjectGithubRepository link = repoLinkRepository.findByProjectId(projectId)
            .orElseThrow(() -> new ResourceNotFoundException("No repository is linked to this project."));
    link.setSyncActive(active);
    return repoLinkRepository.save(link);
    }

    public ProjectGithubRepository linkRepo(Long projectId, GithubRepoLinkRequest request) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        ProjectGithubRepository link = repoLinkRepository.findByProjectId(projectId)
                .orElse(new ProjectGithubRepository());

        link.setProject(project);
        link.setRepoOwner(request.getRepoOwner());
        
        link.setRepoName(request.getRepoName());
        link.setSyncActive(true);

       // Get the currently logged-in user
        Authentication authentication =
        SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null
        || !authentication.isAuthenticated()
        || authentication.getName() == null
        || authentication.getName().equals("anonymousUser")) {
         throw new org.springframework.security.access.AccessDeniedException(
            "Please log in before linking a repository.");
        }

                String email = authentication.getName();

                User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() ->
                new ResourceNotFoundException("Logged-in user not found"));

                link.setLinkedBy(currentUser);

                return repoLinkRepository.save(link);


        
               }

              public void unlinkRepo(Long projectId) {
              repoLinkRepository.findByProjectId(projectId).ifPresent(repoLinkRepository::delete);
               }
               public boolean canManage(
            ProjectGithubRepository repository,
            String email,
            boolean isAdmin) {

        if (repository == null || email == null || email.isBlank()) {
            return false;
        }

        if (isAdmin) {
            return true;
        }

        String linkedByEmail = repository.getLinkedByEmail();

        return linkedByEmail != null
                && linkedByEmail.equalsIgnoreCase(email);

            }



}