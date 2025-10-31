package com.aiagent.main.controller;

import com.aiagent.main.entity.Conversation;
import com.aiagent.main.service.ConversationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/conversations")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175"})
public class ConversationController {

    @Autowired
    private ConversationService conversationService;

    @PostMapping("/create/{userId}")
    public ResponseEntity<?> createConversation(@PathVariable Long userId, @RequestBody Conversation conversation) {
        try {
            Conversation newConversation = conversationService.createConversation(userId, conversation.getTitle());
            return ResponseEntity.ok(newConversation);
        } catch (Exception e) {
            return ResponseEntity.status(409).body(e.getMessage());
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Conversation>> getConversationsByUserId(@PathVariable Long userId) {
        List<Conversation> conversations = conversationService.getConversationsByUserId(userId);
        return ResponseEntity.ok(conversations);
    }

    @GetMapping("/{conversationId}")
    public ResponseEntity<?> getConversation(@PathVariable Long conversationId) {
        try {
            return conversationService.findById(conversationId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }
}
