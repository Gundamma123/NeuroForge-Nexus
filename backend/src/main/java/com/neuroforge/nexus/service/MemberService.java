package com.neuroforge.nexus.service;

import com.neuroforge.nexus.dto.MemberRequest;
import com.neuroforge.nexus.entity.Member;
import com.neuroforge.nexus.exception.ResourceNotFoundException;
import com.neuroforge.nexus.repository.MemberRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MemberService {

    private final MemberRepository memberRepository;

    public MemberService(MemberRepository memberRepository) {
        this.memberRepository = memberRepository;
    }

    public List<Member> getAllMembers() {
        return memberRepository.findAll();
    }

    public List<Member> getMembersByRole(String role) {
        return memberRepository.findByRole(role);
    }

    public Member getMemberById(Long id) {
        return memberRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found with id: " + id));
    }

    // Only reachable by Admins — enforced at the controller layer via @PreAuthorize
    public Member createMember(MemberRequest request) {
        Member member = new Member();
        member.setName(request.getName());
        member.setEmail(request.getEmail());
        member.setRole(request.getRole());
        member.setExperienceYears(request.getExperienceYears());
        member.setSkills(request.getSkills());
        member.setAvailability(request.getAvailability() != null ? request.getAvailability() : "Available");
        return memberRepository.save(member);
    }
}