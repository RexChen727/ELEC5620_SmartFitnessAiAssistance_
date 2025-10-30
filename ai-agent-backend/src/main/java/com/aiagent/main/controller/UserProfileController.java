package com.aiagent.main.controller;

import com.aiagent.main.entity.UserProfile;
import com.aiagent.main.service.UserProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/user-profiles")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175"})
public class UserProfileController {

    private final UserProfileService userProfileService;

    public UserProfileController(UserProfileService userProfileService) {
        this.userProfileService = userProfileService;
    }

    @GetMapping("/by-user/{userId}")
    public ResponseEntity<?> getByUser(@PathVariable Long userId) {
        return userProfileService.getByUserId(userId)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.ok(Map.of()));
    }

    @PostMapping("/by-user/{userId}")
    public ResponseEntity<UserProfile> upsert(@PathVariable Long userId, @RequestBody UserProfile payload) {
        return ResponseEntity.ok(userProfileService.upsert(userId, payload));
    }
}


