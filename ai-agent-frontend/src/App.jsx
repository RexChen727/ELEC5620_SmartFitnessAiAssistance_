import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import ChatInterface from './components/ChatInterface';
import Calendar from './components/Calendar';
import TrainingLog from './components/TrainingLog';
import MainLayout from './components/MainLayout';
import { UserProvider } from './components/UserContext';

function App() {
    return (
        <UserProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/" element={<MainLayout />}>
                        <Route index element={<Navigate to="/chat" replace />} />
                        <Route path="chat" element={<ChatInterface />} />
                        <Route path="calendar" element={<Calendar />} />
                        <Route path="training-log" element={<TrainingLog />} />
                    </Route>
                </Routes>
            </Router>
        </UserProvider>
    );
}

export default App;
