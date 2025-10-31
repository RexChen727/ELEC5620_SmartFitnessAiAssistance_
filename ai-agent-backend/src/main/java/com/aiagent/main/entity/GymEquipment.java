package com.aiagent.main.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "gym_equipment")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GymEquipment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(length = 2000)
    private String description;

    @Column(length = 2000)
    private String primaryMuscles;

    @Column(length = 2000)
    private String alternativeEquipments;

    @Column(length = 1000)
    private String workoutTypes;

    @Column(length = 1000)
    private String difficulty;

    @Column(length = 2000)
    private String tips;
}
