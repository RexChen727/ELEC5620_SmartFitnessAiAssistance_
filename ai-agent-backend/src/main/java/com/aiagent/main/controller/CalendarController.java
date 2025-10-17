package com.aiagent.main.controller;

import com.aiagent.main.entity.CalendarEvent;
import com.aiagent.main.entity.User;
import com.aiagent.main.service.CalendarService;
import com.aiagent.main.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/calendar")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:5175"})
public class CalendarController {
    
    @Autowired
    private CalendarService calendarService;
    
    @Autowired
    private UserService userService;
    
    @GetMapping("/events")
    public ResponseEntity<List<CalendarEvent>> getEvents(@RequestParam Long userId) {
        try {
            Optional<User> userOpt = userService.findById(userId);
            if (userOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            User user = userOpt.get();
            
            List<CalendarEvent> events = calendarService.getEventsByUser(user);
            return ResponseEntity.ok(events);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PostMapping("/events")
    public ResponseEntity<CalendarEvent> createEvent(@RequestBody Map<String, Object> eventData) {
        try {
            // 如果user只有id，需要从数据库加载完整的user对象
            Long userId = null;
            if (eventData.containsKey("user") && eventData.get("user") instanceof Map) {
                Map<String, Object> userData = (Map<String, Object>) eventData.get("user");
                userId = Long.valueOf(userData.get("id").toString());
            }
            
            if (userId == null) {
                return ResponseEntity.badRequest().build();
            }
            
            Optional<User> userOpt = userService.findById(userId);
            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            
            // 创建CalendarEvent对象
            CalendarEvent event = new CalendarEvent();
            event.setTitle(eventData.get("title").toString());
            event.setDescription(eventData.get("description") != null ? eventData.get("description").toString() : "");
            event.setLocation(eventData.get("location") != null ? eventData.get("location").toString() : "");
            event.setUser(userOpt.get());
            
            // 处理时间字段
            String startTimeStr = eventData.get("startTime").toString();
            String endTimeStr = eventData.get("endTime").toString();
            
            // 将ISO字符串转换为LocalDateTime
            java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ISO_LOCAL_DATE_TIME;
            event.setStartTime(java.time.LocalDateTime.parse(startTimeStr.replace("Z", ""), formatter));
            event.setEndTime(java.time.LocalDateTime.parse(endTimeStr.replace("Z", ""), formatter));
            
            CalendarEvent savedEvent = calendarService.saveEvent(event);
            return ResponseEntity.ok(savedEvent);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @DeleteMapping("/events/{eventId}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long eventId) {
        try {
            calendarService.deleteEvent(eventId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/export/{userId}")
    public ResponseEntity<String> exportCalendar(@PathVariable Long userId, 
                                               @RequestParam(defaultValue = "AI Agent Calendar") String calendarName) {
        try {
            Optional<User> userOpt = userService.findById(userId);
            if (userOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            User user = userOpt.get();
            
            List<CalendarEvent> events = calendarService.getEventsByUser(user);
            String icsContent = calendarService.generateICalendarContent(events, calendarName);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("text/calendar; charset=utf-8"));
            headers.setContentDispositionFormData("attachment", "ai-agent-calendar.ics");
            
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(icsContent);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/subscribe/{userId}")
    public ResponseEntity<String> getSubscribeUrl(@PathVariable Long userId) {
        try {
            Optional<User> userOpt = userService.findById(userId);
            if (userOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            User user = userOpt.get();
            
            // 生成订阅URL
            String subscribeUrl = "http://localhost:8080/api/calendar/export/" + userId + "?calendarName=" + 
                                java.net.URLEncoder.encode(user.getUsername() + "'s AI Agent Calendar", "UTF-8");
            
            return ResponseEntity.ok(subscribeUrl);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
