package com.aiagent.main.service;

import com.aiagent.main.entity.CalendarEvent;
import com.aiagent.main.entity.User;
import com.aiagent.main.repository.CalendarEventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
public class CalendarService {
    
    @Autowired
    private CalendarEventRepository calendarEventRepository;
    
    public List<CalendarEvent> getEventsByUser(User user) {
        return calendarEventRepository.findByUserOrderByStartTimeAsc(user);
    }
    
    public List<CalendarEvent> getEventsByUserAndDateRange(User user, LocalDateTime start, LocalDateTime end) {
        return calendarEventRepository.findByUserAndStartTimeBetweenOrderByStartTimeAsc(user, start, end);
    }
    
    public CalendarEvent saveEvent(CalendarEvent event) {
        return calendarEventRepository.save(event);
    }
    
    public void deleteEvent(Long eventId) {
        calendarEventRepository.deleteById(eventId);
    }
    
    public String generateICalendarContent(List<CalendarEvent> events, String calendarName) {
        StringBuilder ics = new StringBuilder();
        
        // iCalendar header
        ics.append("BEGIN:VCALENDAR\n");
        ics.append("VERSION:2.0\n");
        ics.append("PRODID:-//AI Agent//Calendar Export//EN\n");
        ics.append("CALSCALE:GREGORIAN\n");
        ics.append("METHOD:PUBLISH\n");
        ics.append("X-WR-CALNAME:").append(calendarName).append("\n");
        ics.append("X-WR-CALDESC:AI Agent Calendar Export\n");
        
        // Add events
        for (CalendarEvent event : events) {
            ics.append("BEGIN:VEVENT\n");
            ics.append("UID:").append(UUID.randomUUID().toString()).append("@aiagent.com\n");
            ics.append("DTSTAMP:").append(formatDateTime(LocalDateTime.now())).append("\n");
            ics.append("DTSTART:").append(formatDateTime(event.getStartTime())).append("\n");
            ics.append("DTEND:").append(formatDateTime(event.getEndTime())).append("\n");
            ics.append("SUMMARY:").append(escapeText(event.getTitle())).append("\n");
            
            if (event.getDescription() != null && !event.getDescription().isEmpty()) {
                ics.append("DESCRIPTION:").append(escapeText(event.getDescription())).append("\n");
            }
            
            if (event.getLocation() != null && !event.getLocation().isEmpty()) {
                ics.append("LOCATION:").append(escapeText(event.getLocation())).append("\n");
            }
            
            ics.append("STATUS:CONFIRMED\n");
            ics.append("END:VEVENT\n");
        }
        
        // iCalendar footer
        ics.append("END:VCALENDAR\n");
        
        return ics.toString();
    }
    
    private String formatDateTime(LocalDateTime dateTime) {
        return dateTime.format(DateTimeFormatter.ofPattern("yyyyMMdd'T'HHmmss'Z'"));
    }
    
    private String escapeText(String text) {
        if (text == null) return "";
        return text.replace("\\", "\\\\")
                  .replace(",", "\\,")
                  .replace(";", "\\;")
                  .replace("\n", "\\n")
                  .replace("\r", "");
    }
}
