package com.aiagent.main.service;

import com.aiagent.main.entity.*;
import com.aiagent.main.repository.WeeklyPlanRepository;
import com.aiagent.main.repository.WeeklyPlanWorkoutRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@Slf4j
public class WeeklyPlanService {

    private final WeeklyPlanRepository weeklyPlanRepository;
    private final WeeklyPlanWorkoutRepository weeklyPlanWorkoutRepository;
    private final UserService userService;
    private final GymEquipmentService gymEquipmentService;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${ai.model.base-url}")
    private String aiModelBaseUrl;

    @Value("${ai.model.name}")
    private String aiModelName;

    @Value("${ai.model.api-key:}")
    private String aiModelApiKey;

    private static final String[] DAYS_OF_WEEK = {"Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"};

    public WeeklyPlanService(WeeklyPlanRepository weeklyPlanRepository,
                           WeeklyPlanWorkoutRepository weeklyPlanWorkoutRepository,
                           UserService userService,
                           GymEquipmentService gymEquipmentService,
                           RestTemplate restTemplate,
                           ObjectMapper objectMapper) {
        this.weeklyPlanRepository = weeklyPlanRepository;
        this.weeklyPlanWorkoutRepository = weeklyPlanWorkoutRepository;
        this.userService = userService;
        this.gymEquipmentService = gymEquipmentService;
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    /**
     * Generate a weekly plan using AI
     */
    public WeeklyPlan generateWeeklyPlan(Long userId) {
        try {
            // Get user
            User user = userService.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Calculate week dates (Monday to Sunday)
            LocalDate today = LocalDate.now();
            LocalDate monday = today.minusDays((today.getDayOfWeek().getValue() - 1) % 7);
            LocalDate sunday = monday.plusDays(6);

            // Check if plan already exists for this week and delete it to overwrite
            Optional<WeeklyPlan> existingPlan = weeklyPlanRepository.findCurrentPlan(userId, today);
            if (existingPlan.isPresent()) {
                // Delete existing plan and its workouts
                WeeklyPlan oldPlan = existingPlan.get();
                weeklyPlanWorkoutRepository.deleteByWeeklyPlanId(oldPlan.getId());
                weeklyPlanRepository.delete(oldPlan);
            }

            // Get equipment knowledge base
            String equipmentKnowledge = getEquipmentKnowledgeBase();

            // Generate weekly plan using AI
            String prompt = buildWeeklyPlanPrompt(equipmentKnowledge, monday, sunday);
            String aiResponse = callAiModel(prompt);

            // Parse AI response and create plan
            WeeklyPlan plan = parseAiResponseAndCreatePlan(user, monday, sunday, aiResponse);
            
            return weeklyPlanRepository.save(plan);

        } catch (Exception e) {
            log.error("Error generating weekly plan", e);
            throw new RuntimeException("Failed to generate weekly plan", e);
        }
    }

    /**
     * Build prompt for AI to generate weekly plan
     */
    private String buildWeeklyPlanPrompt(String equipmentKnowledge, LocalDate startDate, LocalDate endDate) {
        StringBuilder prompt = new StringBuilder();
        
        prompt.append("You are an expert fitness trainer and nutritionist. ").append(System.lineSeparator());
        prompt.append("Create a comprehensive weekly workout plan from ").append(startDate)
              .append(" to ").append(endDate).append(".").append(System.lineSeparator())
              .append(System.lineSeparator());
        
        prompt.append("Requirements:").append(System.lineSeparator());
        prompt.append("1. Target different muscle groups throughout the week").append(System.lineSeparator());
        prompt.append("2. Include 4-6 training days per week (allow for 1-2 rest days)").append(System.lineSeparator());
        prompt.append("3. Balance strength training and cardio").append(System.lineSeparator());
        prompt.append("4. Ensure proper muscle recovery time between similar muscle groups").append(System.lineSeparator());
        prompt.append("5. Start with appropriate difficulty levels").append(System.lineSeparator())
              .append(System.lineSeparator());
        
        prompt.append("Equipment Knowledge Base:").append(System.lineSeparator())
              .append(equipmentKnowledge).append(System.lineSeparator())
              .append(System.lineSeparator());
        
        prompt.append("Return ONLY a JSON array with this exact structure:").append(System.lineSeparator())
              .append("[").append(System.lineSeparator())
              .append("  {").append(System.lineSeparator())
              .append("    \"day\": \"Monday\",").append(System.lineSeparator())
              .append("    \"workouts\": [").append(System.lineSeparator())
              .append("      {").append(System.lineSeparator())
              .append("        \"name\": \"Bench Press\",").append(System.lineSeparator())
              .append("        \"sets\": 3,").append(System.lineSeparator())
              .append("        \"reps\": 8,").append(System.lineSeparator())
              .append("        \"weight\": \"135 lbs\",").append(System.lineSeparator())
              .append("        \"duration\": \"45 min\",").append(System.lineSeparator())
              .append("        \"notes\": \"Focus on form\"").append(System.lineSeparator())
              .append("      }").append(System.lineSeparator())
              .append("    ]").append(System.lineSeparator())
              .append("  },").append(System.lineSeparator())
              .append("  ...").append(System.lineSeparator())
              .append("]").append(System.lineSeparator())
              .append(System.lineSeparator());
        
        prompt.append("Important: Return ONLY valid JSON, no additional text.");
        
        return prompt.toString();
    }

    /**
     * Get equipment knowledge base from database
     */
    private String getEquipmentKnowledgeBase() {
        List<GymEquipment> equipmentList = gymEquipmentService.getAllEquipment();
        StringBuilder knowledge = new StringBuilder();

        for (GymEquipment equipment : equipmentList) {
            knowledge.append(equipment.getName()).append(": ").append(equipment.getDescription())
                    .append(". Main muscles: ").append(equipment.getPrimaryMuscles())
                    .append(". Difficulty: ").append(equipment.getDifficulty())
                    .append(System.lineSeparator());
        }

        return knowledge.toString();
    }

    /**
     * Call AI model to generate plan
     */
    private String callAiModel(String prompt) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        String url;
        Map<String, Object> requestBody = new HashMap<>();

        // 检测是否是 Gemini API
        if (aiModelBaseUrl.contains("generativelanguage.googleapis.com")) {
            // Gemini API 格式
            url = aiModelBaseUrl + "/" + aiModelName + ":generateContent";
            
            // Gemini 使用 X-goog-api-key header
            headers.set("X-goog-api-key", aiModelApiKey);
            
            Map<String, Object> content = new HashMap<>();
            content.put("parts", Collections.singletonList(Map.of("text", prompt)));
            
            requestBody.put("contents", Collections.singletonList(content));
        } else {
            // OpenAI/Ollama 格式
            requestBody.put("model", aiModelName);
            requestBody.put("messages", Collections.singletonList(Map.of("role", "user", "content", prompt)));
            
            if (aiModelApiKey != null && !aiModelApiKey.isEmpty()) {
                headers.set("Authorization", "Bearer " + aiModelApiKey);
            }
            
            url = aiModelBaseUrl + "/chat";
        }

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        String response = restTemplate.postForObject(url, entity, String.class);

        log.info("Raw AI model response: {}", response);

        if (response == null) {
            throw new RuntimeException("AI model returned null response");
        }

        // Parse response
        StringBuilder fullResponse = new StringBuilder();
        try {
            JsonNode jsonNode = objectMapper.readTree(response);
            
            // 检查是否是 Gemini 格式的响应
            if (jsonNode.has("candidates") && jsonNode.get("candidates").isArray()) {
                // Gemini API 格式
                JsonNode candidates = jsonNode.get("candidates");
                if (candidates.size() > 0) {
                    JsonNode firstCandidate = candidates.get(0);
                    if (firstCandidate.has("content") && firstCandidate.get("content").has("parts")) {
                        JsonNode parts = firstCandidate.get("content").get("parts");
                        if (parts.isArray() && parts.size() > 0) {
                            JsonNode firstPart = parts.get(0);
                            if (firstPart.has("text")) {
                                fullResponse.append(firstPart.get("text").asText());
                            }
                        }
                    }
                }
            } else if (jsonNode.has("choices") && jsonNode.get("choices").isArray()) {
                // OpenAI API 格式
                JsonNode choices = jsonNode.get("choices");
                if (choices.size() > 0) {
                    JsonNode firstChoice = choices.get(0);
                    if (firstChoice.has("message") && firstChoice.get("message").has("content")) {
                        fullResponse.append(firstChoice.get("message").get("content").asText());
                    }
                }
            } else {
                // Ollama 格式
                String[] lines = response.split("\n");
                for (String line : lines) {
                    if (!line.trim().isEmpty()) {
                        try {
                            JsonNode lineNode = objectMapper.readTree(line);
                            if (lineNode.has("message") && lineNode.get("message").has("content")) {
                                fullResponse.append(lineNode.get("message").get("content").asText());
                            }
                        } catch (Exception e) {
                            fullResponse.append(line);
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error parsing AI model response", e);
            fullResponse.append(response);
        }

        return fullResponse.toString();
    }

    /**
     * Parse AI response and create WeeklyPlan with workouts
     */
    private WeeklyPlan parseAiResponseAndCreatePlan(User user, LocalDate startDate, LocalDate endDate, String aiResponse) {
        WeeklyPlan plan = new WeeklyPlan();
        plan.setUser(user);
        plan.setStartDate(startDate);
        plan.setEndDate(endDate);

        try {
            // Extract JSON from AI response
            String json = extractJsonFromResponse(aiResponse);
            
            // Parse JSON response
            List<Map<String, Object>> days = objectMapper.readValue(json, List.class);
            
            int workoutId = 0;
            for (Map<String, Object> dayData : days) {
                String dayName = (String) dayData.get("day");
                int dayIndex = getDayIndex(dayName);
                
                List<Map<String, Object>> workouts = (List<Map<String, Object>>) dayData.get("workouts");
                
                for (Map<String, Object> workoutData : workouts) {
                    WeeklyPlanWorkout workout = new WeeklyPlanWorkout();
                    workout.setWeeklyPlan(plan);
                    workout.setDayIndex(dayIndex);
                    workout.setWorkoutName((String) workoutData.get("name"));
                    
                    if (workoutData.get("sets") instanceof Integer) {
                        workout.setSets((Integer) workoutData.get("sets"));
                    }
                    
                    if (workoutData.get("reps") instanceof Integer) {
                        workout.setReps((Integer) workoutData.get("reps"));
                    }
                    
                    workout.setWeight((String) workoutData.get("weight"));
                    workout.setDuration((String) workoutData.get("duration"));
                    workout.setNotes((String) workoutData.get("notes"));
                    workout.setCompleted(false);
                    
                    plan.getWorkouts().add(workout);
                }
            }
            
        } catch (Exception e) {
            log.error("Error parsing AI response, creating default plan", e);
            // Create a fallback plan with basic workouts
            plan = createFallbackPlan(user, startDate, endDate);
        }

        return plan;
    }

    /**
     * Create a fallback plan if AI fails
     */
    private WeeklyPlan createFallbackPlan(User user, LocalDate startDate, LocalDate endDate) {
        WeeklyPlan plan = new WeeklyPlan();
        plan.setUser(user);
        plan.setStartDate(startDate);
        plan.setEndDate(endDate);

        // Default weekly plan
        String[][] defaultWorkouts = {
            {"Chest & Triceps", "Bench Press, Tricep Dips"},
            {"Back & Biceps", "Pull-ups, Rows"},
            {"Cardio", "Running"},
            {"Legs", "Squats, Lunges"},
            {"Shoulders", "Shoulder Press"},
            {"Rest Day", ""},
            {"Full Body", "Circuit Training"}
        };

        for (int i = 0; i < DAYS_OF_WEEK.length; i++) {
            String[] workout = defaultWorkouts[i];
            if (!workout[1].isEmpty()) {
                WeeklyPlanWorkout wpWorkout = new WeeklyPlanWorkout();
                wpWorkout.setWeeklyPlan(plan);
                wpWorkout.setDayIndex(i);
                wpWorkout.setWorkoutName(workout[0]);
                wpWorkout.setSets(3);
                wpWorkout.setReps(10);
                wpWorkout.setWeight("Bodyweight/Machine");
                wpWorkout.setDuration("45 min");
                wpWorkout.setCompleted(false);
                plan.getWorkouts().add(wpWorkout);
            }
        }

        return plan;
    }

    /**
     * Extract JSON from AI response
     */
    private String extractJsonFromResponse(String response) {
        // Try to find JSON array in response
        int startIdx = response.indexOf('[');
        int endIdx = response.lastIndexOf(']');
        
        if (startIdx != -1 && endIdx != -1) {
            return response.substring(startIdx, endIdx + 1);
        }
        
        return response;
    }

    /**
     * Get day index from day name
     */
    private int getDayIndex(String dayName) {
        for (int i = 0; i < DAYS_OF_WEEK.length; i++) {
            if (DAYS_OF_WEEK[i].equalsIgnoreCase(dayName)) {
                return i;
            }
        }
        return 0;
    }

    /**
     * Get weekly plan for user
     */
    public WeeklyPlan getCurrentPlan(Long userId) {
        Optional<WeeklyPlan> plan = weeklyPlanRepository.findCurrentPlan(userId, LocalDate.now());
        return plan.orElse(null);
    }

    /**
     * Get all plans for user
     */
    public List<WeeklyPlan> getAllPlans(Long userId) {
        return weeklyPlanRepository.findByUserIdOrderByStartDateDesc(userId);
    }

    /**
     * Get plan by ID
     */
    public Optional<WeeklyPlan> getPlanById(Long planId) {
        return weeklyPlanRepository.findById(planId);
    }

    /**
     * Get plan by ID with user verification
     */
    public Optional<WeeklyPlan> getPlanById(Long planId, Long userId) {
        Optional<WeeklyPlan> planOpt = weeklyPlanRepository.findById(planId);
        if (planOpt.isPresent()) {
            WeeklyPlan plan = planOpt.get();
            if (!plan.getUser().getId().equals(userId)) {
                throw new RuntimeException("Plan does not belong to this user");
            }
        }
        return planOpt;
    }

    /**
     * Toggle workout completion
     */
    public void toggleWorkoutCompletion(Long workoutId) {
        WeeklyPlanWorkout workout = weeklyPlanWorkoutRepository.findById(workoutId)
                .orElseThrow(() -> new RuntimeException("Workout not found"));
        workout.setCompleted(!workout.getCompleted());
        weeklyPlanWorkoutRepository.save(workout);
    }

    /**
     * Toggle workout completion with user verification
     */
    public void toggleWorkoutCompletion(Long workoutId, Long userId) {
        WeeklyPlanWorkout workout = weeklyPlanWorkoutRepository.findById(workoutId)
                .orElseThrow(() -> new RuntimeException("Workout not found"));
        
        // Verify the workout belongs to the user's plan
        if (!workout.getWeeklyPlan().getUser().getId().equals(userId)) {
            throw new RuntimeException("Workout does not belong to this user");
        }
        
        workout.setCompleted(!workout.getCompleted());
        weeklyPlanWorkoutRepository.save(workout);
    }

    /**
     * Check if next week already has a plan
     */
    public boolean hasNextWeekPlan(Long userId, LocalDate currentEndDate) {
        LocalDate nextWeekStart = currentEndDate.plusDays(1);
        LocalDate nextWeekEnd = nextWeekStart.plusDays(6);
        return weeklyPlanRepository.findCurrentPlan(userId, nextWeekStart).isPresent();
    }

    /**
     * Copy incomplete workouts to next week
     * action: "merge", "cancel", "overwrite"
     */
    public WeeklyPlan copyToNextWeek(Long userId, Long currentPlanId, String action) {
        WeeklyPlan currentPlan = weeklyPlanRepository.findById(currentPlanId)
                .orElseThrow(() -> new RuntimeException("Current plan not found"));
        
        // Verify the plan belongs to the user
        if (!currentPlan.getUser().getId().equals(userId)) {
            throw new RuntimeException("Plan does not belong to this user");
        }
        
        LocalDate nextWeekStart = currentPlan.getEndDate().plusDays(1);
        LocalDate nextWeekEnd = nextWeekStart.plusDays(6);
        
        // Get incomplete workouts
        List<WeeklyPlanWorkout> incompleteWorkouts = currentPlan.getWorkouts().stream()
                .filter(w -> !w.getCompleted())
                .toList();
        
        if (incompleteWorkouts.isEmpty()) {
            throw new RuntimeException("No incomplete workouts to copy");
        }
        
        // Check if next week already has a plan
        Optional<WeeklyPlan> nextWeekPlanOpt = weeklyPlanRepository.findCurrentPlan(userId, nextWeekStart);
        
        WeeklyPlan nextWeekPlan;
        
        if ("cancel".equals(action)) {
            return currentPlan; // Return current plan unchanged
        } else if ("overwrite".equals(action)) {
            if (nextWeekPlanOpt.isPresent()) {
                // Delete existing next week plan completely
                WeeklyPlan existingPlan = nextWeekPlanOpt.get();
                weeklyPlanRepository.deleteById(existingPlan.getId());
            }
            
            // Create new plan for next week
            nextWeekPlan = new WeeklyPlan();
            nextWeekPlan.setUser(currentPlan.getUser());
            nextWeekPlan.setStartDate(nextWeekStart);
            nextWeekPlan.setEndDate(nextWeekEnd);
            
            for (WeeklyPlanWorkout workout : incompleteWorkouts) {
                WeeklyPlanWorkout newWorkout = new WeeklyPlanWorkout();
                newWorkout.setWeeklyPlan(nextWeekPlan);
                newWorkout.setDayIndex(workout.getDayIndex());
                newWorkout.setWorkoutName(workout.getWorkoutName());
                newWorkout.setSets(workout.getSets());
                newWorkout.setReps(workout.getReps());
                newWorkout.setWeight(workout.getWeight());
                newWorkout.setDuration(workout.getDuration());
                newWorkout.setNotes(workout.getNotes());
                newWorkout.setCompleted(false);
                nextWeekPlan.getWorkouts().add(newWorkout);
            }
            
            
        } else if ("merge".equals(action) && nextWeekPlanOpt.isPresent()) {
            // Add incomplete workouts to existing next week plan
            nextWeekPlan = nextWeekPlanOpt.get();
            
            // Verify the next week plan belongs to the user
            if (!nextWeekPlan.getUser().getId().equals(userId)) {
                throw new RuntimeException("Next week plan does not belong to this user");
            }
            
            for (WeeklyPlanWorkout workout : incompleteWorkouts) {
                WeeklyPlanWorkout newWorkout = new WeeklyPlanWorkout();
                newWorkout.setWeeklyPlan(nextWeekPlan);
                newWorkout.setDayIndex(workout.getDayIndex());
                newWorkout.setWorkoutName(workout.getWorkoutName());
                newWorkout.setSets(workout.getSets());
                newWorkout.setReps(workout.getReps());
                newWorkout.setWeight(workout.getWeight());
                newWorkout.setDuration(workout.getDuration());
                newWorkout.setNotes(workout.getNotes());
                newWorkout.setCompleted(false);
                nextWeekPlan.getWorkouts().add(newWorkout);
            }
            
        } else {
            // Create new plan for next week (no existing plan)
            nextWeekPlan = new WeeklyPlan();
            nextWeekPlan.setUser(currentPlan.getUser());
            nextWeekPlan.setStartDate(nextWeekStart);
            nextWeekPlan.setEndDate(nextWeekEnd);
            
            for (WeeklyPlanWorkout workout : incompleteWorkouts) {
                WeeklyPlanWorkout newWorkout = new WeeklyPlanWorkout();
                newWorkout.setWeeklyPlan(nextWeekPlan);
                newWorkout.setDayIndex(workout.getDayIndex());
                newWorkout.setWorkoutName(workout.getWorkoutName());
                newWorkout.setSets(workout.getSets());
                newWorkout.setReps(workout.getReps());
                newWorkout.setWeight(workout.getWeight());
                newWorkout.setDuration(workout.getDuration());
                newWorkout.setNotes(workout.getNotes());
                newWorkout.setCompleted(false);
                nextWeekPlan.getWorkouts().add(newWorkout);
            }
        }
        
        weeklyPlanRepository.save(nextWeekPlan);
        return nextWeekPlan;
    }
    
    /**
     * Delete a weekly plan
     */
    public void deleteWeeklyPlan(Long planId) {
        weeklyPlanRepository.deleteById(planId);
    }

    /**
     * Delete a weekly plan with user verification
     */
    public void deleteWeeklyPlan(Long planId, Long userId) {
        WeeklyPlan plan = weeklyPlanRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Plan not found"));
        
        // Verify the plan belongs to the user
        if (!plan.getUser().getId().equals(userId)) {
            throw new RuntimeException("Plan does not belong to this user");
        }
        
        weeklyPlanRepository.deleteById(planId);
    }
    
    /**
     * Check if there is a plan for the current week (today + 7 days)
     */
    public boolean hasPlanForCurrentWeek(Long userId) {
        LocalDate today = LocalDate.now();
        LocalDate currentWeekEnd = today.plusDays(6);
        
        // Check if there's any plan that overlaps with current week (today to today+6)
        List<WeeklyPlan> allPlans = weeklyPlanRepository.findByUserIdOrderByStartDateDesc(userId);
        
        return allPlans.stream().anyMatch(plan -> {
            // Check if plan overlaps with current week [today, currentWeekEnd]
            // Overlap means there's at least one day that's in both ranges
            LocalDate planStart = plan.getStartDate();
            LocalDate planEnd = plan.getEndDate();
            
            // Two ranges overlap if and only if:
            // maxStart < minEnd (using < instead of <= to exclude boundary touches)
            LocalDate maxStart = today.isAfter(planStart) ? today : planStart;
            LocalDate minEnd = currentWeekEnd.isBefore(planEnd) ? currentWeekEnd : planEnd;
            
            // If maxStart < minEnd, they overlap
            // If maxStart == minEnd or maxStart > minEnd, they don't overlap
            return maxStart.isBefore(minEnd);
        });
    }
    
    /**
     * Clear workouts for a specific day in a plan
     */
    public void clearDayWorkouts(Long planId, Integer dayIndex) {
        log.info("Clearing workouts for planId={}, dayIndex={}", planId, dayIndex);
        
        // First, load the plan with workouts
        WeeklyPlan plan = weeklyPlanRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Plan not found"));
        
        // Get workouts for the specific day
        List<WeeklyPlanWorkout> allWorkouts = weeklyPlanWorkoutRepository.findByWeeklyPlanId(planId);
        log.info("Total workouts for planId={}: {}", planId, allWorkouts.size());
        
        List<WeeklyPlanWorkout> workoutsToDelete = allWorkouts
                .stream()
                .filter(w -> w.getDayIndex().equals(dayIndex))
                .collect(java.util.stream.Collectors.toList());
        
        log.info("Workouts to delete for dayIndex={}: {}", dayIndex, workoutsToDelete.size());
        
        // Delete the workouts
        if (!workoutsToDelete.isEmpty()) {
            weeklyPlanWorkoutRepository.deleteAll(workoutsToDelete);
            log.info("Successfully deleted {} workouts", workoutsToDelete.size());
        } else {
            log.warn("No workouts found for dayIndex={}", dayIndex);
        }
    }

    /**
     * Clear workouts for a specific day in a plan with user verification
     */
    public void clearDayWorkouts(Long planId, Integer dayIndex, Long userId) {
        log.info("Clearing workouts for planId={}, dayIndex={}, userId={}", planId, dayIndex, userId);
        
        // First, load the plan with workouts
        WeeklyPlan plan = weeklyPlanRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Plan not found"));
        
        // Verify the plan belongs to the user
        if (!plan.getUser().getId().equals(userId)) {
            throw new RuntimeException("Plan does not belong to this user");
        }
        
        // Get workouts for the specific day
        List<WeeklyPlanWorkout> allWorkouts = weeklyPlanWorkoutRepository.findByWeeklyPlanId(planId);
        log.info("Total workouts for planId={}: {}", planId, allWorkouts.size());
        
        List<WeeklyPlanWorkout> workoutsToDelete = allWorkouts
                .stream()
                .filter(w -> w.getDayIndex().equals(dayIndex))
                .collect(java.util.stream.Collectors.toList());
        
        log.info("Workouts to delete for dayIndex={}: {}", dayIndex, workoutsToDelete.size());
        
        // Delete the workouts
        if (!workoutsToDelete.isEmpty()) {
            weeklyPlanWorkoutRepository.deleteAll(workoutsToDelete);
            log.info("Successfully deleted {} workouts", workoutsToDelete.size());
        } else {
            log.warn("No workouts found for dayIndex={}", dayIndex);
        }
    }

    /**
     * Add a new workout to a plan
     */
    public WeeklyPlanWorkout addWorkout(Map<String, Object> workoutData) {
        try {
            // Get plan ID and validate
            Long planId = Long.parseLong(workoutData.get("planId").toString());
            WeeklyPlan plan = weeklyPlanRepository.findById(planId)
                    .orElseThrow(() -> new RuntimeException("Plan not found"));

            // Create new workout
            WeeklyPlanWorkout workout = new WeeklyPlanWorkout();
            workout.setWeeklyPlan(plan);
            workout.setDayIndex(Integer.parseInt(workoutData.get("dayIndex").toString()));
            workout.setWorkoutName(workoutData.get("workoutName").toString());
            workout.setCompleted(false);

            // Set optional fields
            if (workoutData.get("sets") != null) {
                workout.setSets(Integer.parseInt(workoutData.get("sets").toString()));
            }
            if (workoutData.get("reps") != null) {
                workout.setReps(Integer.parseInt(workoutData.get("reps").toString()));
            }
            if (workoutData.get("weight") != null && !workoutData.get("weight").toString().isEmpty()) {
                workout.setWeight(workoutData.get("weight").toString());
            }
            if (workoutData.get("duration") != null && !workoutData.get("duration").toString().isEmpty()) {
                workout.setDuration(workoutData.get("duration").toString());
            }
            if (workoutData.get("notes") != null && !workoutData.get("notes").toString().isEmpty()) {
                workout.setNotes(workoutData.get("notes").toString());
            }

            // Save workout
            WeeklyPlanWorkout savedWorkout = weeklyPlanWorkoutRepository.save(workout);
            log.info("Added workout {} to plan {}", savedWorkout.getId(), planId);

            return savedWorkout;
        } catch (Exception e) {
            log.error("Error adding workout", e);
            throw new RuntimeException("Failed to add workout: " + e.getMessage());
        }
    }

    /**
     * Add a new workout to a plan with user verification
     * If planId is not provided or null, automatically get or create current week's plan
     */
    public WeeklyPlanWorkout addWorkout(Map<String, Object> workoutData, Long userId) {
        try {
            WeeklyPlan plan;
            
            // Check if planId is provided
            if (workoutData.get("planId") != null && !workoutData.get("planId").toString().isEmpty()) {
                // Use provided planId
                Long planId = Long.parseLong(workoutData.get("planId").toString());
                plan = weeklyPlanRepository.findById(planId)
                        .orElseThrow(() -> new RuntimeException("Plan not found"));

                // Verify the plan belongs to the user
                if (!plan.getUser().getId().equals(userId)) {
                    throw new RuntimeException("Plan does not belong to this user");
                }
            } else {
                // No planId provided, get or create current week's plan
                User user = userService.findById(userId)
                        .orElseThrow(() -> new RuntimeException("User not found"));
                
                LocalDate today = LocalDate.now();
                Optional<WeeklyPlan> existingPlan = weeklyPlanRepository.findCurrentPlan(userId, today);
                
                if (existingPlan.isPresent()) {
                    plan = existingPlan.get();
                } else {
                    // Create a new empty plan for current week
                    LocalDate monday = today.minusDays((today.getDayOfWeek().getValue() - 1) % 7);
                    LocalDate sunday = monday.plusDays(6);
                    
                    plan = new WeeklyPlan();
                    plan.setUser(user);
                    plan.setStartDate(monday);
                    plan.setEndDate(sunday);
                    plan = weeklyPlanRepository.save(plan);
                    log.info("Created new weekly plan {} for user {} to add workout", plan.getId(), userId);
                }
            }

            // Create new workout
            WeeklyPlanWorkout workout = new WeeklyPlanWorkout();
            workout.setWeeklyPlan(plan);
            workout.setDayIndex(Integer.parseInt(workoutData.get("dayIndex").toString()));
            workout.setWorkoutName(workoutData.get("workoutName").toString());
            workout.setCompleted(false);

            // Set optional fields
            if (workoutData.get("sets") != null) {
                workout.setSets(Integer.parseInt(workoutData.get("sets").toString()));
            }
            if (workoutData.get("reps") != null) {
                workout.setReps(Integer.parseInt(workoutData.get("reps").toString()));
            }
            if (workoutData.get("weight") != null && !workoutData.get("weight").toString().isEmpty()) {
                workout.setWeight(workoutData.get("weight").toString());
            }
            if (workoutData.get("duration") != null && !workoutData.get("duration").toString().isEmpty()) {
                workout.setDuration(workoutData.get("duration").toString());
            }
            if (workoutData.get("notes") != null && !workoutData.get("notes").toString().isEmpty()) {
                workout.setNotes(workoutData.get("notes").toString());
            }

            // Save workout
            WeeklyPlanWorkout savedWorkout = weeklyPlanWorkoutRepository.save(workout);
            log.info("Added workout {} to plan {}", savedWorkout.getId(), plan.getId());

            return savedWorkout;
        } catch (Exception e) {
            log.error("Error adding workout", e);
            throw new RuntimeException("Failed to add workout: " + e.getMessage());
        }
    }

    /**
     * Update an existing workout
     */
    public WeeklyPlanWorkout updateWorkout(Long workoutId, Map<String, Object> workoutData) {
        try {
            // Get existing workout
            WeeklyPlanWorkout workout = weeklyPlanWorkoutRepository.findById(workoutId)
                    .orElseThrow(() -> new RuntimeException("Workout not found"));

            // Update workout fields
            if (workoutData.get("workoutName") != null) {
                workout.setWorkoutName(workoutData.get("workoutName").toString());
            }
            
            if (workoutData.get("dayIndex") != null) {
                workout.setDayIndex(Integer.parseInt(workoutData.get("dayIndex").toString()));
            }

            if (workoutData.get("sets") != null) {
                workout.setSets(Integer.parseInt(workoutData.get("sets").toString()));
            } else if (workoutData.containsKey("sets")) {
                workout.setSets(null);
            }

            if (workoutData.get("reps") != null) {
                workout.setReps(Integer.parseInt(workoutData.get("reps").toString()));
            } else if (workoutData.containsKey("reps")) {
                workout.setReps(null);
            }

            if (workoutData.get("weight") != null && !workoutData.get("weight").toString().isEmpty()) {
                workout.setWeight(workoutData.get("weight").toString());
            } else {
                workout.setWeight(null);
            }

            if (workoutData.get("duration") != null && !workoutData.get("duration").toString().isEmpty()) {
                workout.setDuration(workoutData.get("duration").toString());
            } else {
                workout.setDuration(null);
            }

            if (workoutData.get("notes") != null && !workoutData.get("notes").toString().isEmpty()) {
                workout.setNotes(workoutData.get("notes").toString());
            } else {
                workout.setNotes(null);
            }

            if (workoutData.get("completed") != null) {
                workout.setCompleted(Boolean.parseBoolean(workoutData.get("completed").toString()));
            }

            // Save updated workout
            WeeklyPlanWorkout updatedWorkout = weeklyPlanWorkoutRepository.save(workout);
            log.info("Updated workout {}", workoutId);

            return updatedWorkout;
        } catch (Exception e) {
            log.error("Error updating workout", e);
            throw new RuntimeException("Failed to update workout: " + e.getMessage());
        }
    }

    /**
     * Update an existing workout with user verification
     */
    public WeeklyPlanWorkout updateWorkout(Long workoutId, Map<String, Object> workoutData, Long userId) {
        try {
            // Get existing workout
            WeeklyPlanWorkout workout = weeklyPlanWorkoutRepository.findById(workoutId)
                    .orElseThrow(() -> new RuntimeException("Workout not found"));

            // Verify the workout belongs to the user's plan
            if (!workout.getWeeklyPlan().getUser().getId().equals(userId)) {
                throw new RuntimeException("Workout does not belong to this user");
            }

            // Update workout fields
            if (workoutData.get("workoutName") != null) {
                workout.setWorkoutName(workoutData.get("workoutName").toString());
            }
            
            if (workoutData.get("dayIndex") != null) {
                workout.setDayIndex(Integer.parseInt(workoutData.get("dayIndex").toString()));
            }

            if (workoutData.get("sets") != null) {
                workout.setSets(Integer.parseInt(workoutData.get("sets").toString()));
            } else if (workoutData.containsKey("sets")) {
                workout.setSets(null);
            }

            if (workoutData.get("reps") != null) {
                workout.setReps(Integer.parseInt(workoutData.get("reps").toString()));
            } else if (workoutData.containsKey("reps")) {
                workout.setReps(null);
            }

            if (workoutData.get("weight") != null && !workoutData.get("weight").toString().isEmpty()) {
                workout.setWeight(workoutData.get("weight").toString());
            } else {
                workout.setWeight(null);
            }

            if (workoutData.get("duration") != null && !workoutData.get("duration").toString().isEmpty()) {
                workout.setDuration(workoutData.get("duration").toString());
            } else {
                workout.setDuration(null);
            }

            if (workoutData.get("notes") != null && !workoutData.get("notes").toString().isEmpty()) {
                workout.setNotes(workoutData.get("notes").toString());
            } else {
                workout.setNotes(null);
            }

            if (workoutData.get("completed") != null) {
                workout.setCompleted(Boolean.parseBoolean(workoutData.get("completed").toString()));
            }

            // Save updated workout
            WeeklyPlanWorkout updatedWorkout = weeklyPlanWorkoutRepository.save(workout);
            log.info("Updated workout {}", workoutId);

            return updatedWorkout;
        } catch (Exception e) {
            log.error("Error updating workout", e);
            throw new RuntimeException("Failed to update workout: " + e.getMessage());
        }
    }
}
