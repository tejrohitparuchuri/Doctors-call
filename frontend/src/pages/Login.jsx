import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/login.css';

const Login = () => {
    const navigate = useNavigate();
    const [isLoginView, setIsLoginView] = useState(true);
    
    // Login form fields
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [loginLoading, setLoginLoading] = useState(false);

    // Signup form fields
    const [signupEmail, setSignupEmail] = useState('');
    const [signupPassword, setSignupPassword] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('');
    const [bloodGroup, setBloodGroup] = useState('');
    const [healthCondition, setHealthCondition] = useState('');
    const [insuranceId, setInsuranceId] = useState('');
    const [signupError, setSignupError] = useState('');
    const [signupLoading, setSignupLoading] = useState(false);

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
        setLoginError('');

        if (!loginEmail || !loginPassword) {
            setLoginError('Please complete all authorization fields');
            return;
        }

        setLoginLoading(true);
        try {
            const response = await api.post('/auth/login', { email: loginEmail, password: loginPassword });
            localStorage.setItem('userInfo', JSON.stringify(response.data));
            navigate('/profile');
        } catch (error) {
            setLoginError(error.response?.data?.message || 'Invalid clinician authorization key');
        } finally {
            setLoginLoading(false);
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setSignupError('');

        if (!signupEmail || !signupPassword || !age || !gender || !bloodGroup || !healthCondition || !insuranceId) {
            setSignupError('Please fill out all registration fields');
            return;
        }

        setSignupLoading(true);
        try {
            const response = await api.post('/auth/register', {
                email: signupEmail,
                password: signupPassword,
                age: Number(age),
                gender,
                bloodGroup,
                healthCondition,
                insuranceId
            });
            localStorage.setItem('userInfo', JSON.stringify(response.data));
            navigate('/profile');
        } catch (error) {
            setSignupError(error.response?.data?.message || 'Registration failed');
        } finally {
            setSignupLoading(false);
        }
    };

    return (
        <div className="login-page-body">
            <div className="login-wrapper">
                <div className="brand-section">
                    <div className="logo-group">
                        <div className="logo-icon">D</div>
                        <div className="logo-text">Doctors' Call</div>
                    </div>

                    <div className="brand-details">
                        <h1>Precision Anatomy Telemetry Portal</h1>
                        <p>Access high-fidelity sub-surface skeletal, myofibril, and splanchnic visceral telemetry arrays.
                            Real-time medical matrix alignment controls.</p>
                    </div>

                    <div className="brand-footer">
                        &copy; 2026 <a href="https://github.com/tejrohitparuchuri" target="_blank" rel="noopener noreferrer" style={{ color: '#ef4444', textDecoration: 'none' }}>PTR</a> MEDICAL SYSTEMS. ALL RIGHTS RESERVED.
                    </div>
                </div>

                <div className="form-section">
                    {isLoginView ? (
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
                                            placeholder="clinician@aesculapius.med"
                                            value={loginEmail}
                                            onChange={(e) => setLoginEmail(e.target.value)}
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
                                            value={loginPassword}
                                            onChange={(e) => setLoginPassword(e.target.value)}
                                        />
                                    </div>
                                    <div className={`error-message ${loginError ? 'visible' : ''}`}>{loginError}</div>
                                </div>

                                <button type="submit" className="btn-submit" disabled={loginLoading}>
                                    <span>LOGIN</span>
                                    {loginLoading && <div className="loader" style={{ display: 'block' }}></div>}
                                </button>

                                <div className="toggle-link">
                                    Don't have an account? <a href="#" onClick={(e) => { e.preventDefault(); setIsLoginView(false); }}>Create Account</a>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div id="signupView">
                            <div className="form-header">
                                <h2>Create Account</h2>
                                <p>Register diagnostic profile credentials</p>
                            </div>

                            <form id="signupForm" onSubmit={handleSignup}>
                                <div className="input-group" style={{ marginBottom: '15px' }}>
                                    <label htmlFor="signupEmail">Email Address</label>
                                    <div className="input-wrapper">
                                        <input 
                                            type="email" 
                                            id="signupEmail" 
                                            required 
                                            placeholder="clinician@aesculapius.med"
                                            value={signupEmail}
                                            onChange={(e) => setSignupEmail(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="input-group" style={{ marginBottom: '15px' }}>
                                    <label htmlFor="signupPassword">Access Key</label>
                                    <div className="input-wrapper">
                                        <input 
                                            type="password" 
                                            id="signupPassword" 
                                            required 
                                            placeholder="••••••••"
                                            value={signupPassword}
                                            onChange={(e) => setSignupPassword(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="input-row" style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                                    <div className="input-group" style={{ flex: 0.9, marginBottom: 0 }}>
                                        <label htmlFor="age">Age</label>
                                        <div className="input-wrapper">
                                            <input 
                                                type="number" 
                                                id="age" 
                                                required 
                                                min="18" 
                                                max="120" 
                                                placeholder="35"
                                                value={age}
                                                onChange={(e) => setAge(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="input-group" style={{ flex: 1.1, marginBottom: 0 }}>
                                        <label htmlFor="gender">Gender</label>
                                        <div className="input-wrapper">
                                            <select id="gender" required value={gender} onChange={(e) => setGender(e.target.value)}>
                                                <option value="" disabled hidden>Select</option>
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="input-group" style={{ flex: 1.1, marginBottom: 0 }}>
                                        <label htmlFor="bloodGroup">Blood Group</label>
                                        <div className="input-wrapper">
                                            <select id="bloodGroup" required value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)}>
                                                <option value="" disabled hidden>Select</option>
                                                <option value="A+">A+</option>
                                                <option value="A-">A-</option>
                                                <option value="B+">B+</option>
                                                <option value="B-">B-</option>
                                                <option value="O+">O+</option>
                                                <option value="O-">O-</option>
                                                <option value="AB+">AB+</option>
                                                <option value="AB-">AB-</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="input-group" style={{ marginBottom: '15px' }}>
                                    <label htmlFor="healthCondition">Health Condition</label>
                                    <div className="input-wrapper">
                                        <input 
                                            type="text" 
                                            id="healthCondition" 
                                            required 
                                            placeholder="e.g. None, Hypertension, Diabetes"
                                            value={healthCondition}
                                            onChange={(e) => setHealthCondition(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="input-group" style={{ marginBottom: '15px' }}>
                                    <label htmlFor="insuranceId">Insurance ID</label>
                                    <div className="input-wrapper">
                                        <input 
                                            type="text" 
                                            id="insuranceId" 
                                            required 
                                            placeholder="e.g. INS-8839-42"
                                            value={insuranceId}
                                            onChange={(e) => setInsuranceId(e.target.value)}
                                        />
                                    </div>
                                    <div className={`error-message ${signupError ? 'visible' : ''}`}>{signupError}</div>
                                </div>

                                <button type="submit" className="btn-submit" disabled={signupLoading}>
                                    <span>CREATE ACCOUNT</span>
                                    {signupLoading && <div className="loader" style={{ display: 'block' }}></div>}
                                </button>

                                <div className="toggle-link">
                                    Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); setIsLoginView(true); }}>Login</a>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Login;
