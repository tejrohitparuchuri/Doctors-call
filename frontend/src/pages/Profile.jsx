import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import '../styles/profile.css';

const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/auth/profile');
                setUser(res.data);
            } catch (err) {
                console.error('Failed to fetch user profile:', err);
                // Redirect to login if token invalid
                localStorage.removeItem('userInfo');
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="profile-page-body" style={{ justifyContent: 'center', alignItems: 'center', display: 'flex' }}>
                <h3>Loading clinician profile...</h3>
            </div>
        );
    }

    if (!user) return null;

    // Get initials for profile avatar
    const initials = user.email.substring(0, 2).toUpperCase();

    return (
        <div className="profile-page-body">
            <header className="app-header">
                <div className="logo-group">
                    <div className="logo-icon" style={{ width: '28px', height: '28px', background: 'var(--accent-red)', borderRadius: '6px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 700, color: '#ffffff' }}>D</div>
                    <div className="logo-text">Doctors' Call</div>
                </div>
                <nav>
                    <Link to="/scanner">Precision Anatomy Portal</Link>
                    <Link to="/hub">Doctors' Hub</Link>
                    <Link to="/session">Session</Link>
                    <Link to="/profile" className="active">Profile</Link>
                    <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }}>Logout</a>
                </nav>
            </header>

            <div className="profile-container">
                {/* Profile Details Panel (Left) */}
                <div className="profile-details-card">
                    <div className="profile-header">
                        <div className="profile-avatar">{initials}</div>
                        <div className="profile-title">
                            <h2>Clinician Diagnostic Profile</h2>
                            <p>Authorized access matrix credentials</p>
                        </div>
                    </div>

                    <div className="profile-grid">
                        <div className="grid-item">
                            <div className="grid-item-label">Account ID / Email</div>
                            <div className="grid-item-value">{user.email}</div>
                        </div>
                        <div className="grid-item">
                            <div className="grid-item-label">Insurance ID</div>
                            <div className="grid-item-value">{user.insuranceId || 'None Registered'}</div>
                        </div>
                        <div className="grid-item">
                            <div className="grid-item-label">Age</div>
                            <div className="grid-item-value">{user.age || '—'} years</div>
                        </div>
                        <div className="grid-item">
                            <div className="grid-item-label">Gender</div>
                            <div className="grid-item-value" style={{ textTransform: 'capitalize' }}>{user.gender || '—'}</div>
                        </div>
                        <div className="grid-item">
                            <div className="grid-item-label">Blood Group</div>
                            <div className="grid-item-value">{user.bloodGroup || '—'}</div>
                        </div>
                        <div className="grid-item">
                            <div className="grid-item-label">Reported Health Condition</div>
                            <div className="grid-item-value">{user.healthCondition || 'None'}</div>
                        </div>
                    </div>

                    <div className="saved-parts-section">
                        <h3>Saved Telemetry Anatomy</h3>
                        {user.savedParts && user.savedParts.length > 0 ? (
                            <div className="parts-list">
                                {user.savedParts.map(part => (
                                    <span key={part} className="part-pill">{part}</span>
                                ))}
                            </div>
                        ) : (
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No anatomical matrix segments saved yet.</p>
                        )}
                    </div>
                </div>

                {/* Dashboard Nav Actions Panel (Right) */}
                <div className="profile-nav-actions">
                    <div className="nav-button-card" onClick={() => navigate('/hub')}>
                        <div className="nav-card-icon">🏥</div>
                        <div className="nav-card-title">Hire Doctor Marketplace</div>
                        <div className="nav-card-desc">Search, filter, and book online/offline consultation matrices with medical specialists.</div>
                    </div>

                    <div className="nav-button-card" onClick={() => navigate('/scanner')}>
                        <div className="nav-card-icon">⚡</div>
                        <div className="nav-card-title">Precision Anatomy Scanner</div>
                        <div className="nav-card-desc">Scan myofibrils, skeletal arrays, and visceral organs to extract real-time diagnostic telemetry.</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
