package com.aiagent.main.service;

import com.aiagent.main.entity.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.util.*;

@Service
@Slf4j
public class AiAgentService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final ConversationService conversationService;
    private final MessageService messageService;
    private final GymEquipmentService gymEquipmentService;

    @Value("${ai.model.base-url}")
    private String aiModelBaseUrl;

    @Value("${ai.model.name}")
    private String aiModelName;

    @Value("${ai.model.api-key:}")
    private String aiModelApiKey;

    private final Map<String, String> agentPrompts = new HashMap<>() {
        {
            put("general", "You are a helpful AI assistant. Provide clear and concise responses to user queries.");
            put("coding",
                    "You are a coding assistant. Help users with programming questions, code reviews, and technical solutions.");
            put("creative",
                    "You are a creative writing assistant. Help users with creative writing, storytelling, and content creation.");
            put("analytical",
                    "You are an analytical assistant. Help users analyze data, solve problems, and make informed decisions.");
            put("fitness",
                    "You are a fitness AI assistant specializing in gym equipment alternatives. When users ask about equipment that is unavailable or occupied, provide suitable alternatives based on muscle groups and training goals. Always explain why the alternative is suitable and mention safety tips when relevant.");
        }
    };

    public AiAgentService(RestTemplate restTemplate, ObjectMapper objectMapper,
            ConversationService conversationService, MessageService messageService,
            GymEquipmentService gymEquipmentService) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
        this.conversationService = conversationService;
        this.messageService = messageService;
        this.gymEquipmentService = gymEquipmentService;
    }

    public ChatResponse chat(String agentType, String message, Long conversationId) {
        try {
            // Get or create conversation
            Conversation conversation;
            if (conversationId != null) {
                conversation = conversationService.findById(conversationId)
                        .orElseThrow(() -> new RuntimeException("Conversation not found"));
            } else {
                // Create new conversation with first message as title
                String title = message.length() > 50 ? message.substring(0, 50) + "..." : message;
                conversation = conversationService.createConversation(1L, title); // Default user ID
            }

            // Save user message
            Message userMessage = new Message(message, true, conversation);
            messageService.saveMessage(userMessage);

            // Prepare AI prompt
            String prompt = buildPrompt(agentType, message, conversation);

            // Call AI model
            String aiResponse = callAiModel(prompt);

            // Save AI response
            Message aiMessage = new Message(aiResponse, false, conversation);
            messageService.saveMessage(aiMessage);

            return new ChatResponse(aiResponse, conversation.getId(), agentType);

        } catch (Exception e) {
            log.error("Error in AI chat service", e);
            throw new RuntimeException("Failed to process chat request", e);
        }
    }

    private String buildPrompt(String agentType, String message, Conversation conversation) {
        String basePrompt = agentPrompts.getOrDefault(agentType, agentPrompts.get("general"));

        // Get conversation history for context
        List<Message> messages = messageService.getMessagesByConversationId(conversation.getId());
        StringBuilder context = new StringBuilder();

        for (Message msg : messages) {
            if (msg.getIsUser()) {
                context.append("User: ").append(msg.getContent()).append("\n");
            } else {
                context.append("Assistant: ").append(msg.getContent()).append("\n");
            }
        }

        // Add fitness equipment knowledge base for fitness agent
        String equipmentKnowledge = "";
        if ("fitness".equals(agentType)) {
            equipmentKnowledge = "\n\nFitness Equipment Knowledge Base:\n" + getEquipmentKnowledgeBase();
        }

        return basePrompt + equipmentKnowledge + "\n\nConversation History:\n" + context.toString() +
                "\nCurrent User Message: " + message + "\n\nPlease respond:";
    }

    private String getEquipmentKnowledgeBase() {
        List<GymEquipment> equipmentList = gymEquipmentService.getAllEquipment();
        StringBuilder knowledge = new StringBuilder();

        for (GymEquipment equipment : equipmentList) {
            knowledge.append("\n器械名称: ").append(equipment.getName())
                    .append("\n描述: ").append(equipment.getDescription())
                    .append("\n主要锻炼肌群: ").append(equipment.getPrimaryMuscles())
                    .append("\n替代器械: ").append(equipment.getAlternativeEquipments())
                    .append("\n训练类型: ").append(equipment.getWorkoutTypes())
                    .append("\n难度: ").append(equipment.getDifficulty())
                    .append("\n注意事项: ").append(equipment.getTips())
                    .append("\n---\n");
        }

        return knowledge.toString();
    }

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

            // 判断是否是 Ollama (localhost:11434)
            if (aiModelBaseUrl.contains("localhost:11434") || aiModelBaseUrl.contains("127.0.0.1:11434")) {
                url = aiModelBaseUrl + "/api/chat";
                // Ollama 需要设置 stream=false 来获得完整响应
                requestBody.put("stream", false);
            } else {
                url = aiModelBaseUrl + "/chat";
            }
        }

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        
        log.info("Calling AI model at URL: {}", url);
        log.info("Request body: {}", requestBody);
        
        String response;
        try {
            response = restTemplate.postForObject(url, entity, String.class);
        } catch (Exception e) {
            log.error("Error calling AI model at URL: {}", url, e);
            throw new RuntimeException("Failed to call AI model: " + e.getMessage(), e);
        }

        log.info("Raw AI model response: {}", response);

        if (response == null || response.trim().isEmpty()) {
            log.error("AI model returned null or empty response");
            throw new RuntimeException("AI model returned null or empty response");
        }

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
                // OpenAI API格式
                JsonNode choices = jsonNode.get("choices");
                if (choices.size() > 0) {
                    JsonNode firstChoice = choices.get(0);
                    if (firstChoice.has("message") && firstChoice.get("message").has("content")) {
                        fullResponse.append(firstChoice.get("message").get("content").asText());
                    }
                }
            } else if (jsonNode.has("message")) {
                // Ollama格式的非流式响应（单个JSON对象）
                JsonNode message = jsonNode.get("message");
                if (message.has("content")) {
                    fullResponse.append(message.get("content").asText());
                } else {
                    log.warn("Ollama response has 'message' but no 'content' field");
                }
            } else {
                // 尝试处理流式响应（多行JSON）
                if (response.contains("\n")) {
                    String[] lines = response.split("\n");
                    for (String line : lines) {
                        if (!line.trim().isEmpty()) {
                            try {
                                JsonNode lineNode = objectMapper.readTree(line);
                                if (lineNode.has("message") && lineNode.get("message").has("content")) {
                                    fullResponse.append(lineNode.get("message").get("content").asText());
                                }
                            } catch (Exception lineError) {
                                // 忽略无法解析的行
                                log.debug("Skipping unparseable line: {}", line);
                            }
                        }
                    }
                } else {
                    log.warn("Unknown response format. Response: {}", response);
                    // 如果无法解析，返回原始响应的一部分
                    fullResponse.append(response.substring(0, Math.min(500, response.length())));
                }
            }
        } catch (Exception e) {
            log.error("Error parsing AI model response. Response was: {}", response, e);
            throw new RuntimeException("Failed to parse AI response: " + e.getMessage(), e);
        }

        log.info("Extracted AI response: {}", fullResponse);
        
        String finalResponse = fullResponse.toString();
        if (finalResponse == null || finalResponse.trim().isEmpty()) {
            log.error("Extracted response is empty. Original response was: {}", response);
            throw new RuntimeException("AI model response is empty. Please check Ollama service and model configuration.");
        }
        
        return finalResponse;
    }
}
