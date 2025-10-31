package com.aiagent.main.repository;

import com.aiagent.main.entity.CalendarEvent;
import com.aiagent.main.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CalendarEventRepository extends JpaRepository<CalendarEvent, Long> {
    List<CalendarEvent> findByUserOrderByStartTimeAsc(User user);
    List<CalendarEvent> findByUserAndStartTimeBetweenOrderByStartTimeAsc(User user, LocalDateTime start, LocalDateTime end);
}
