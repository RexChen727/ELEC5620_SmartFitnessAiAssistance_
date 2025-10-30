import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import FitnessChatInterface from './components/FitnessChatInterface';
import FitAIHomepage from './components/FitAIHomepage';
import AIFitnessPlan from './components/AIFitnessPlan';
import WeeklyPlan from './components/WeeklyPlan';
import TrainingLog from './components/TrainingLog';
import MonthlyReport from './components/MonthlyReport';
import Calendar from './components/Calendar';
import MainLayout from './components/MainLayout';
import { UserProvider } from './components/UserContext';

function App() {
    return (
        <UserProvider>
            <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/" element={<MainLayout />}>
                        <Route index element={<Navigate to="/home" replace />} />
                        <Route path="home" element={<FitAIHomepage />} />
                        {/* Remove /chat actual UI and redirect to /home if visited */}
                        <Route path="chat" element={<Navigate to="/home" replace />} />
                        <Route path="ai-plan" element={<AIFitnessPlan />} />
                        <Route path="weekly-plan" element={<WeeklyPlan />} />
                        <Route path="training-log" element={<TrainingLog />} />
                        <Route path="monthly-report" element={<MonthlyReport />} />
                        <Route path="fitness" element={<FitnessChatInterface />} />
                        <Route path="substitute" element={<FitnessChatInterface />} />
                        <Route path="calendar" element={<Calendar />} />
                    </Route>
                </Routes>
            </Router>
        </UserProvider>
    );
}

export default App;
