import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import ChatInterface from './components/ChatInterface';
import { UserProvider } from './components/UserContext';

function App() {
    return (
        <UserProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/chat" element={<ChatInterface />} />
                    <Route path="/" element={<Navigate to="/login" replace />} />
                </Routes>
            </Router>
        </UserProvider>
    );
}

export default App;
