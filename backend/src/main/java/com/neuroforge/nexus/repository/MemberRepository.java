package com.neuroforge.nexus.repository;

import com.neuroforge.nexus.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MemberRepository extends JpaRepository<Member, Long> {
    List<Member> findByRole(String role);
}