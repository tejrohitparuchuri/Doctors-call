import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import '../styles/login.css'; // Reuse login styles

const Register = () => {
    const navigate = useNavigate();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [type, setType] = useState('user'); // 'user' or 'admin'
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!fullName || !email || !password || !phone) {
            setError('Please complete all registration fields');
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/user/register', {
                fullName,
                email,
                password,
                phone,
                type
            });
            if (response.data.success) {
                navigate('/login');
            } else {
                setError(response.data.message || 'Registration failed');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
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
                    <Link to="/login" style={{ color: '#fff', textDecoration: 'none', marginRight: '20px', fontWeight: 'bold' }}>Login</Link>
                    <Link to="/register" style={{ color: '#ef4444', textDecoration: 'none', fontWeight: 'bold' }}>Register</Link>
                </nav>
            </header>

            <div className="login-wrapper" style={{ marginTop: '80px' }}>
                <div className="brand-section">
                    <div className="logo-group">
                        <div className="logo-icon">D</div>
                        <div className="logo-text">Doctors' Call</div>
                    </div>

                    <div className="brand-details">
                        <h1>Create an Account</h1>
                        <p>Join the healthcare network. Register as a patient to schedule consultations, or apply as a provider to host tele-presence sessions.</p>
                    </div>

                    <div className="brand-footer">
                        &copy; 2026 PTR MEDICAL SYSTEMS. ALL RIGHTS RESERVED.
                    </div>
                </div>

                <div className="form-section">
                    <div>
                        <div className="form-header">
                            <h2>User Registration</h2>
                            <p>Register credentials to initialize clinical alignment</p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="input-group" style={{ marginBottom: '15px' }}>
                                <label htmlFor="fullName">Full Name</label>
                                <div className="input-wrapper">
                                    <input 
                                        type="text" 
                                        id="fullName" 
                                        required 
                                        placeholder="John Doe"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="input-group" style={{ marginBottom: '15px' }}>
                                <label htmlFor="email">Email Address</label>
                                <div className="input-wrapper">
                                    <input 
                                        type="email" 
                                        id="email" 
                                        required 
                                        placeholder="johndoe@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="input-group" style={{ marginBottom: '15px' }}>
                                <label htmlFor="password">Password</label>
                                <div className="input-wrapper">
                                    <input 
                                        type="password" 
                                        id="password" 
                                        required 
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="input-group" style={{ marginBottom: '15px' }}>
                                <label htmlFor="phone">Phone Number</label>
                                <div className="input-wrapper">
                                    <input 
                                        type="text" 
                                        id="phone" 
                                        required 
                                        placeholder="9998887776"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="input-group" style={{ marginBottom: '15px' }}>
                                <label htmlFor="type">Account Role</label>
                                <div className="input-wrapper">
                                    <select 
                                        id="type" 
                                        required 
                                        value={type} 
                                        onChange={(e) => setType(e.target.value)}
                                    >
                                        <option value="user" style={{ background: '#1c1c1e' }}>User (Patient)</option>
                                        <option value="admin" style={{ background: '#1c1c1e' }}>Admin</option>
                                    </select>
                                </div>
                                <div className={`error-message ${error ? 'visible' : ''}`}>{error}</div>
                            </div>

                            <button type="submit" className="btn-submit" disabled={loading}>
                                <span>REGISTER</span>
                                {loading && <div className="loader" style={{ display: 'block' }}></div>}
                            </button>

                            <div className="toggle-link">
                                Already have an account? <Link to="/login">Login</Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
