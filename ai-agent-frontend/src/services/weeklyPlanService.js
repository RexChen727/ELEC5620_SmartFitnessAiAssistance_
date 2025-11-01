import axios from 'axios';

/**
 * Weekly Plan Service
 * 封装所有与周计划相关的 API 调用
 */
export const weeklyPlanService = {
    /**
     * 获取用户的所有周计划
     */
    async loadAll(userId) {
        const response = await axios.get(`/api/weekly-plan/all?userId=${userId}`);
        return response.data;
    },

    /**
     * 获取指定计划详情
     */
    async getPlanById(planId, userId) {
        const response = await axios.get(`/api/weekly-plan/${planId}?userId=${userId}`);
        return response.data;
    },

    /**
     * 生成新的周计划
     */
    async generate(userId) {
        const response = await axios.post(`/api/weekly-plan/generate?userId=${userId}`);
        return response.data;
    },

    /**
     * 检查当前周是否有计划
     */
    async checkCurrentWeek(userId) {
        const response = await axios.get(`/api/weekly-plan/check-current-week?userId=${userId}`);
        return response.data;
    },

    /**
     * 添加训练
     */
    async addWorkout(userId, workoutData) {
        const response = await axios.post(`/api/weekly-plan/add-workout?userId=${userId}`, workoutData);
        return response.data;
    },

    /**
     * 更新训练
     */
    async updateWorkout(userId, workoutId, workoutData) {
        const response = await axios.put(`/api/weekly-plan/workout/${workoutId}?userId=${userId}`, workoutData);
        return response.data;
    },

    /**
     * 切换训练完成状态
     */
    async toggleWorkoutCompletion(userId, workoutId) {
        const response = await axios.put(`/api/weekly-plan/workout/${workoutId}/toggle?userId=${userId}`);
        return response.data;
    },

    /**
     * 清除某天的所有训练
     */
    async clearDayWorkouts(planId, dayIndex, userId) {
        const response = await axios.delete(`/api/weekly-plan/clear-day?planId=${planId}&dayIndex=${dayIndex}&userId=${userId}`);
        return response.data;
    },

    /**
     * 删除周计划
     */
    async deletePlan(planId, userId) {
        const response = await axios.delete(`/api/weekly-plan/${planId}?userId=${userId}`);
        return response.data;
    },

    /**
     * 检查下周是否有计划
     */
    async checkNextWeek(userId, currentPlanId) {
        const response = await axios.get(`/api/weekly-plan/next-week/check?userId=${userId}&currentPlanId=${currentPlanId}`);
        return response.data;
    },

    /**
     * 复制到下周
     */
    async copyToNextWeek(userId, currentPlanId, action) {
        const response = await axios.post(`/api/weekly-plan/copy-to-next-week?userId=${userId}&currentPlanId=${currentPlanId}&action=${action}`);
        return response.data;
    }
};

