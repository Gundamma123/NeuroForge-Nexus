package com.neuroforge.nexus.repository;

import com.neuroforge.nexus.entity.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TeamRepository extends JpaRepository<Team, Long> {
    List<Team> findByProjectId(Long projectId);

    // Returns member IDs currently assigned to ANY team, optionally excluding
    // one team (used when editing that team, so its own current members
    // aren't flagged as "already assigned to another team").
    @Query("SELECT m.id FROM Team t JOIN t.members m WHERE (:excludeTeamId IS NULL OR t.id <> :excludeTeamId)")
    List<Long> findAssignedMemberIds(@Param("excludeTeamId") Long excludeTeamId);
}