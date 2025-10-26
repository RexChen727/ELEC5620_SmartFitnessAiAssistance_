import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import ChatInterface from './components/ChatInterface';
import FitnessChatInterface from './components/FitnessChatInterface';
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
                        <Route index element={<Navigate to="/chat" replace />} />
                        <Route path="chat" element={<ChatInterface />} />
                        <Route path="fitness" element={<FitnessChatInterface />} />
                        <Route path="calendar" element={<Calendar />} />
                    </Route>
                </Routes>
            </Router>
        </UserProvider>
    );
}

export default App;
