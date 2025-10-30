import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useUser } from './UserContext';
import { AlertCircle, CheckCircle2, Edit2 } from 'lucide-react';

const UserProfile = () => {
    const { user } = useUser();
    const [form, setForm] = useState({ age: '', gender: '', heightCm: '', weightKg: '' });
    const [saving, setSaving] = useState(false);
    const [savedAt, setSavedAt] = useState(null);
    const [hasProfile, setHasProfile] = useState(false);
    const [editMode, setEditMode] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [saveError, setSaveError] = useState('');

    useEffect(() => {
        if (!user) return;
        setLoadError('');
        axios.get(`/api/user-profiles/by-user/${user.id}`)
            .then(res => {
                if (res && res.data && Object.keys(res.data).length) {
                    const { age, gender, heightCm, weightKg } = res.data;
                    setForm({
                        age: age ?? '',
                        gender: gender ?? '',
                        heightCm: heightCm ?? '',
                        weightKg: weightKg ?? ''
                    });
                    setHasProfile(true);
                    setEditMode(false);
                } else {
                    setHasProfile(false);
                    setEditMode(true);
                }
            })
            .catch(() => { setLoadError('Failed to load user profile.'); });
    }, [user]);

    const update = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!user) return;
        if (!editMode) { setEditMode(true); return; }
        setSaving(true);
        setSaveError('');
        try {
            const payload = {
                age: form.age ? Number(form.age) : null,
                gender: form.gender || null,
                heightCm: form.heightCm ? Number(form.heightCm) : null,
                weightKg: form.weightKg ? Number(form.weightKg) : null
            };
            await axios.post(`/api/user-profiles/by-user/${user.id}`, payload);
            setSavedAt(new Date());
            setHasProfile(true);
            setEditMode(false);
        } catch (err) {
            setSaveError('Failed to save profile.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className={`${hasProfile ? 'bg-white border-gray-200' : 'bg-red-50 border-red-200'} rounded-xl p-6 shadow-sm border`}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    {hasProfile ? <CheckCircle2 className="text-green-600" size={20} /> : <AlertCircle className="text-red-600" size={20} />}
                    <h3 className="text-xl font-semibold text-gray-900">User Profile</h3>
                </div>
                {!editMode && (
                    <button type="button" onClick={()=>setEditMode(true)} className="flex items-center gap-1 text-sm text-purple-700 hover:text-purple-800">
                        <Edit2 size={16} /> Adjust Profile
                    </button>
                )}
            </div>

            {loadError && <div className="mb-3 text-sm text-red-600">{loadError}</div>}
            {saveError && <div className="mb-3 text-sm text-red-600">{saveError}</div>}

            <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm text-gray-600 mb-1">Age</label>
                    <input type="number" min="0" value={form.age} onChange={e=>update('age', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" disabled={!editMode} />
                </div>
                <div>
                    <label className="block text-sm text-gray-600 mb-1">Gender</label>
                    <select value={form.gender} onChange={e=>update('gender', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" disabled={!editMode}>
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm text-gray-600 mb-1">Height (cm)</label>
                    <input type="number" min="0" step="0.1" value={form.heightCm} onChange={e=>update('heightCm', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" disabled={!editMode} />
                </div>
                <div>
                    <label className="block text-sm text-gray-600 mb-1">Weight (kg)</label>
                    <input type="number" min="0" step="0.1" value={form.weightKg} onChange={e=>update('weightKg', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" disabled={!editMode} />
                </div>
                <div className="md:col-span-2 flex items-center gap-3 mt-2">
                    <button type="submit" disabled={saving} className={`${editMode ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-800 hover:bg-gray-900'} text-white px-4 py-2 rounded-lg disabled:opacity-50`}>
                        {saving ? 'Saving...' : (editMode ? 'Save Profile' : 'Adjust Profile')}
                    </button>
                    {savedAt && <span className="text-xs text-gray-500">Saved at {savedAt.toLocaleTimeString()}</span>}
                    {!hasProfile && <span className="text-xs text-red-600">Please complete your profile to unlock better recommendations.</span>}
                </div>
            </form>
        </div>
    );
};

export default UserProfile;


