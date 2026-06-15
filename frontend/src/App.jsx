import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Scanner from './pages/Scanner';
import DoctorsHub from './pages/DoctorsHub';
import Purchase from './pages/Purchase';
import Call from './pages/Call';
import Profile from './pages/Profile';
import Session from './pages/Session';

// Protected Route Guard
const ProtectedRoute = ({ children }) => {
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

// Public Route Guard (Redirects to profile if already logged in)
const PublicRoute = ({ children }) => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
        return <Navigate to="/profile" replace />;
    }
    return children;
};

function App() {
    return (
        <Router>
            <Routes>
                <Route 
                    path="/login" 
                    element={
                        <PublicRoute>
                            <Login />
                        </PublicRoute>
                    } 
                />
                <Route 
                    path="/scanner" 
                    element={
                        <ProtectedRoute>
                            <Scanner />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/hub" 
                    element={
                        <ProtectedRoute>
                            <DoctorsHub />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/purchase" 
                    element={
                        <ProtectedRoute>
                            <Purchase />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/call" 
                    element={
                        <ProtectedRoute>
                            <Call />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/profile" 
                    element={
                        <ProtectedRoute>
                            <Profile />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/session" 
                    element={
                        <ProtectedRoute>
                            <Session />
                        </ProtectedRoute>
                    } 
                />
                {/* Fallback routing */}
                <Route 
                    path="*" 
                    element={
                        localStorage.getItem('userInfo') ? (
                            <Navigate to="/profile" replace />
                        ) : (
                            <Navigate to="/login" replace />
                        )
                    } 
                />
            </Routes>
        </Router>
    );
}

export default App;
