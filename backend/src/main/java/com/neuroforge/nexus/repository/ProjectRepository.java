package com.neuroforge.nexus.repository;

import com.neuroforge.nexus.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    long countByStatus(String status);
}