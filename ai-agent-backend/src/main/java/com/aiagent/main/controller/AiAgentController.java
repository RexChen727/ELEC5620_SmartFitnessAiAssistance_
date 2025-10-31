package com.aiagent.main.controller;

import com.aiagent.main.entity.ChatRequest;
import com.aiagent.main.entity.ChatResponse;
import com.aiagent.main.service.AiAgentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@Tag(name = "AI Agent Controller", description = "Endpoints for interacting with AI agents")
public class AiAgentController {

    private final AiAgentService aiAgentService;

    @PostMapping("/{agentType}")
    @Operation(summary = "Chat with AI agent", description = "Send a message to a specific AI agent type")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully processed chat request"),
        @ApiResponse(responseCode = "400", description = "Invalid request"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ChatResponse> chat(
            @Parameter(description = "Type of AI agent (general, coding, creative, analytical)")
            @PathVariable String agentType,
            @RequestBody ChatRequest request) {
        
        log.info("Received chat request for agent type: {}, message: {}", agentType, request.getMessage());
        
        try {
            ChatResponse response = aiAgentService.chat(agentType, request.getMessage(), request.getConversationId());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error processing chat request", e);
            return ResponseEntity.status(500).body(
                new ChatResponse("Sorry, I encountered an error. Please try again.", 
                               request.getConversationId(), agentType)
            );
        }
    }
}
