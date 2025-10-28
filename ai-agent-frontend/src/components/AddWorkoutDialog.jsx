import React, { useState } from 'react';
import { X } from 'lucide-react';

const AddWorkoutDialog = ({ isOpen, onClose, onSave, currentDay, weeklyPlanId }) => {
    const [workoutName, setWorkoutName] = useState('');
    const [sets, setSets] = useState('');
    const [reps, setReps] = useState('');
    const [weight, setWeight] = useState('');
    const [duration, setDuration] = useState('');
    const [notes, setNotes] = useState('');
    const [saving, setSaving] = useState(false);

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!workoutName.trim()) {
            alert('Workout name is required');
            return;
        }

        setSaving(true);

        const workoutData = {
            planId: weeklyPlanId,
            dayIndex: currentDay,
            workoutName: workoutName.trim(),
            sets: sets ? parseInt(sets) : null,
            reps: reps ? parseInt(reps) : null,
            weight: weight.trim() || null,
            duration: duration.trim() || null,
            notes: notes.trim() || null,
            completed: false
        };

        try {
            await onSave(workoutData);
            // Reset form
            setWorkoutName('');
            setSets('');
            setReps('');
            setWeight('');
            setDuration('');
            setNotes('');
        } catch (error) {
            console.error('Error saving workout:', error);
            alert('Failed to save workout: ' + (error.response?.data?.error || error.message));
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900">Add Workout</h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6">
                    {/* Day Info */}
                    <div className="mb-6 p-3 bg-purple-50 rounded-lg">
                        <p className="text-sm text-purple-600 font-semibold">
                            Adding to: <span className="text-purple-800">{days[currentDay]}</span>
                        </p>
                    </div>

                    {/* Workout Name */}
                    <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Workout Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={workoutName}
                            onChange={(e) => setWorkoutName(e.target.value)}
                            placeholder="e.g., Bench Press, Running, etc."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            required
                            disabled={saving}
                        />
                    </div>

                    {/* Sets & Reps */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Sets
                            </label>
                            <input
                                type="number"
                                value={sets}
                                onChange={(e) => setSets(e.target.value)}
                                placeholder="e.g., 3"
                                min="0"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                disabled={saving}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Reps
                            </label>
                            <input
                                type="number"
                                value={reps}
                                onChange={(e) => setReps(e.target.value)}
                                placeholder="e.g., 10"
                                min="0"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                disabled={saving}
                            />
                        </div>
                    </div>

                    {/* Weight */}
                    <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Weight
                        </label>
                        <input
                            type="text"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            placeholder="e.g., 135 lbs, Bodyweight, etc."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            disabled={saving}
                        />
                    </div>

                    {/* Duration */}
                    <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Duration
                        </label>
                        <input
                            type="text"
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            placeholder="e.g., 45 min, 30 min"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            disabled={saving}
                        />
                    </div>

                    {/* Notes */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Notes
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Additional notes or instructions..."
                            rows="3"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                            disabled={saving}
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={saving}
                            className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:opacity-50 flex items-center justify-center space-x-2"
                        >
                            {saving ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <span>Add Workout</span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddWorkoutDialog;

