package com.aiagent.main.controller;

import com.aiagent.main.entity.User;
import com.aiagent.main.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175"})
public class HealthController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("timestamp", System.currentTimeMillis());
        
        try {
            long userCount = userRepository.count();
            response.put("database", "Connected");
            response.put("userCount", userCount);
        } catch (Exception e) {
            response.put("database", "Error: " + e.getMessage());
        }
        
        return ResponseEntity.ok(response);
    }
}
