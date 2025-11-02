package com.aiagent.main.service;

import com.aiagent.main.entity.User;
import com.aiagent.main.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public User registerUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        // Set default role if not provided, and ensure it's uppercase to match database constraint
        if (user.getRole() == null || user.getRole().isEmpty()) {
            user.setRole("USER");
        } else {
            // Convert role to uppercase to match database constraint (chk_role: 'USER', 'ADMIN', 'TRAINER')
            user.setRole(user.getRole().toUpperCase());
        }
        // Validate role is one of the allowed values
        if (!user.getRole().equals("USER") && !user.getRole().equals("ADMIN") && !user.getRole().equals("TRAINER")) {
            throw new RuntimeException("Invalid role. Allowed values: USER, ADMIN, TRAINER");
        }
        return userRepository.save(user);
    }

    public User loginUser(String email, String password) {
        Optional<User> user = userRepository.findByEmail(email);
        if (user.isPresent() && user.get().getPassword().equals(password)) {
            return user.get();
        }
        throw new RuntimeException("Invalid email or password");
    }

    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }
}
