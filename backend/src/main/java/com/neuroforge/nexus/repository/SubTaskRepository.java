package com.neuroforge.nexus.repository;

import com.neuroforge.nexus.entity.SubTask;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SubTaskRepository extends JpaRepository<SubTask, Long> {
    List<SubTask> findByTaskId(Long taskId);
}