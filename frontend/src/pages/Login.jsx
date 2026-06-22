import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import '../styles/login.css';

const Login = () => {
    const navigate = useNavigate();
    
    // Login form fields
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Radial mouse glow animation
    const glowRef = useRef({ targetX: window.innerWidth / 2, targetY: window.innerHeight / 2, currentX: window.innerWidth / 2, currentY: window.innerHeight / 2 });

    useEffect(() => {
        const handleMouseMove = (e) => {
            glowRef.current.targetX = e.clientX;
            glowRef.current.targetY = e.clientY;
        };

        window.addEventListener('mousemove', handleMouseMove);

        let animationId;
        const animateGlow = () => {
            const glow = glowRef.current;
            glow.currentX += (glow.targetX - glow.currentX) * 0.08;
            glow.currentY += (glow.targetY - glow.currentY) * 0.08;
            document.documentElement.style.setProperty('--mouse-x', `${glow.currentX}px`);
            document.documentElement.style.setProperty('--mouse-y', `${glow.currentY}px`);
            animationId = requestAnimationFrame(animateGlow);
        };

        animateGlow();

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationId);
        };
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('Please complete all credential fields');
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/user/login', { email, password });
            if (response.data.success) {
                // Store user details in localStorage
                localStorage.setItem('userInfo', JSON.stringify(response.data));
                
                const userType = response.data.userData.type || response.data.userData.role;
                if (userType === 'admin') {
                    navigate('/adminhome');
                } else if (response.data.userData.isdoctor) {
                    navigate('/doctorhome');
                } else {
                    navigate('/userhome');
                }
            } else {
                setError(response.data.message || 'Login authentication failed');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid email or password access key');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page-body">
            <header className="app-header" style={{ position: 'absolute', top: 0, left: 0, right: 0, background: 'transparent', backdropFilter: 'none', borderBottom: 'none' }}>
                <div className="logo-group">
                    <div className="logo-icon">D</div>
                    <div className="logo-text" style={{ color: '#fff' }}>Doctors' Call</div>
                </div>
                <nav>
                    <Link to="/" style={{ color: '#fff', textDecoration: 'none', marginRight: '20px', fontWeight: 'bold' }}>Home</Link>
                    <Link to="/login" style={{ color: '#ef4444', textDecoration: 'none', marginRight: '20px', fontWeight: 'bold' }}>Login</Link>
                    <Link to="/register" style={{ color: '#fff', textDecoration: 'none', fontWeight: 'bold' }}>Register</Link>
                </nav>
            </header>

            <div className="login-wrapper" style={{ marginTop: '80px' }}>
                <div className="brand-section">
                    <div className="logo-group">
                        <div className="logo-icon">D</div>
                        <div className="logo-text">Doctors' Call</div>
                    </div>

                    <div className="brand-details">
                        <h1>Secure Login Portal</h1>
                        <p>Authenticate your credentials to access appointments, patient lists, approvals, and clinical communication history.</p>
                    </div>

                    <div className="brand-footer">
                        &copy; 2026 PTR MEDICAL SYSTEMS. ALL RIGHTS RESERVED.
                    </div>
                </div>

                <div className="form-section">
                    <div id="loginView">
                        <div className="form-header">
                            <h2>Diagnostic Login</h2>
                            <p>Provide medical credentials to link scanning lens</p>
                        </div>

                        <form id="loginForm" onSubmit={handleLogin}>
                            <div className="input-group">
                                <label htmlFor="email">Clinician ID / Email</label>
                                <div className="input-wrapper">
                                    <input 
                                        type="email" 
                                        id="email" 
                                        required 
                                        autoComplete="username"
                                        placeholder="johndoe@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="input-group">
                                <label htmlFor="password">Security Access Key</label>
                                <div className="input-wrapper">
                                    <input 
                                        type="password" 
                                        id="password" 
                                        required 
                                        autoComplete="current-password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                                <div className={`error-message ${error ? 'visible' : ''}`}>{error}</div>
                            </div>

                            <button type="submit" className="btn-submit" disabled={loading}>
                                <span>LOGIN</span>
                                {loading && <div className="loader" style={{ display: 'block' }}></div>}
                            </button>

                            <div className="toggle-link">
                                Don't have an account? <Link to="/register">Create Account</Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
