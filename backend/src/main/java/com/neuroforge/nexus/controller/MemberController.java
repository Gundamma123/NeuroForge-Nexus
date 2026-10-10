package com.neuroforge.nexus.controller;

import com.neuroforge.nexus.dto.MemberRequest;
import com.neuroforge.nexus.entity.Member;
import com.neuroforge.nexus.service.MemberService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/members")
public class MemberController {

    private final MemberService memberService;

    public MemberController(MemberService memberService) {
        this.memberService = memberService;
    }

    @GetMapping
    public ResponseEntity<List<Member>> getAllMembers() {
        return ResponseEntity.ok(memberService.getAllMembers());
    }

    // Frontend must URL-encode the role, e.g. "Frontend%20Developer"
    @GetMapping("/role/{role}")
    public ResponseEntity<List<Member>> getMembersByRole(@PathVariable String role) {
        return ResponseEntity.ok(memberService.getMembersByRole(role));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Member> getMemberById(@PathVariable Long id) {
        return ResponseEntity.ok(memberService.getMemberById(id));
    }

    // Backend-enforced RBAC: only users authenticated with the Admin role can add members.
    // A non-admin JWT hitting this endpoint gets a 403 handled by GlobalExceptionHandler.
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<Member> createMember(@Valid @RequestBody MemberRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(memberService.createMember(request));
    }
}