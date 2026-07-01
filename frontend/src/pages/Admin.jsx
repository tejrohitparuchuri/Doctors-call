import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import '../styles/admin.css';

const Admin = () => {
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Verification check for admin permissions
    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (!userInfo) {
            navigate('/login');
            return;
        }
        try {
            const parsed = JSON.parse(userInfo);
            if (parsed.role !== 'admin') {
                navigate('/profile');
            }
        } catch (e) {
            navigate('/login');
        }
    }, [navigate]);

    const fetchAllAppointments = async () => {
        try {
            const res = await api.get('/appointments/all');
            setAppointments(res.data);
        } catch (err) {
            console.error('Failed to fetch appointments', err);
            setError('Failed to retrieve consult records.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllAppointments();
    }, []);

    const handleApprove = async (id) => {
        try {
            await api.put(`/appointments/${id}/approve`);
            // Refresh
            fetchAllAppointments();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to approve consultation.');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        navigate('/login');
    };

    return (
        <div className="admin-page-body">
            <header className="app-header">
                <div className="logo-group">
                    <div className="logo-icon">D</div>
                    <div className="logo-text">Doctors' Call Admin</div>
                </div>
                <nav>
                    <Link to="/admin" className="active">Dashboard</Link>
                    <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }}>Logout</a>
                </nav>
            </header>

            <div className="admin-container">
                <div className="admin-title-block">
                    <h2>Admin Diagnostic Portal</h2>
                    <p>Approve medical connection vectors, review consultations, and manage paid authorization pipelines.</p>
                </div>

                {error && (
                    <div style={{ padding: '15px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--accent-red)', borderRadius: '10px', color: '#fff', textAlign: 'center' }}>
                        {error}
                    </div>
                )}

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <h3>Syncing registry...</h3>
                    </div>
                ) : (
                    <div className="admin-table-card">
                        {appointments.length === 0 ? (
                            <div className="empty-state">No consultation requests in system registry.</div>
                        ) : (
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Patient Email</th>
                                        <th>Specialist Name</th>
                                        <th>Specialty Area</th>
                                        <th>Consult Protocol</th>
                                        <th>Current Status</th>
                                        <th>Payment Status</th>
                                        <th>Registry Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {appointments.map(appt => (
                                        <tr key={appt._id}>
                                            <td>{appt.patientId?.email || 'N/A'}</td>
                                            <td>{appt.doctorId?.name || 'N/A'}</td>
                                            <td>{appt.doctorId?.specialty || 'N/A'}</td>
                                            <td style={{ textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                                {appt.consultationType}
                                            </td>
                                            <td>
                                                <span className={`status-badge ${appt.status}`}>
                                                    {appt.status}
                                                </span>
                                            </td>
                                            <td>
                                                <span style={{ 
                                                    fontSize: '0.75rem', 
                                                    fontWeight: 'bold', 
                                                    color: appt.paymentStatus === 'paid' ? '#10b981' : '#f59e0b',
                                                    textTransform: 'uppercase'
                                                }}>
                                                    {appt.paymentStatus}
                                                </span>
                                            </td>
                                            <td>
                                                {appt.status === 'pending' && (
                                                    <button 
                                                        className="btn-approve"
                                                        onClick={() => handleApprove(appt._id)}
                                                    >
                                                        APPROVE
                                                    </button>
                                                )}
                                                {appt.status !== 'pending' && (
                                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                        No Actions Required
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Admin;
