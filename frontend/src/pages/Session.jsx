import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/session.css';

const Session = () => {
    const navigate = useNavigate();
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Fetch user appointments/sessions
    const fetchSessions = async () => {
        try {
            const res = await api.get('/appointments/my');
            // Filter active sessions: 
            // 1. Pending admin approval
            // 2. Approved but unpaid
            // 3. Paid (confirmed), not expired, and calls remaining > 0
            const active = res.data.filter(s => {
                if (s.status === 'pending' || s.status === 'approved') {
                    return true;
                }
                if (s.status === 'confirmed') {
                    const expires = new Date(s.expiresAt);
                    const hasCalls = s.callsRemaining > 0;
                    return expires > new Date() && hasCalls;
                }
                return false;
            });
            setSessions(active);
        } catch (err) {
            console.error('Failed to fetch sessions', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSessions();

        // Update current time every minute to refresh countdowns
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);

        return () => clearInterval(timer);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        navigate('/login');
    };

    const handleActionClick = async (session) => {
        if (session.status === 'approved') {
            // Redirect to purchase/checkout for this specific appointment
            navigate('/purchase', { 
                state: { 
                    appointmentId: session._id, 
                    doctor: session.doctorId 
                } 
            });
            return;
        }

        if (session.consultationType === 'online') {
            try {
                // Decrement the calls remaining via the backend endpoint
                await api.post(`/appointments/${session._id}/use-call`);
                // Navigate to the video call session
                navigate('/call', { 
                    state: { 
                        doctor: session.doctorId, 
                        consultationType: 'online' 
                    } 
                });
            } catch (err) {
                alert(err.response?.data?.message || 'Failed to initiate video call.');
                fetchSessions(); // Refresh to reflect correct state
            }
        } else {
            try {
                await api.post(`/appointments/${session._id}/use-call`);
                navigate('/call', { 
                    state: { 
                        doctor: session.doctorId, 
                        consultationType: 'offline' 
                    } 
                });
            } catch (err) {
                alert(err.response?.data?.message || 'Failed to open location navigation.');
                fetchSessions();
            }
        }
    };

    // Calculate time remaining in hours and minutes
    const getTimeRemainingText = (session) => {
        if (session.status === 'pending') {
            return 'Awaiting Approval';
        }
        if (session.status === 'approved') {
            return 'Awaiting Payment';
        }
        const expiry = new Date(session.expiresAt);
        const diffMs = expiry - currentTime;
        if (diffMs <= 0) return 'Expired';
        
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        
        if (diffHrs > 0) {
            return `Expires in ${diffHrs}h ${diffMins}m`;
        }
        return `Expires in ${diffMins}m`;
    };

    return (
        <div className="session-page-body">
            <header className="app-header">
                <div className="logo-group">
                    <div className="logo-icon">D</div>
                    <div className="logo-text">Doctors' Call</div>
                </div>
                <nav>
                    <Link to="/scanner">Precision Anatomy Portal</Link>
                    <Link to="/hub">Doctors' Hub</Link>
                    <Link to="/session" className="active">Session</Link>
                    <Link to="/profile">Profile</Link>
                    <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }}>Logout</a>
                </nav>
            </header>

            <div className="session-container">
                <div className="session-title-block">
                    <h2>Authorized Consultation Sessions</h2>
                    <p>Track your active medical connection windows, video consult pathways, and navigation vectors.</p>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <h3>Iterating secure sessions database...</h3>
                    </div>
                ) : sessions.length === 0 ? (
                    <div className="no-sessions-card">
                        <h3>No Active Sessions Available</h3>
                        <p>You currently do not have any pending, approved, or paid consultation matrices. Visit the Doctors' Hub to authorize an appointment slot.</p>
                        <button className="btn-action" style={{ maxWidth: '200px' }} onClick={() => navigate('/hub')}>
                            GO TO HUB
                        </button>
                    </div>
                ) : (
                    <div className="sessions-list">
                        {sessions.map(session => (
                            <div className="session-card" key={session._id}>
                                <div className="session-info">
                                    <div className="session-header-row">
                                        <span className={`session-type-badge ${session.consultationType}`}>
                                            {session.consultationType === 'online' ? 'Online Video' : 'Offline Clinic'}
                                        </span>
                                        <span 
                                            className="session-expiry-badge" 
                                            style={{
                                                background: session.status === 'pending' ? 'rgba(245, 158, 11, 0.1)' : session.status === 'approved' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                color: session.status === 'pending' ? '#f59e0b' : session.status === 'approved' ? '#3b82f6' : 'var(--accent-red)'
                                            }}
                                        >
                                            {getTimeRemainingText(session)}
                                        </span>
                                    </div>
                                    <div className="session-doc-name">{session.doctorId?.name || 'Dr. Medical Expert'}</div>
                                    <div className="session-doc-specialty">{session.doctorId?.specialty || 'General Practitioner'}</div>
                                    
                                    <div className="session-meta-row">
                                        <div className="session-meta-item">
                                            🏢 <span>{session.doctorId?.hospitalName || 'Clinic'}</span>
                                        </div>
                                        <div className="session-meta-item">
                                            📍 <span>{session.doctorId?.place || 'Location'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="session-actions">
                                    <div className="calls-remaining-text">
                                        {session.status === 'pending' ? (
                                            <span style={{ color: '#f59e0b' }}>Awaiting Admin Approval</span>
                                        ) : session.status === 'approved' ? (
                                            <span style={{ color: '#3b82f6' }}>Approved by Admin (Unpaid)</span>
                                        ) : (
                                            <>
                                                Remaining authorizations:{' '}
                                                <span className="calls-remaining-highlight">
                                                    {session.callsRemaining} / 2
                                                </span>
                                            </>
                                        )}
                                    </div>
                                    <button 
                                        className="btn-action"
                                        disabled={session.status === 'pending'}
                                        style={{
                                            background: session.status === 'pending' ? 'rgba(255,255,255,0.05)' : session.status === 'approved' ? '#3b82f6' : 'var(--accent-red)',
                                            color: session.status === 'pending' ? 'var(--text-secondary)' : '#ffffff',
                                            cursor: session.status === 'pending' ? 'not-allowed' : 'pointer'
                                        }}
                                        onClick={() => handleActionClick(session)}
                                    >
                                        {session.status === 'pending' 
                                            ? 'AWAITING APPROVAL' 
                                            : session.status === 'approved' 
                                                ? 'PAY NOW' 
                                                : session.consultationType === 'online' 
                                                    ? 'START CALL' 
                                                    : 'SEE MAP & NAVIGATE'
                                        }
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Session;
