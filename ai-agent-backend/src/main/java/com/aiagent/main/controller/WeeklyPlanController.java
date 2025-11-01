package com.aiagent.main.controller;

import com.aiagent.main.entity.WeeklyPlan;
import com.aiagent.main.entity.WeeklyPlanWorkout;
import com.aiagent.main.entity.GymEquipment;
import com.aiagent.main.service.WeeklyPlanService;
import com.aiagent.main.service.GymEquipmentService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/weekly-plan")
@Slf4j
public class WeeklyPlanController {

    @Autowired
    private WeeklyPlanService weeklyPlanService;

    @Autowired
    private GymEquipmentService gymEquipmentService;

    /**
     * Generate a new weekly plan using AI
     */
    @PostMapping("/generate")
    public ResponseEntity<?> generateWeeklyPlan(@RequestParam Long userId) {
        try {
            WeeklyPlan plan = weeklyPlanService.generateWeeklyPlan(userId);
            return ResponseEntity.ok(convertToDTO(plan));
        } catch (Exception e) {
            log.error("Error generating weekly plan", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get current week's plan
     */
    @GetMapping("/current")
    public ResponseEntity<?> getCurrentPlan(@RequestParam Long userId) {
        try {
            WeeklyPlan plan = weeklyPlanService.getCurrentPlan(userId);
            if (plan == null) {
                return ResponseEntity.ok(Map.of("plan", null));
            }
            return ResponseEntity.ok(convertToDTO(plan));
        } catch (Exception e) {
            log.error("Error getting current plan", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get all plans for user
     */
    @GetMapping("/all")
    public ResponseEntity<?> getAllPlans(@RequestParam Long userId) {
        try {
            List<WeeklyPlan> plans = weeklyPlanService.getAllPlans(userId);
            List<Map<String, Object>> planDTOs = plans.stream()
                    .map(this::convertToDTO)
                    .toList();
            return ResponseEntity.ok(planDTOs);
        } catch (Exception e) {
            log.error("Error getting all plans", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Toggle workout completion
     */
    @PutMapping("/workout/{workoutId}/toggle")
    public ResponseEntity<?> toggleWorkoutCompletion(@PathVariable Long workoutId, @RequestParam Long userId) {
        try {
            weeklyPlanService.toggleWorkoutCompletion(workoutId, userId);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            log.error("Error toggling workout completion", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Check if next week has a plan
     */
    @GetMapping("/next-week/check")
    public ResponseEntity<?> checkNextWeekPlan(@RequestParam Long userId, @RequestParam Long currentPlanId) {
        try {
            WeeklyPlan currentPlan = weeklyPlanService.getCurrentPlan(userId);
            if (currentPlan == null) {
                return ResponseEntity.ok(Map.of("hasPlan", false));
            }
            
            boolean hasPlan = weeklyPlanService.hasNextWeekPlan(userId, currentPlan.getEndDate());
            return ResponseEntity.ok(Map.of("hasPlan", hasPlan));
        } catch (Exception e) {
            log.error("Error checking next week plan", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Copy incomplete workouts to next week
     */
    @PostMapping("/copy-to-next-week")
    public ResponseEntity<?> copyToNextWeek(@RequestParam Long userId, 
                                           @RequestParam Long currentPlanId,
                                           @RequestParam String action) {
        try {
            WeeklyPlan nextPlan = weeklyPlanService.copyToNextWeek(userId, currentPlanId, action);
            return ResponseEntity.ok(convertToDTO(nextPlan));
        } catch (Exception e) {
            log.error("Error copying to next week", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get plan by ID
     */
    @GetMapping("/{planId}")
    public ResponseEntity<?> getPlanById(@PathVariable Long planId, @RequestParam Long userId) {
        try {
            Optional<WeeklyPlan> planOpt = weeklyPlanService.getPlanById(planId, userId);
            
            if (planOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            return ResponseEntity.ok(convertToDTO(planOpt.get()));
        } catch (Exception e) {
            log.error("Error getting plan by ID", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Delete a weekly plan
     */
    @DeleteMapping("/{planId}")
    public ResponseEntity<?> deleteWeeklyPlan(@PathVariable Long planId, @RequestParam Long userId) {
        try {
            weeklyPlanService.deleteWeeklyPlan(planId, userId);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            log.error("Error deleting weekly plan", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Check if there is a plan for the current week
     */
    @GetMapping("/check-current-week")
    public ResponseEntity<?> checkCurrentWeekPlan(@RequestParam Long userId) {
        try {
            boolean hasPlan = weeklyPlanService.hasPlanForCurrentWeek(userId);
            return ResponseEntity.ok(Map.of("hasPlan", hasPlan));
        } catch (Exception e) {
            log.error("Error checking current week plan", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Clear workouts for a specific day
     */
    @DeleteMapping("/clear-day")
    public ResponseEntity<?> clearDayWorkouts(@RequestParam Long planId, @RequestParam Integer dayIndex, @RequestParam Long userId) {
        try {
            weeklyPlanService.clearDayWorkouts(planId, dayIndex, userId);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            log.error("Error clearing day workouts", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Add a new workout to a plan
     */
    @PostMapping("/add-workout")
    public ResponseEntity<?> addWorkout(@RequestBody Map<String, Object> workoutData, @RequestParam Long userId) {
        try {
            WeeklyPlanWorkout workout = weeklyPlanService.addWorkout(workoutData, userId);
            return ResponseEntity.ok(Map.of("success", true, "workoutId", workout.getId()));
        } catch (Exception e) {
            log.error("Error adding workout", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Update an existing workout
     */
    @PutMapping("/workout/{workoutId}")
    public ResponseEntity<?> updateWorkout(@PathVariable Long workoutId, @RequestBody Map<String, Object> workoutData, @RequestParam Long userId) {
        try {
            WeeklyPlanWorkout workout = weeklyPlanService.updateWorkout(workoutId, workoutData, userId);
            return ResponseEntity.ok(Map.of("success", true, "workoutId", workout.getId()));
        } catch (Exception e) {
            log.error("Error updating workout", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Convert WeeklyPlan entity to DTO for API response
     */
    private Map<String, Object> convertToDTO(WeeklyPlan plan) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", plan.getId());
        dto.put("startDate", plan.getStartDate().toString());
        dto.put("endDate", plan.getEndDate().toString());
        dto.put("createdAt", plan.getCreatedAt().toString());

        // Group workouts by day
        Map<Integer, List<Map<String, Object>>> workoutsByDay = new HashMap<>();
        
        for (WeeklyPlanWorkout workout : plan.getWorkouts()) {
            Map<String, Object> workoutDTO = new HashMap<>();
            workoutDTO.put("id", workout.getId());
            workoutDTO.put("workoutName", workout.getWorkoutName());
            workoutDTO.put("sets", workout.getSets());
            workoutDTO.put("reps", workout.getReps());
            workoutDTO.put("weight", workout.getWeight());
            workoutDTO.put("duration", workout.getDuration());
            workoutDTO.put("completed", workout.getCompleted());
            workoutDTO.put("notes", workout.getNotes());

            workoutsByDay.computeIfAbsent(workout.getDayIndex(), k -> new java.util.ArrayList<>())
                    .add(workoutDTO);
        }

        dto.put("workoutsByDay", workoutsByDay);
        
        // Calculate workout count per day
        Map<Integer, Integer> countByDay = new HashMap<>();
        for (Integer dayIndex : workoutsByDay.keySet()) {
            countByDay.put(dayIndex, workoutsByDay.get(dayIndex).size());
        }
        dto.put("workoutCount", countByDay);

        // Calculate muscle groups per day
        Map<Integer, String> muscleGroupsByDay = calculateMuscleGroupsByDay(workoutsByDay);
        dto.put("muscleGroupsByDay", muscleGroupsByDay);

        return dto;
    }

    /**
     * Calculate the main muscle groups trained on each day
     */
    private Map<Integer, String> calculateMuscleGroupsByDay(Map<Integer, List<Map<String, Object>>> workoutsByDay) {
        Map<Integer, String> muscleGroupsByDay = new HashMap<>();
        
        for (Map.Entry<Integer, List<Map<String, Object>>> entry : workoutsByDay.entrySet()) {
            Integer dayIndex = entry.getKey();
            List<Map<String, Object>> workouts = entry.getValue();
            
            Set<String> allMuscles = new HashSet<>();
            
            for (Map<String, Object> workout : workouts) {
                String workoutName = (String) workout.get("workoutName");
                if (workoutName != null && !workoutName.isEmpty()) {
                    // Try to find matching equipment
                    Optional<GymEquipment> equipmentOpt = gymEquipmentService.getEquipmentByName(workoutName);
                    
                    if (equipmentOpt.isPresent()) {
                        String primaryMuscles = equipmentOpt.get().getPrimaryMuscles();
                        if (primaryMuscles != null && !primaryMuscles.isEmpty()) {
                            // Split by comma and add each muscle
                            String[] muscles = primaryMuscles.split(",");
                            for (String muscle : muscles) {
                                String trimmed = muscle.trim();
                                if (!trimmed.isEmpty()) {
                                    allMuscles.add(trimmed);
                                }
                            }
                        }
                    } else {
                        // Try to search by keyword in workout name (only take first match)
                        List<GymEquipment> searchResults = gymEquipmentService.searchEquipment(workoutName);
                        if (!searchResults.isEmpty()) {
                            GymEquipment equipment = searchResults.get(0);
                            String primaryMuscles = equipment.getPrimaryMuscles();
                            if (primaryMuscles != null && !primaryMuscles.isEmpty()) {
                                String[] muscles = primaryMuscles.split(",");
                                for (String muscle : muscles) {
                                    String trimmed = muscle.trim();
                                    if (!trimmed.isEmpty()) {
                                        allMuscles.add(trimmed);
                                    }
                                }
                            }
                        }
                    }
                }
            }
            
            // Format muscles for display
            if (!allMuscles.isEmpty()) {
                // Get unique muscles and format nicely
                List<String> sortedMuscles = new ArrayList<>(allMuscles);
                Collections.sort(sortedMuscles);
                
                // Take first 3 most common or all if less than 3
                String display = sortedMuscles.stream()
                        .limit(3)
                        .map(muscle -> {
                            // Simplify muscle names for display
                            if (muscle.contains("Chest")) return "Chest";
                            if (muscle.contains("Back")) return "Back";
                            if (muscle.contains("Leg")) return "Legs";
                            if (muscle.contains("Shoulder")) return "Shoulders";
                            if (muscle.contains("Arm") || muscle.contains("Bicep") || muscle.contains("Tricep")) return "Arms";
                            if (muscle.contains("Core") || muscle.contains("Abs")) return "Core";
                            if (muscle.contains("Cardiovascular")) return "Cardio";
                            return muscle;
                        })
                        .distinct()
                        .collect(Collectors.joining(", "));
                
                muscleGroupsByDay.put(dayIndex, display);
            } else {
                muscleGroupsByDay.put(dayIndex, "");
            }
        }
        
        return muscleGroupsByDay;
    }
}
