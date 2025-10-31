package com.aiagent.main.service;

import com.aiagent.main.entity.GymEquipment;
import com.aiagent.main.repository.GymEquipmentRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
public class GymEquipmentService {

    @Autowired
    private GymEquipmentRepository gymEquipmentRepository;

    @PostConstruct
    public void initEquipmentData() {
        if (gymEquipmentRepository.count() == 0) {
            log.info("Initializing gym equipment database...");
            createInitialEquipmentData();
        }
    }

    private void createInitialEquipmentData() {
        // Chest Training Equipment
        saveEquipment("Barbell Bench Press",
                "Barbell bench press is one of the most classic chest training exercises, primarily targeting pectoralis major, anterior deltoids, and triceps.",
                "Pectoralis Major (Upper/Middle/Lower), Anterior Deltoids, Triceps",
                "Dumbbell Bench Press, Chest Press Machine, Push-ups, Flat Bench Press, Incline Bench Press",
                "Strength Training, Muscle Building",
                "Intermediate to Advanced",
                "Keep shoulder blades retracted and depressed, control speed, pay attention to breathing rhythm.");

        saveEquipment("Dumbbell Bench Press",
                "Dumbbell bench press provides greater range of motion compared to barbell bench press, helping to balance left and right strength.",
                "Pectoralis Major, Anterior Deltoids, Triceps",
                "Barbell Bench Press, Chest Press Machine, Smith Machine Bench Press, Push-ups",
                "Strength Training, Muscle Building, Rehabilitation Training",
                "Beginner to Advanced",
                "Choose appropriate dumbbell weight, maintain stable movement, avoid lateral swaying.");

        saveEquipment("Chest Press Machine",
                "Fixed chest press machine is suitable for beginners, providing stable movement path with high safety.",
                "Pectoralis Major, Anterior Deltoids, Triceps",
                "Barbell Bench Press, Dumbbell Bench Press, Push-ups, Pec Deck Machine",
                "Strength Training, Muscle Building, Beginner Training",
                "Beginner",
                "Adjust seat height, keep back pressed against backrest, control weight.");

        // Back Training Equipment
        saveEquipment("Pull-up Bar",
                "Pull-ups primarily target latissimus dorsi, biceps, and rhomboids, one of the most effective back training exercises.",
                "Latissimus Dorsi, Rhomboids, Teres Major, Biceps",
                "Barbell Rows, Seated Rows, Lat Pulldown, T-Bar Rows",
                "Strength Training, Muscle Building, Functional Training",
                "Intermediate to Advanced",
                "Keep body stable, avoid swinging, can use assistance bands initially.");

        saveEquipment("Barbell Rows",
                "Barbell rows effectively increase back muscle thickness while training core muscles.",
                "Latissimus Dorsi, Rhomboids, Middle/Lower Trapezius, Biceps",
                "Seated Rows, T-Bar Rows, Dumbbell Rows, Low Cable Rows",
                "Strength Training, Muscle Building",
                "Intermediate to Advanced",
                "Keep back straight, pull barbell toward abdomen, avoid rounding back.");

        saveEquipment("Seated Row Machine",
                "Seated row machine provides fixed movement path, suitable for precise back muscle training.",
                "Latissimus Dorsi, Rhomboids, Middle/Lower Trapezius, Biceps",
                "Barbell Rows, T-Bar Rows, Lat Pulldown, Pull-ups",
                "Strength Training, Muscle Building, Beginner Training",
                "Beginner to Intermediate",
                "Keep chest up, retract shoulder blades when pulling back.");

        // Leg Training Equipment
        saveEquipment("Barbell Squats",
                "Barbell squats are the gold standard for leg training, primarily targeting quadriceps, glutes, and hamstrings.",
                "Quadriceps, Glutes, Hamstrings, Calf Muscles",
                "Leg Press Machine, Smith Machine Squats, Leg Press, Dumbbell Squats",
                "Strength Training, Muscle Building, Functional Training",
                "Intermediate to Advanced",
                "Keep core tight, knees aligned with toes, squat until thighs parallel to ground.");

        saveEquipment("Leg Press Machine",
                "Leg press machine can handle heavier weights, suitable for leg strength and muscle mass training.",
                "Quadriceps, Glutes, Hamstrings",
                "Barbell Squats, Machine Squats, Hack Squats, Front Squats",
                "Strength Training, Muscle Building, Rehabilitation Training",
                "Beginner to Advanced",
                "Keep back pressed against backrest, control lowering speed, avoid excessive knee flexion.");

        saveEquipment("Squat Machine",
                "Squat machine provides movement assistance, reducing core muscle requirements, focusing more on leg training.",
                "Quadriceps, Glutes, Hamstrings",
                "Barbell Squats, Smith Machine Squats, Leg Press, Hack Squats",
                "Strength Training, Muscle Building, Beginner Training",
                "Beginner to Intermediate",
                "Adjust body position properly, keep knees aligned with toes.");

        // Shoulder Training Equipment
        saveEquipment("Barbell Shoulder Press",
                "Barbell shoulder press is the core exercise for shoulder training, primarily targeting anterior and medial deltoids.",
                "Anterior Deltoids, Medial Deltoids, Upper Trapezius, Triceps",
                "Dumbbell Shoulder Press, Smith Machine Shoulder Press, Machine Shoulder Press, Arnold Press",
                "Strength Training, Muscle Building",
                "Intermediate to Advanced",
                "Keep core stable, don't fully lock elbows when pressing up.");

        saveEquipment("Dumbbell Lateral Raises",
                "Dumbbell lateral raises are the best isolation exercise for medial deltoids.",
                "Medial Deltoids",
                "Cable Lateral Raises, Machine Lateral Raises, Barbell Lateral Raises",
                "Muscle Building, Toning Training",
                "Beginner to Advanced",
                "Keep slight elbow bend, raise slowly, avoid using momentum to swing.");

        // Arm Training Equipment
        saveEquipment("Barbell Curls",
                "Barbell curls primarily target biceps, a classic arm training exercise.",
                "Biceps, Brachialis",
                "Dumbbell Curls, Machine Curls, Cable Curls, Hammer Curls",
                "Muscle Building, Toning Training",
                "Beginner to Advanced",
                "Keep elbows fixed, control movement speed, avoid body swaying.");

        saveEquipment("Dips",
                "Dips are effective for training triceps and lower chest muscles.",
                "Triceps, Lower Pectoralis Major, Anterior Deltoids",
                "Machine Dips, Close-grip Push-ups, Dumbbell Tricep Extensions, Cable Pushdowns",
                "Strength Training, Muscle Building, Functional Training",
                "Intermediate to Advanced",
                "Keep body vertical, control lowering speed, can use assistance bands.");

        // Cardio Equipment
        saveEquipment("Treadmill",
                "Treadmill is the most common cardio training equipment, suitable for cardiovascular fitness and fat loss training.",
                "Cardiovascular System, Full Body Muscles",
                "Outdoor Running, Elliptical Machine, Rowing Machine, Spin Bike",
                "Cardio Training, Fat Loss Training, Cardiovascular Training",
                "Beginner to Advanced",
                "Pay attention to speed and incline adjustment, maintain proper running form, avoid overtraining.");

        saveEquipment("Elliptical Machine",
                "Elliptical machine has low joint impact, suitable for people with knee problems for cardio training.",
                "Cardiovascular System, Leg Muscles, Glute Muscles",
                "Treadmill, Spin Bike, Rowing Machine, Step Machine",
                "Cardio Training, Fat Loss Training, Rehabilitation Training",
                "Beginner to Advanced",
                "Keep upper body straight, drive with heels, adjust resistance and speed.");

        saveEquipment("Rowing Machine",
                "Rowing machine is a full-body cardio equipment, training both cardiovascular and muscular strength.",
                "Cardiovascular System, Back Muscles, Leg Muscles, Core Muscles",
                "Treadmill, Elliptical Machine, Spin Bike, Squats",
                "Cardio Training, Strength Training, Full Body Training",
                "Beginner to Advanced",
                "Push with legs first, then lean back, then pull arms, keep movement smooth and fluid.");

        log.info("Gym equipment database initialized successfully.");
    }

    private void saveEquipment(String name, String description, String primaryMuscles,
            String alternativeEquipments, String workoutTypes,
            String difficulty, String tips) {
        GymEquipment equipment = new GymEquipment();
        equipment.setName(name);
        equipment.setDescription(description);
        equipment.setPrimaryMuscles(primaryMuscles);
        equipment.setAlternativeEquipments(alternativeEquipments);
        equipment.setWorkoutTypes(workoutTypes);
        equipment.setDifficulty(difficulty);
        equipment.setTips(tips);
        gymEquipmentRepository.save(equipment);
    }

    public List<GymEquipment> getAllEquipment() {
        return gymEquipmentRepository.findAll();
    }

    public Optional<GymEquipment> getEquipmentByName(String name) {
        return gymEquipmentRepository.findByName(name);
    }

    public List<GymEquipment> searchEquipment(String keyword) {
        return gymEquipmentRepository.searchByNameOrDescription(keyword);
    }

    public List<GymEquipment> getEquipmentByMuscleGroup(String muscle) {
        return gymEquipmentRepository.findByMuscleGroup(muscle);
    }
}
