package com.aiagent.main.repository;

import com.aiagent.main.entity.MonthlyReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface MonthlyReportRepository extends JpaRepository<MonthlyReport, Long> {
    
    List<MonthlyReport> findByUserIdOrderByReportMonthDesc(Long userId);
    
    Optional<MonthlyReport> findByUserIdAndReportMonth(Long userId, LocalDate reportMonth);
    
    boolean existsByUserIdAndReportMonth(Long userId, LocalDate reportMonth);
}

