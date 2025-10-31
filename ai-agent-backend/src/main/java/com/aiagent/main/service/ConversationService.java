package com.aiagent.main.service;

import com.aiagent.main.entity.Conversation;
import com.aiagent.main.entity.User;
import com.aiagent.main.repository.ConversationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class ConversationService {

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private UserService userService;

    public Conversation createConversation(Long userId, String title) {
        Optional<User> user = userService.findById(userId);
        if (user.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        
        Conversation conversation = new Conversation(title, user.get());
        return conversationRepository.save(conversation);
    }

    public List<Conversation> getConversationsByUserId(Long userId) {
        return conversationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public Optional<Conversation> findById(Long id) {
        return conversationRepository.findById(id);
    }
}
