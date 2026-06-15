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
            // Filter active sessions: not expired, and still has calls remaining (or if it is offline, callsRemaining might still be checked or just active within 48h)
            // Wait, the user said "till then he can make 2 calls to expire the session or see the map there"
            // So if callsRemaining reaches 0, it expires. Or if 48h passes, it expires.
            const active = res.data.filter(s => {
                const expires = new Date(s.expiresAt);
                const hasCalls = s.callsRemaining > 0;
                return expires > new Date() && hasCalls;
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
            // For offline, it redirects to the call view where the coordinates & directions map is displayed
            // Wait! The user says "or see the map there". If they click action, they can see the map there.
            // We can also decrement the call count or just redirect to show the map.
            // Let's decrement the count or just let them see the map. Decrementing calls remaining makes sense to track visits or we can just redirect to the map view!
            // Wait, "till then he can make 2 calls to expire the session or see the map there"
            // For offline, let's also decrement the count when they click to navigate/view map details, or just keep it open.
            // Let's decrement so it counts as a protocol use, or just direct them. Let's make it decrement too so they get max 2 visits/views, or let them view without decrementing. Let's decrement for consistency or keep it simple. Let's decrement since they are accessing the session slot.
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
    const getTimeRemainingText = (expiresAtStr) => {
        const expiry = new Date(expiresAtStr);
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
                        <p>You currently do not have any paid consultation matrices. Visit the Doctors' Hub to authorize an appointment slot.</p>
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
                                        <span className="session-expiry-badge">
                                            {getTimeRemainingText(session.expiresAt)}
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
                                        Remaining authorizations:{' '}
                                        <span className="calls-remaining-highlight">
                                            {session.callsRemaining} / 2
                                        </span>
                                    </div>
                                    <button 
                                        className="btn-action"
                                        onClick={() => handleActionClick(session)}
                                    >
                                        {session.consultationType === 'online' ? 'START CALL' : 'SEE MAP & NAVIGATE'}
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
