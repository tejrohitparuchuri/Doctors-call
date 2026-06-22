import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import UserHome from './pages/UserHome';
import AdminHome from './pages/AdminHome';
import DoctorHome from './pages/DoctorHome';

// Protected Route Guard
const ProtectedRoute = ({ children, allowedRoles }) => {
    const info = localStorage.getItem('userInfo');
    if (!info) {
        return <Navigate to="/login" replace />;
    }
    
    try {
        const parsed = JSON.parse(info);
        const userType = parsed.userData?.type || parsed.userData?.role;
        const isDoc = parsed.userData?.isdoctor;

        if (allowedRoles) {
            if (allowedRoles.includes('admin') && userType === 'admin') {
                return children;
            }
            if (allowedRoles.includes('doctor') && isDoc) {
                return children;
            }
            if (allowedRoles.includes('user') && userType === 'user' && !isDoc) {
                return children;
            }
            // Fallback redirect
            return <Navigate to="/" replace />;
        }
    } catch (e) {
        localStorage.removeItem('userInfo');
        return <Navigate to="/login" replace />;
    }
    
    return children;
};

// Public Route Guard (Redirects to dashboard if already logged in)
const PublicRoute = ({ children }) => {
    const info = localStorage.getItem('userInfo');
    if (info) {
        try {
            const parsed = JSON.parse(info);
            const userType = parsed.userData?.type || parsed.userData?.role;
            const isDoc = parsed.userData?.isdoctor;

            if (userType === 'admin') {
                return <Navigate to="/adminhome" replace />;
            } else if (isDoc) {
                return <Navigate to="/doctorhome" replace />;
            } else {
                return <Navigate to="/userhome" replace />;
            }
        } catch (e) {
            localStorage.removeItem('userInfo');
        }
    }
    return children;
};

function App() {
    return (
        <Router>
            <Routes>
                <Route 
                    path="/" 
                    element={
                        <PublicRoute>
                            <Home />
                        </PublicRoute>
                    } 
                />
                <Route 
                    path="/login" 
                    element={
                        <PublicRoute>
                            <Login />
                        </PublicRoute>
                    } 
                />
                <Route 
                    path="/register" 
                    element={
                        <PublicRoute>
                            <Register />
                        </PublicRoute>
                    } 
                />
                <Route 
                    path="/userhome" 
                    element={
                        <ProtectedRoute allowedRoles={['user', 'doctor']}>
                            <UserHome />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/doctorhome" 
                    element={
                        <ProtectedRoute allowedRoles={['doctor']}>
                            <DoctorHome />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/adminhome" 
                    element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AdminHome />
                        </ProtectedRoute>
                    } 
                />
                
                {/* Fallback Routing */}
                <Route 
                    path="*" 
                    element={
                        localStorage.getItem('userInfo') ? (
                            <PublicRoute><div>Redirecting...</div></PublicRoute>
                        ) : (
                            <Navigate to="/" replace />
                        )
                    } 
                />
            </Routes>
        </Router>
    );
}

export default App;
