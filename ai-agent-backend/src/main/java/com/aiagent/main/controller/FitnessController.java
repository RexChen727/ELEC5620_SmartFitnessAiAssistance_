package com.aiagent.main.controller;

import com.aiagent.main.entity.ChatRequest;
import com.aiagent.main.entity.ChatResponse;
import com.aiagent.main.entity.GymEquipment;
import com.aiagent.main.service.AiAgentService;
import com.aiagent.main.service.GymEquipmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/fitness")
@RequiredArgsConstructor
@Tag(name = "Fitness Controller", description = "Endpoints for fitness equipment and AI fitness assistant")
public class FitnessController {

    private final AiAgentService aiAgentService;
    private final GymEquipmentService gymEquipmentService;

    @PostMapping("/chat")
    @Operation(summary = "Chat with fitness AI agent", description = "Get fitness equipment alternatives from AI agent")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully processed fitness chat request"),
            @ApiResponse(responseCode = "400", description = "Invalid request"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ChatResponse> chatWithFitnessAgent(@RequestBody ChatRequest request) {
        log.info("Received fitness chat request: {}", request.getMessage());

        try {
            ChatResponse response = aiAgentService.chat("fitness", request.getMessage(), request.getConversationId(),
                    request.getUserId());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error processing fitness chat request", e);
            return ResponseEntity.status(500).body(
                    new ChatResponse("抱歉，处理您的请求时出现了错误。请重试。",
                            request.getConversationId(), "fitness"));
        }
    }

    @GetMapping("/equipment")
    @Operation(summary = "Get all gym equipment", description = "Retrieve list of all gym equipment")
    public ResponseEntity<List<GymEquipment>> getAllEquipment() {
        return ResponseEntity.ok(gymEquipmentService.getAllEquipment());
    }

    @GetMapping("/equipment/{name}")
    @Operation(summary = "Get equipment by name", description = "Retrieve specific gym equipment by name")
    public ResponseEntity<GymEquipment> getEquipmentByName(
            @Parameter(description = "Equipment name") @PathVariable String name) {
        return gymEquipmentService.getEquipmentByName(name)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/equipment/search")
    @Operation(summary = "Search equipment", description = "Search gym equipment by keyword")
    public ResponseEntity<List<GymEquipment>> searchEquipment(
            @Parameter(description = "Search keyword") @RequestParam String keyword) {
        return ResponseEntity.ok(gymEquipmentService.searchEquipment(keyword));
    }

    @GetMapping("/equipment/muscle/{muscle}")
    @Operation(summary = "Get equipment by muscle group", description = "Retrieve equipment that targets specific muscle group")
    public ResponseEntity<List<GymEquipment>> getEquipmentByMuscleGroup(
            @Parameter(description = "Muscle group name") @PathVariable String muscle) {
        return ResponseEntity.ok(gymEquipmentService.getEquipmentByMuscleGroup(muscle));
    }
}
