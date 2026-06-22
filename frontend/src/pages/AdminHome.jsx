import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import '../styles/admin.css';

const AdminHome = () => {
    const navigate = useNavigate();
    const [userdata, setUserdata] = useState(null);
    const [users, setUsers] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [activeTab, setActiveTab] = useState('applications'); // users, doctors, applications, appointments
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const fetchAllData = async () => {
        setLoading(true);
        setError('');
        try {
            const [usersRes, docsRes, apptsRes] = await Promise.all([
                api.get('/admin/getallusers'),
                api.get('/admin/getalldoctors'),
                api.get('/admin/getallAppointmentsAdmin')
            ]);

            if (usersRes.data.success) setUsers(usersRes.data.data);
            if (docsRes.data.success) setDoctors(docsRes.data.data);
            if (apptsRes.data.success) setAppointments(apptsRes.data.data);
        } catch (err) {
            console.error('Failed to load admin data', err);
            setError('Failed to retrieve system records. Ensure you are authorized.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const cached = JSON.parse(localStorage.getItem('userInfo'));
        if (!cached || !cached.token) {
            navigate('/login');
            return;
        }
        if (cached.userData.type !== 'admin' && cached.userData.role !== 'admin') {
            navigate('/userhome');
            return;
        }
        setUserdata(cached.userData);
        fetchAllData();
    }, [navigate]);

    const handleApproveDoctor = async (doctorId, userid) => {
        setError('');
        setSuccessMsg('');
        try {
            const res = await api.post('/admin/getapprove', { doctorId, userid });
            if (res.data.success) {
                setSuccessMsg('Doctor registration approved successfully.');
                fetchAllData();
            } else {
                setError(res.data.message || 'Approval failed.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Approval failed.');
        }
    };

    const handleRejectDoctor = async (doctorId, userid) => {
        setError('');
        setSuccessMsg('');
        try {
            const res = await api.post('/admin/getreject', { doctorId, userid });
            if (res.data.success) {
                setSuccessMsg('Doctor registration rejected.');
                fetchAllData();
            } else {
                setError(res.data.message || 'Rejection failed.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Rejection failed.');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        navigate('/');
    };

    const pendingApplications = doctors.filter(doc => doc.status === 'pending');
    const approvedDoctors = doctors.filter(doc => doc.status === 'approved');

    return (
        <div className="admin-page-body" style={{ minHeight: '100vh', background: '#0a0a0c', color: '#fff' }}>
            <header className="app-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', background: '#111115', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div className="logo-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div className="logo-icon" style={{ background: '#ef4444', color: '#fff', padding: '5px 12px', borderRadius: '4px', fontWeight: 'bold' }}>D</div>
                    <div className="logo-text" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>MediCareBook Admin</div>
                </div>
                <nav style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <button 
                        onClick={() => navigate('/userhome')} 
                        style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}
                    >
                        User View
                    </button>
                    <button 
                        onClick={handleLogout} 
                        style={{ background: '#ef4444', border: 'none', color: '#fff', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}
                    >
                        Logout
                    </button>
                </nav>
            </header>

            <div className="admin-container" style={{ padding: '40px' }}>
                <div className="admin-title-block" style={{ marginBottom: '30px' }}>
                    <h2 style={{ fontSize: '1.8rem', margin: 0 }}>Admin Platform Management</h2>
                    <p style={{ color: '#808090', margin: '5px 0 0' }}>Oversee doctor application verification, monitor registered accounts, and audit bookings.</p>
                </div>

                {error && (
                    <div style={{ padding: '15px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#fff', borderRadius: '8px', marginBottom: '20px' }}>
                        {error}
                    </div>
                )}
                {successMsg && (
                    <div style={{ padding: '15px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#fff', borderRadius: '8px', marginBottom: '20px' }}>
                        {successMsg}
                    </div>
                )}

                {/* Tabs bar */}
                <div style={{ display: 'flex', gap: '15px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '15px', marginBottom: '30px' }}>
                    <button 
                        onClick={() => setActiveTab('applications')}
                        style={{ background: activeTab === 'applications' ? '#ef4444' : 'transparent', border: 'none', color: '#fff', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        Doctor Applications ({pendingApplications.length})
                    </button>
                    <button 
                        onClick={() => setActiveTab('users')}
                        style={{ background: activeTab === 'users' ? '#ef4444' : 'transparent', border: 'none', color: '#fff', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        All Users ({users.length})
                    </button>
                    <button 
                        onClick={() => setActiveTab('doctors')}
                        style={{ background: activeTab === 'doctors' ? '#ef4444' : 'transparent', border: 'none', color: '#fff', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        Approved Doctors ({approvedDoctors.length})
                    </button>
                    <button 
                        onClick={() => setActiveTab('appointments')}
                        style={{ background: activeTab === 'appointments' ? '#ef4444' : 'transparent', border: 'none', color: '#fff', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        All Bookings ({appointments.length})
                    </button>
                </div>

                {loading ? (
                    <p style={{ color: '#808090' }}>Syncing dashboard details...</p>
                ) : (
                    <>
                        {/* Tab: Doctor Applications */}
                        {activeTab === 'applications' && (
                            <div className="admin-table-card" style={{ background: '#111115', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', overflow: 'hidden' }}>
                                {pendingApplications.length === 0 ? (
                                    <p style={{ padding: '30px', color: '#808090', margin: 0, textAlign: 'center' }}>No pending doctor registrations to verify.</p>
                                ) : (
                                    <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                                        <thead>
                                            <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                                                <th style={{ padding: '15px 20px' }}>FullName</th>
                                                <th style={{ padding: '15px 20px' }}>Specialisation</th>
                                                <th style={{ padding: '15px 20px' }}>Experience</th>
                                                <th style={{ padding: '15px 20px' }}>Consult Fees</th>
                                                <th style={{ padding: '15px 20px' }}>Address</th>
                                                <th style={{ padding: '15px 20px', textAlign: 'center' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {pendingApplications.map(doc => (
                                                <tr key={doc._id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                                    <td style={{ padding: '15px 20px', fontWeight: 'bold' }}>Dr. {doc.fullname}</td>
                                                    <td style={{ padding: '15px 20px', color: '#ef4444' }}>{doc.specialisation}</td>
                                                    <td style={{ padding: '15px 20px' }}>{doc.experience}</td>
                                                    <td style={{ padding: '15px 20px' }}>₹{doc.fees}</td>
                                                    <td style={{ padding: '15px 20px', color: '#a0a0b0' }}>{doc.address}</td>
                                                    <td style={{ padding: '15px 20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
                                                        <button 
                                                            onClick={() => handleApproveDoctor(doc._id, doc.userId)}
                                                            style={{ background: '#10b981', border: 'none', color: '#fff', padding: '6px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                                                        >
                                                            Approve
                                                        </button>
                                                        <button 
                                                            onClick={() => handleRejectDoctor(doc._id, doc.userId)}
                                                            style={{ background: '#ef4444', border: 'none', color: '#fff', padding: '6px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                                                        >
                                                            Reject
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        )}

                        {/* Tab: All Users */}
                        {activeTab === 'users' && (
                            <div className="admin-table-card" style={{ background: '#111115', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', overflow: 'hidden' }}>
                                <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                                    <thead>
                                        <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                                            <th style={{ padding: '15px 20px' }}>User ID</th>
                                            <th style={{ padding: '15px 20px' }}>Full Name</th>
                                            <th style={{ padding: '15px 20px' }}>Email</th>
                                            <th style={{ padding: '15px 20px' }}>Phone</th>
                                            <th style={{ padding: '15px 20px' }}>isDoctor</th>
                                            <th style={{ padding: '15px 20px' }}>Role/Type</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map(u => (
                                            <tr key={u._id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                                <td style={{ padding: '15px 20px', color: '#808090', fontSize: '0.8rem' }}>{u._id}</td>
                                                <td style={{ padding: '15px 20px', fontWeight: 'bold' }}>{u.fullName}</td>
                                                <td style={{ padding: '15px 20px' }}>{u.email}</td>
                                                <td style={{ padding: '15px 20px' }}>{u.phone || 'N/A'}</td>
                                                <td style={{ padding: '15px 20px' }}>{u.isdoctor ? '✅ Yes' : '❌ No'}</td>
                                                <td style={{ padding: '15px 20px', textTransform: 'uppercase', color: '#ef4444', fontWeight: 'bold' }}>{u.type}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Tab: Approved Doctors */}
                        {activeTab === 'doctors' && (
                            <div className="admin-table-card" style={{ background: '#111115', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', overflow: 'hidden' }}>
                                <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                                    <thead>
                                        <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                                            <th style={{ padding: '15px 20px' }}>FullName</th>
                                            <th style={{ padding: '15px 20px' }}>Specialisation</th>
                                            <th style={{ padding: '15px 20px' }}>Timings</th>
                                            <th style={{ padding: '15px 20px' }}>Fees</th>
                                            <th style={{ padding: '15px 20px' }}>Clinic Location</th>
                                            <th style={{ padding: '15px 20px' }}>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {approvedDoctors.map(doc => (
                                            <tr key={doc._id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                                <td style={{ padding: '15px 20px', fontWeight: 'bold' }}>Dr. {doc.fullname}</td>
                                                <td style={{ padding: '15px 20px', color: '#ef4444' }}>{doc.specialisation}</td>
                                                <td style={{ padding: '15px 20px' }}>{doc.timings?.join(', ')}</td>
                                                <td style={{ padding: '15px 20px' }}>₹{doc.fees}</td>
                                                <td style={{ padding: '15px 20px', color: '#a0a0b0' }}>{doc.address}</td>
                                                <td style={{ padding: '15px 20px' }}>
                                                    <span style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                                        {doc.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Tab: All Bookings */}
                        {activeTab === 'appointments' && (
                            <div className="admin-table-card" style={{ background: '#111115', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', overflow: 'hidden' }}>
                                {appointments.length === 0 ? (
                                    <p style={{ padding: '30px', color: '#808090', margin: 0, textAlign: 'center' }}>No appointments booked on this system.</p>
                                ) : (
                                    <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                                        <thead>
                                            <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                                                <th style={{ padding: '15px 20px' }}>Appointment ID</th>
                                                <th style={{ padding: '15px 20px' }}>User / Patient</th>
                                                <th style={{ padding: '15px 20px' }}>Doctor</th>
                                                <th style={{ padding: '15px 20px' }}>Scheduled Date</th>
                                                <th style={{ padding: '15px 20px' }}>Upload Record</th>
                                                <th style={{ padding: '15px 20px' }}>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {appointments.map(appt => (
                                                <tr key={appt._id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                                    <td style={{ padding: '15px 20px', color: '#808090', fontSize: '0.8rem' }}>{appt._id}</td>
                                                    <td style={{ padding: '15px 20px' }}>{appt.userInfo?.fullName || 'N/A'} <br /><span style={{ color: '#808090', fontSize: '0.85rem' }}>({appt.userInfo?.email})</span></td>
                                                    <td style={{ padding: '15px 20px', fontWeight: 'bold' }}>Dr. {appt.doctorInfo?.fullname || 'N/A'}</td>
                                                    <td style={{ padding: '15px 20px' }}>{new Date(appt.date).toLocaleString()}</td>
                                                    <td style={{ padding: '15px 20px' }}>
                                                        {appt.document ? (
                                                            <span style={{ color: '#a0a0b0' }}>{appt.document.name}</span>
                                                        ) : (
                                                            <span style={{ color: '#606070' }}>None</span>
                                                        )}
                                                    </td>
                                                    <td style={{ padding: '15px 20px' }}>
                                                        <span style={{ 
                                                            background: appt.status === 'approved' ? 'rgba(16,185,129,0.15)' : appt.status === 'rejected' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
                                                            color: appt.status === 'approved' ? '#10b981' : appt.status === 'rejected' ? '#ef4444' : '#f59e0b',
                                                            padding: '4px 10px', 
                                                            borderRadius: '20px', 
                                                            fontSize: '0.8rem',
                                                            fontWeight: 'bold',
                                                            textTransform: 'uppercase'
                                                        }}>
                                                            {appt.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminHome;
