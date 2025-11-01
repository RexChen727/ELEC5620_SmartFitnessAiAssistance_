import { useState, useEffect, useCallback } from 'react';
import { weeklyPlanService } from '../services/weeklyPlanService';

/**
 * 周计划管理 Hook
 * 封装所有与周计划相关的状态和操作
 */
export const useWeeklyPlan = (user) => {
    const [weeklyPlan, setWeeklyPlan] = useState(null);
    const [allPlans, setAllPlans] = useState([]);
    const [selectedPlanIndex, setSelectedPlanIndex] = useState(null);
    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [workoutsByDay, setWorkoutsByDay] = useState({});
    const [muscleGroupsByDay, setMuscleGroupsByDay] = useState({});

    /**
     * 加载所有计划
     */
    const loadAllPlans = useCallback(async () => {
        if (!user) return;
        
        try {
            const plans = await weeklyPlanService.loadAll(user.id);
            console.log('All plans loaded:', plans);
            setAllPlans(plans);
            
            if (plans.length > 0) {
                const currentIndex = selectedPlanIndex;
                const targetIndex = (currentIndex !== null && currentIndex >= 0 && currentIndex < plans.length) 
                    ? currentIndex 
                    : plans.length - 1;
                setSelectedPlanIndex(targetIndex);
                const targetPlan = plans[targetIndex];
                setWeeklyPlan(targetPlan);
                setStartDate(targetPlan.startDate);
                setEndDate(targetPlan.endDate);
                setWorkoutsByDay(targetPlan.workoutsByDay || {});
                setMuscleGroupsByDay(targetPlan.muscleGroupsByDay || {});
            } else {
                // 没有计划时，清空状态
                setWeeklyPlan(null);
                setStartDate('');
                setEndDate('');
                setWorkoutsByDay({});
                setMuscleGroupsByDay({});
                setSelectedPlanIndex(null);
            }
        } catch (error) {
            console.error('Error loading all plans:', error);
            setWeeklyPlan(null);
            setAllPlans([]);
        }
    }, [user, selectedPlanIndex]);

    /**
     * 加载计划详情
     */
    const loadPlanDetails = useCallback(async (planId) => {
        if (!user) return;
        try {
            const plan = await weeklyPlanService.getPlanById(planId, user.id);
            console.log('Plan details loaded:', plan);
            setWeeklyPlan(plan);
            setStartDate(plan.startDate);
            setEndDate(plan.endDate);
            setWorkoutsByDay(plan.workoutsByDay || {});
            setMuscleGroupsByDay(plan.muscleGroupsByDay || {});
        } catch (error) {
            console.error('Error loading plan details:', error);
        }
    }, [user]);

    /**
     * 生成AI计划
     */
    const generateAIPlan = useCallback(async () => {
        if (!user) return;

        setLoading(true);
        try {
            const plan = await weeklyPlanService.generate(user.id);
            console.log('Generated plan:', plan);
            await loadAllPlans();
            return { success: true, plan };
        } catch (error) {
            console.error('Error generating plan:', error);
            return { success: false, error: error.response?.data?.error || error.message };
        } finally {
            setLoading(false);
        }
    }, [user, loadAllPlans]);

    /**
     * 添加训练
     */
    const addWorkout = useCallback(async (workoutData) => {
        if (!user) return;
        try {
            // 如果没有 weeklyPlan 或 weeklyPlan.id，不发送 planId
            if (!weeklyPlan || !weeklyPlan.id) {
                const { planId, ...dataWithoutPlanId } = workoutData;
                workoutData = dataWithoutPlanId;
            }
            
            await weeklyPlanService.addWorkout(user.id, workoutData);
            await loadAllPlans();
            return { success: true };
        } catch (error) {
            console.error('Error adding workout:', error);
            return { success: false, error: error.response?.data?.error || error.message };
        }
    }, [user, weeklyPlan, loadAllPlans]);

    /**
     * 更新训练
     */
    const updateWorkout = useCallback(async (workoutData) => {
        if (!user) return;
        try {
            await weeklyPlanService.updateWorkout(user.id, workoutData.id, workoutData);
            await loadAllPlans();
            return { success: true };
        } catch (error) {
            console.error('Error updating workout:', error);
            return { success: false, error: error.response?.data?.error || error.message };
        }
    }, [user, loadAllPlans]);

    /**
     * 切换训练完成状态
     */
    const toggleWorkoutCompletion = useCallback(async (workoutId) => {
        if (!user) return;
        try {
            await weeklyPlanService.toggleWorkoutCompletion(user.id, workoutId);
            await loadAllPlans();
        } catch (error) {
            console.error('Error toggling workout:', error);
        }
    }, [user, loadAllPlans]);

    /**
     * 清除某天的训练
     */
    const clearDayWorkouts = useCallback(async (dayIndex) => {
        if (!weeklyPlan || !user) return { success: false, error: 'No plan selected' };

        setLoading(true);
        try {
            await weeklyPlanService.clearDayWorkouts(weeklyPlan.id, dayIndex, user.id);
            await loadAllPlans();
            return { success: true };
        } catch (error) {
            console.error('Error clearing day workouts:', error);
            return { success: false, error: error.response?.data?.error || 'Unknown error' };
        } finally {
            setLoading(false);
        }
    }, [weeklyPlan, user, loadAllPlans]);

    /**
     * 删除周计划
     */
    const deletePlan = useCallback(async () => {
        if (!weeklyPlan || !user) return { success: false, error: 'No plan selected' };

        setLoading(true);
        try {
            await weeklyPlanService.deletePlan(weeklyPlan.id, user.id);
            await loadAllPlans();
            return { success: true };
        } catch (error) {
            console.error('Error deleting plan:', error);
            return { success: false, error: error.response?.data?.error || 'Unknown error' };
        } finally {
            setLoading(false);
        }
    }, [weeklyPlan, user, loadAllPlans]);

    /**
     * 复制到下周
     */
    const copyToNextWeek = useCallback(async (action) => {
        if (!weeklyPlan || !user) return { success: false, error: 'No plan selected' };

        setLoading(true);
        try {
            await weeklyPlanService.copyToNextWeek(user.id, weeklyPlan.id, action);
            await loadAllPlans();
            return { success: true };
        } catch (error) {
            console.error('Error copying to next week:', error);
            return { success: false, error: error.response?.data?.error || error.message };
        } finally {
            setLoading(false);
        }
    }, [weeklyPlan, user, loadAllPlans]);

    // 初始加载
    useEffect(() => {
        if (user) {
            loadAllPlans();
        }
    }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

    // 当选择的计划索引改变时，更新显示的计划
    useEffect(() => {
        if (allPlans.length > 0 && selectedPlanIndex !== null && allPlans[selectedPlanIndex]) {
            const selectedPlan = allPlans[selectedPlanIndex];
            setWeeklyPlan(selectedPlan);
            setStartDate(selectedPlan.startDate);
            setEndDate(selectedPlan.endDate);
            setWorkoutsByDay(selectedPlan.workoutsByDay || {});
            setMuscleGroupsByDay(selectedPlan.muscleGroupsByDay || {});
        }
    }, [selectedPlanIndex, allPlans]);

    return {
        // 状态
        weeklyPlan,
        allPlans,
        selectedPlanIndex,
        loading,
        startDate,
        endDate,
        workoutsByDay,
        muscleGroupsByDay,
        
        // 操作
        setSelectedPlanIndex,
        loadAllPlans,
        loadPlanDetails,
        generateAIPlan,
        addWorkout,
        updateWorkout,
        toggleWorkoutCompletion,
        clearDayWorkouts,
        deletePlan,
        copyToNextWeek
    };
};

