import React, { useState, useEffect } from 'react';
import { Calendar, Dumbbell, Clock, Edit3, Plus, CheckCircle, Star, ArrowRight, BarChart3, MessageCircle, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from './UserContext';
import AddWorkoutDialog from './AddWorkoutDialog';
import EditWorkoutDialog from './EditWorkoutDialog';

const WeeklyPlan = () => {
    const navigate = useNavigate();
    const { user } = useUser();
    const [selectedDay, setSelectedDay] = useState(0);
    const [weeklyPlan, setWeeklyPlan] = useState(null);
    const [allPlans, setAllPlans] = useState([]);
    const [selectedPlanIndex, setSelectedPlanIndex] = useState(null);
    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [workoutsByDay, setWorkoutsByDay] = useState({});
    const [showCopyDialog, setShowCopyDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showAddWorkoutDialog, setShowAddWorkoutDialog] = useState(false);
    const [showEditWorkoutDialog, setShowEditWorkoutDialog] = useState(false);
    const [selectedWorkout, setSelectedWorkout] = useState(null);

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    // Load all weekly plans
    useEffect(() => {
        if (user) {
            loadAllPlans();
        }
    }, [user]);

    // Load selected plan when index changes
    useEffect(() => {
        if (allPlans.length > 0 && selectedPlanIndex !== null && allPlans[selectedPlanIndex]) {
            const selectedPlan = allPlans[selectedPlanIndex];
            setWeeklyPlan(selectedPlan);
            setStartDate(selectedPlan.startDate);
            setEndDate(selectedPlan.endDate);
            setWorkoutsByDay(selectedPlan.workoutsByDay || {});
        }
    }, [selectedPlanIndex, allPlans]);

    const loadAllPlans = async () => {
        if (!user) return;
        
        try {
            const response = await axios.get(`/api/weekly-plan/all?userId=${user.id}`);
            console.log('All plans loaded:', response.data);
            setAllPlans(response.data);
            if (response.data.length > 0) {
                // Preserve current selectedPlanIndex if within bounds, otherwise select last (most recent)
                const currentIndex = selectedPlanIndex;
                const targetIndex = (currentIndex !== null && currentIndex >= 0 && currentIndex < response.data.length) 
                    ? currentIndex 
                    : response.data.length - 1;
                setSelectedPlanIndex(targetIndex);
                const targetPlan = response.data[targetIndex];
                setWeeklyPlan(targetPlan);
                setStartDate(targetPlan.startDate);
                setEndDate(targetPlan.endDate);
                setWorkoutsByDay(targetPlan.workoutsByDay || {});
            }
        } catch (error) {
            console.error('Error loading all plans:', error);
        }
    };

    const loadPlanDetails = async (planId) => {
        try {
            const response = await axios.get(`/api/weekly-plan/${planId}`);
            const plan = response.data;
            
            console.log('Plan details loaded:', plan);
            setWeeklyPlan(plan);
            setStartDate(plan.startDate);
            setEndDate(plan.endDate);
            setWorkoutsByDay(plan.workoutsByDay || {});
        } catch (error) {
            console.error('Error loading plan details:', error);
        }
    };

    const handleGenerateClick = async () => {
        if (!user) {
            alert('Please login first');
            return;
        }

        // Check if current week already has a plan
        try {
            const checkResponse = await axios.get(`/api/weekly-plan/check-current-week?userId=${user.id}`);
            const hasPlan = checkResponse.data.hasPlan;
            
            if (hasPlan) {
                alert('Current week already has a plan. Please delete it before generating a new one.');
                return;
            }
            
            // No plan exists, generate directly
            await generateAIPlan();
        } catch (error) {
            console.error('Error checking current week plan:', error);
            alert('Failed to check current week plan');
        }
    };

    const generateAIPlan = async () => {
        if (!user) return;

        setLoading(true);
        try {
            const response = await axios.post(`/api/weekly-plan/generate?userId=${user.id}`);
            const plan = response.data;
            
            console.log('Generated plan:', plan);
            
            // Reload all plans
            await loadAllPlans();
            
            alert('Weekly plan generated successfully!');
        } catch (error) {
            console.error('Error generating plan:', error);
            alert('Failed to generate weekly plan: ' + (error.response?.data?.error || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleCopyToNextWeek = async () => {
        if (!weeklyPlan || !user) {
            alert('No weekly plan to copy');
            return;
        }

        // Check if there are incomplete workouts
        const incompleteCount = Object.values(workoutsByDay)
            .flat()
            .filter(w => !w.completed).length;

        if (incompleteCount === 0) {
            alert('No incomplete workouts to copy');
            return;
        }

        // Check if next week already has a plan
        try {
            const checkResponse = await axios.get(
                `/api/weekly-plan/next-week/check?userId=${user.id}&currentPlanId=${weeklyPlan.id}`
            );
            
            const hasNextWeekPlan = checkResponse.data.hasPlan;
            
            if (hasNextWeekPlan) {
                // Next week has a plan, show merge options
                setShowCopyDialog(true);
            } else {
                // Next week doesn't have a plan, just copy directly
                await executeCopyAction('overwrite');
            }
        } catch (error) {
            console.error('Error checking next week plan:', error);
            // If check fails, show the dialog anyway
            setShowCopyDialog(true);
        }
    };

    const executeCopyAction = async (action) => {
        if (!weeklyPlan || !user) return;

        setShowCopyDialog(false);
        setLoading(true);

        try {
            const response = await axios.post(
                `/api/weekly-plan/copy-to-next-week?userId=${user.id}&currentPlanId=${weeklyPlan.id}&action=${action}`
            );

            // Reload all plans to refresh the view
            await loadAllPlans();
            
            // The newly created plan will be at the last index (most recent)
            // loadAllPlans() already sets the correct selectedPlanIndex
            
            const message = action === 'merge' ? 'Workouts merged to next week' :
                          action === 'overwrite' ? 'Plan copied to next week' :
                          'Copy cancelled';
            alert(message);
        } catch (error) {
            console.error('Error copying to next week:', error);
            alert('Failed to copy plan: ' + (error.response?.data?.error || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    const toggleWorkoutComplete = async (workoutId) => {
        try {
            await axios.put(`/api/weekly-plan/workout/${workoutId}/toggle`);
            // Reload all plans to get updated state
            await loadAllPlans();
            // Keep showing the same plan (loadAllPlans preserves selectedPlanIndex)
        } catch (error) {
            console.error('Error toggling workout:', error);
        }
    };

    const handleClearDayClick = async () => {
        if (!weeklyPlan || !user) {
            alert('No weekly plan selected');
            return;
        }

        const dayKey = String(selectedDay);
        if (!workoutsByDay[dayKey] || workoutsByDay[dayKey].length === 0) {
            alert('No workouts to clear for this day');
            return;
        }

        if (!confirm(`Are you sure you want to clear all workouts for ${days[selectedDay]}?`)) {
            return;
        }

        setLoading(true);

        try {
            await axios.delete(`/api/weekly-plan/clear-day?planId=${weeklyPlan.id}&dayIndex=${selectedDay}`);
            // Reload all plans to refresh the view
            await loadAllPlans();
            alert('Day workouts cleared successfully');
        } catch (error) {
            console.error('Error clearing day workouts:', error);
            alert('Failed to clear day workouts: ' + (error.response?.data?.error || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = () => {
        setShowDeleteDialog(true);
    };

    const confirmDelete = async () => {
        if (!weeklyPlan || !user) return;

        setShowDeleteDialog(false);
        setLoading(true);

        try {
            await axios.delete(`/api/weekly-plan/${weeklyPlan.id}`);
            // Reload all plans
            await loadAllPlans();
            alert('Weekly plan deleted successfully');
        } catch (error) {
            console.error('Error deleting plan:', error);
            alert('Failed to delete plan: ' + (error.response?.data?.error || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    const cancelDelete = () => {
        setShowDeleteDialog(false);
    };

    const handleAddWorkout = () => {
        if (!weeklyPlan) {
            alert('Please generate a weekly plan first');
            return;
        }
        setShowAddWorkoutDialog(true);
    };

    const saveWorkout = async (workoutData) => {
        try {
            const response = await axios.post('/api/weekly-plan/add-workout', workoutData);
            console.log('Workout saved:', response.data);
            
            // Reload all plans to refresh the view
            await loadAllPlans();
            
            // Close dialog
            setShowAddWorkoutDialog(false);
            alert('Workout added successfully!');
        } catch (error) {
            console.error('Error saving workout:', error);
            throw error;
        }
    };

    const handleEditWorkout = (workout) => {
        setSelectedWorkout(workout);
        setShowEditWorkoutDialog(true);
    };

    const updateWorkout = async (workoutData) => {
        try {
            const response = await axios.put(`/api/weekly-plan/workout/${workoutData.id}`, workoutData);
            console.log('Workout updated:', response.data);
            
            // Reload all plans to refresh the view
            await loadAllPlans();
            
            // Close dialog
            setShowEditWorkoutDialog(false);
            setSelectedWorkout(null);
            alert('Workout updated successfully!');
        } catch (error) {
            console.error('Error updating workout:', error);
            throw error;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const getWorkoutCount = (dayIndex) => {
        return workoutsByDay[String(dayIndex)]?.length || 0;
    };

    const getWorkoutsForDay = (dayIndex) => {
        return workoutsByDay[String(dayIndex)] || [];
    };

    const hasCompletedWorkout = (dayIndex) => {
        const workouts = getWorkoutsForDay(dayIndex);
        // 只有当该天有训练且所有训练都完成时才返回 true
        if (workouts.length === 0) return false;
        return workouts.every(w => w.completed);
    };

    const navigatePlan = (direction) => {
        if (selectedPlanIndex === null) return;
        const newIndex = selectedPlanIndex + direction;
        if (newIndex >= 0 && newIndex < allPlans.length) {
            setSelectedPlanIndex(newIndex);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation Bar */}
            <nav className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                            <Star className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">FitAI</h1>
                            <p className="text-xs text-gray-500">AI-Powered Training</p>
                        </div>
                    </div>

                    {/* Navigation Items */}
                    <div className="flex items-center space-x-1">
                        <button
                            onClick={() => navigate('/home')}
                            className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                        >
                            <Star size={18} />
                            <span className="text-sm font-medium">Home</span>
                        </button>
                        <button
                            onClick={() => navigate('/ai-plan')}
                            className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                        >
                            <Star size={18} />
                            <span className="text-sm font-medium">AI Fitness Plan</span>
                        </button>
                        <button
                            onClick={() => navigate('/weekly-plan')}
                            className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors bg-purple-100 text-purple-700 border border-purple-200"
                        >
                            <Calendar size={18} />
                            <span className="text-sm font-medium">Weekly Plan</span>
                        </button>
                        <button
                            onClick={() => navigate('/training-log')}
                            className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                        >
                            <Dumbbell size={18} />
                            <span className="text-sm font-medium">Training Log</span>
                        </button>
                        <button
                            onClick={() => navigate('/monthly-report')}
                            className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                        >
                            <BarChart3 size={18} />
                            <span className="text-sm font-medium">Monthly Report</span>
                        </button>
                        <button
                            onClick={() => navigate('/substitute')}
                            className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                        >
                            <Settings size={18} />
                            <span className="text-sm font-medium">Substitute</span>
                        </button>
                    </div>

                    {/* AI Assistant */}
                    <div className="flex items-center space-x-3">
                        <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                            <MessageCircle size={18} />
                            <span className="text-sm font-medium">AI Assistant</span>
                        </button>
                        <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-white">1</span>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-6 py-8">
                {/* Week Overview */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-4">
                            <h2 className="text-2xl font-bold text-gray-900">Weekly Plan</h2>
                            
                            {/* Week Navigation */}
                            {allPlans.length > 1 && selectedPlanIndex !== null && (
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => navigatePlan(1)}
                                        disabled={selectedPlanIndex >= allPlans.length - 1}
                                        className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                    <span className="text-sm text-gray-600">
                                        Week {allPlans.length - selectedPlanIndex} of {allPlans.length}
                                    </span>
                                    <button
                                        onClick={() => navigatePlan(-1)}
                                        disabled={selectedPlanIndex === 0}
                                        className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            )}
                        </div>
                        
                        <div className="flex items-center space-x-4">
                            {weeklyPlan && (
                                <div className="text-sm text-gray-600">
                                    <span className="font-semibold">Week of:</span> {formatDate(startDate)} - {formatDate(endDate)}
                                </div>
                            )}
                            <button 
                                onClick={handleClearDayClick}
                                disabled={!weeklyPlan || workoutsByDay[String(selectedDay)]?.length === 0 || loading}
                                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2 disabled:bg-gray-400"
                            >
                                <Edit3 size={16} />
                                <span>Clear Day's Plan</span>
                            </button>
                        </div>
                    </div>

                    {/* Days Grid */}
                    <div className="grid grid-cols-7 gap-4">
                        {days.map((day, index) => (
                            <button
                                key={index}
                                onClick={() => setSelectedDay(index)}
                                className={`p-4 rounded-lg border-2 transition-all ${
                                    selectedDay === index
                                        ? 'border-purple-500 bg-purple-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                <div className="text-center">
                                    <div className={`text-sm font-medium ${
                                        selectedDay === index ? 'text-purple-700' : 'text-gray-700'
                                    }`}>
                                        {day}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {getWorkoutCount(index)} workouts
                                    </div>
                                    {hasCompletedWorkout(index) && (
                                        <CheckCircle size={16} className="text-green-500 mx-auto mt-2" />
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Selected Day Details */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Workouts List */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-semibold text-gray-900">
                                    {days[selectedDay]} Workouts
                                </h3>
                                <button
                                    onClick={handleAddWorkout}
                                    disabled={!weeklyPlan}
                                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:bg-gray-400"
                                >
                                    <Plus size={16} />
                                    <span>Add Workout</span>
                                </button>
                            </div>

                            {getWorkoutsForDay(selectedDay).length > 0 ? (
                                <div className="space-y-4">
                                    {getWorkoutsForDay(selectedDay).map((workout) => (
                                        <div
                                            key={workout.id}
                                            className={`p-4 rounded-lg border-2 transition-all ${
                                                workout.completed
                                                    ? 'border-green-200 bg-green-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <Dumbbell size={20} className="text-gray-600" />
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900">{workout.workoutName}</h4>
                                                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                                                            {workout.sets && workout.reps && (
                                                                <span>{workout.sets} sets × {workout.reps} reps</span>
                                                            )}
                                                            {workout.weight && <span>{workout.weight}</span>}
                                                            {workout.duration && (
                                                                <span className="flex items-center space-x-1">
                                                                    <Clock size={14} />
                                                                    <span>{workout.duration}</span>
                                                                </span>
                                                            )}
                                                        </div>
                                                        {workout.notes && (
                                                            <p className="text-xs text-gray-500 mt-1">{workout.notes}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => toggleWorkoutComplete(workout.id)}
                                                        className={`p-2 rounded-lg transition-colors ${
                                                            workout.completed
                                                                ? 'bg-green-100 text-green-600'
                                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                        }`}
                                                    >
                                                        <CheckCircle size={20} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleEditWorkout(workout)}
                                                        className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                                                    >
                                                        <Edit3 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Dumbbell size={48} className="text-gray-300 mx-auto mb-4" />
                                    <h4 className="text-lg font-semibold text-gray-600 mb-2">No workouts scheduled</h4>
                                    <p className="text-gray-500 mb-4">Click "Generate AI Plan" to create your weekly training schedule</p>
                                    {!weeklyPlan && (
                                        <button
                                            onClick={handleGenerateClick}
                                            disabled={loading}
                                            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2 mx-auto disabled:bg-gray-400"
                                        >
                                            {loading ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                    <span>Generating...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Calendar size={16} />
                                                    <span>Generate AI Plan</span>
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="space-y-6">
                        {/* Progress */}
                        {weeklyPlan && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Progress</h3>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-600">Completed Workouts</span>
                                            <span className="font-semibold">
                                                {Object.values(workoutsByDay)
                                                    .flat()
                                                    .filter(w => w.completed).length}/{Object.values(workoutsByDay).flat().length}
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div 
                                                className="bg-green-500 h-2 rounded-full" 
                                                style={{ 
                                                    width: `${(Object.values(workoutsByDay).flat().filter(w => w.completed).length / Math.max(Object.values(workoutsByDay).flat().length, 1)) * 100}%` 
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-gray-600">Training Days</span>
                                            <span className="font-semibold">
                                                {Object.keys(workoutsByDay).length}/7
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div 
                                                className="bg-blue-500 h-2 rounded-full" 
                                                style={{ 
                                                    width: `${(Object.keys(workoutsByDay).length / 7) * 100}%` 
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Quick Actions */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                            <div className="space-y-3">
                                <button 
                                    onClick={handleGenerateClick}
                                    disabled={loading}
                                    className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center space-x-3 disabled:bg-gray-100"
                                >
                                    <Calendar size={16} className="text-blue-600" />
                                    <span className="text-sm font-medium">Generate AI Plan</span>
                                </button>
                                <button 
                                    onClick={handleCopyToNextWeek}
                                    disabled={loading}
                                    className="w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors flex items-center space-x-3 disabled:bg-gray-100"
                                >
                                    <ArrowRight size={16} className="text-green-600" />
                                    <span className="text-sm font-medium">Copy to Next Week</span>
                                </button>
                                <button 
                                    onClick={handleDeleteClick}
                                    disabled={!weeklyPlan || loading}
                                    className="w-full text-left p-3 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center space-x-3 disabled:bg-gray-100"
                                >
                                    <Edit3 size={16} className="text-red-600" />
                                    <span className="text-sm font-medium">Delete Current Weekly Plan</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Copy to Next Week Dialog */}
            {showCopyDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Copy to Next Week</h3>
                        <p className="text-gray-600 mb-6">
                            You have incomplete workouts to copy. If next week already has a plan, choose an action:
                        </p>
                        <div className="space-y-3">
                            <button
                                onClick={() => executeCopyAction('merge')}
                                className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Merge Plans
                            </button>
                            <button
                                onClick={() => executeCopyAction('overwrite')}
                                className="w-full p-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                            >
                                Overwrite Next Week
                            </button>
                            <button
                                onClick={() => executeCopyAction('cancel')}
                                className="w-full p-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            {showDeleteDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Delete Weekly Plan?</h3>
                        <p className="text-gray-600 mb-2">
                            Are you sure you want to delete this weekly plan?
                        </p>
                        <p className="text-gray-600 mb-6">
                            This action cannot be undone. Other weekly plans will not be affected.
                        </p>
                        <div className="space-y-3">
                            <button
                                onClick={confirmDelete}
                                className="w-full p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Yes, Delete
                            </button>
                            <button
                                onClick={cancelDelete}
                                className="w-full p-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Workout Dialog */}
            {showAddWorkoutDialog && (
                <AddWorkoutDialog
                    isOpen={showAddWorkoutDialog}
                    onClose={() => setShowAddWorkoutDialog(false)}
                    onSave={saveWorkout}
                    currentDay={selectedDay}
                    weeklyPlanId={weeklyPlan?.id}
                />
            )}

            {/* Edit Workout Dialog */}
            {showEditWorkoutDialog && selectedWorkout && (
                <EditWorkoutDialog
                    isOpen={showEditWorkoutDialog}
                    onClose={() => {
                        setShowEditWorkoutDialog(false);
                        setSelectedWorkout(null);
                    }}
                    onSave={updateWorkout}
                    workout={selectedWorkout}
                    currentDay={selectedDay}
                    weeklyPlanId={weeklyPlan?.id}
                />
            )}
        </div>
    );
};

export default WeeklyPlan;