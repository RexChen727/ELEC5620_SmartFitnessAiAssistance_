package com.aiagent.main.service;

import com.aiagent.main.entity.User;
import com.aiagent.main.entity.UserProfile;
import com.aiagent.main.repository.UserProfileRepository;
import com.aiagent.main.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserProfileService {
    private final UserProfileRepository userProfileRepository;
    private final UserRepository userRepository;

    public UserProfileService(UserProfileRepository userProfileRepository, UserRepository userRepository) {
        this.userProfileRepository = userProfileRepository;
        this.userRepository = userRepository;
    }

    public Optional<UserProfile> getByUserId(Long userId) {
        return userProfileRepository.findByUserId(userId);
    }

    public UserProfile upsert(Long userId, UserProfile payload) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        UserProfile profile = userProfileRepository.findByUserId(userId).orElse(new UserProfile());
        profile.setUser(user);
        profile.setAge(payload.getAge());
        profile.setGender(payload.getGender());
        profile.setHeightCm(payload.getHeightCm());
        profile.setWeightKg(payload.getWeightKg());
        return userProfileRepository.save(profile);
    }
}


