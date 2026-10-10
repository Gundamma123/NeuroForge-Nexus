// package com.neuroforge.nexus.controller;

// import com.neuroforge.nexus.dto.ChatRequest;
// import com.neuroforge.nexus.service.ChatService;
// import jakarta.validation.Valid;
// import org.springframework.http.HttpStatus;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.*;

// import java.util.Map;

// @RestController
// @RequestMapping("/chat")
// public class ChatController {

//     private final ChatService chatService;

//     public ChatController(ChatService chatService) {
//         this.chatService = chatService;
//     }

//     @PostMapping
//     public ResponseEntity<Map<String, String>> chat(@Valid @RequestBody ChatRequest request) {
//         try {
//             return ResponseEntity.ok(Map.of("reply", chatService.reply(request.getMessages())));
//         } catch (IllegalStateException e) {
//             return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
//                     .body(Map.of("message", e.getMessage()));
//         }
//     }
// }

package com.neuroforge.nexus.controller;

import com.neuroforge.nexus.dto.ChatRequest;
import com.neuroforge.nexus.repository.UserRepository;
import com.neuroforge.nexus.service.ChatService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/chat")
public class ChatController {

    private final ChatService chatService;
    private final UserRepository userRepository;

    public ChatController(ChatService chatService, UserRepository userRepository) {
        this.chatService = chatService;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<Map<String, String>> chat(@Valid @RequestBody ChatRequest request) {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            String role = userRepository.findByEmail(email)
                    .map(u -> u.getRole() != null ? u.getRole().getName() : "Developer")
                    .orElse("Developer");

            return ResponseEntity.ok(Map.of("reply", chatService.reply(request.getMessages(), role)));
        } catch (IllegalStateException | IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("message", e.getMessage()));
        }
    }
}