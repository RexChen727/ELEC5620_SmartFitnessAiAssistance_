package com.aiagent.main.controller;

import com.aiagent.main.entity.TrainingLog;
import com.aiagent.main.service.TrainingLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/training-log")
@Tag(name = "Training Log Controller", description = "Endpoints for managing training logs")
public class TrainingLogController {

    @Autowired
    private TrainingLogService trainingLogService;

    /**
     * Create or update a training log
     */
    @PostMapping
    @Operation(summary = "Create a new training log", description = "Save a new training log entry")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully created training log"),
            @ApiResponse(responseCode = "400", description = "Invalid request"),
            @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<?> createTrainingLog(@RequestBody TrainingLog trainingLog) {
        try {
            TrainingLog saved = trainingLogService.saveTrainingLog(trainingLog);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            log.error("Error creating training log", e);
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Get all training logs for a user
     */
    @GetMapping("/user/{userId}")
    @Operation(summary = "Get all training logs for a user", description = "Retrieve all training log entries for a specific user")
    public ResponseEntity<?> getAllTrainingLogs(
            @Parameter(description = "User ID") @PathVariable Long userId) {
        try {
            List<TrainingLog> logs = trainingLogService.getAllTrainingLogs(userId);
            return ResponseEntity.ok(logs);
        } catch (Exception e) {
            log.error("Error fetching training logs for user: {}", userId, e);
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Get training logs for a specific date
     */
    @GetMapping("/user/{userId}/date/{date}")
    @Operation(summary = "Get training logs for a specific date", description = "Retrieve training logs for a specific date")
    public ResponseEntity<?> getTrainingLogsByDate(
            @Parameter(description = "User ID") @PathVariable Long userId,
            @Parameter(description = "Date in format YYYY-MM-DD") 
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        try {
            List<TrainingLog> logs = trainingLogService.getTrainingLogsByDate(userId, date);
            return ResponseEntity.ok(logs);
        } catch (Exception e) {
            log.error("Error fetching training logs for user: {} on date: {}", userId, date, e);
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Get training logs within a date range
     */
    @GetMapping("/user/{userId}/range")
    @Operation(summary = "Get training logs in a date range", description = "Retrieve training logs between two dates")
    public ResponseEntity<?> getTrainingLogsByDateRange(
            @Parameter(description = "User ID") @PathVariable Long userId,
            @Parameter(description = "Start date in format YYYY-MM-DD")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "End date in format YYYY-MM-DD")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            List<TrainingLog> logs = trainingLogService.getTrainingLogsByDateRange(userId, startDate, endDate);
            return ResponseEntity.ok(logs);
        } catch (Exception e) {
            log.error("Error fetching training logs for user: {} between {} and {}", userId, startDate, endDate, e);
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Get training log by ID
     */
    @GetMapping("/{id}")
    @Operation(summary = "Get training log by ID", description = "Retrieve a specific training log by its ID")
    public ResponseEntity<?> getTrainingLogById(@PathVariable Long id) {
        try {
            return trainingLogService.getTrainingLogById(id)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Error fetching training log with id: {}", id, e);
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Update a training log
     */
    @PutMapping("/{id}")
    @Operation(summary = "Update a training log", description = "Update an existing training log")
    public ResponseEntity<?> updateTrainingLog(
            @PathVariable Long id,
            @RequestBody TrainingLog trainingLog) {
        try {
            return trainingLogService.getTrainingLogById(id)
                    .map(existingLog -> {
                        trainingLog.setId(existingLog.getId());
                        TrainingLog updated = trainingLogService.saveTrainingLog(trainingLog);
                        return ResponseEntity.ok(updated);
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Error updating training log with id: {}", id, e);
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Delete a training log
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a training log", description = "Delete a training log by its ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully deleted training log"),
            @ApiResponse(responseCode = "404", description = "Training log not found")
    })
    public ResponseEntity<?> deleteTrainingLog(@PathVariable Long id) {
        try {
            trainingLogService.deleteTrainingLog(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Training log deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error deleting training log with id: {}", id, e);
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Get training statistics for a user
     */
    @GetMapping("/user/{userId}/stats")
    @Operation(summary = "Get training statistics", description = "Get training statistics for a user")
    public ResponseEntity<?> getTrainingStats(@PathVariable Long userId) {
        try {
            long totalWorkouts = trainingLogService.getTotalWorkouts(userId);
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalWorkouts", totalWorkouts);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("Error fetching training stats for user: {}", userId, e);
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}

