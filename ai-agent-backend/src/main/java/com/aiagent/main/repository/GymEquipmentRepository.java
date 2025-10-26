package com.aiagent.main.repository;

import com.aiagent.main.entity.GymEquipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GymEquipmentRepository extends JpaRepository<GymEquipment, Long> {

    Optional<GymEquipment> findByName(String name);

    @Query("SELECT e FROM GymEquipment e WHERE e.name LIKE %:keyword% OR e.description LIKE %:keyword%")
    List<GymEquipment> searchByNameOrDescription(@Param("keyword") String keyword);

    @Query("SELECT e FROM GymEquipment e WHERE e.primaryMuscles LIKE %:muscle%")
    List<GymEquipment> findByMuscleGroup(@Param("muscle") String muscle);
}
