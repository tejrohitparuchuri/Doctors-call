import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/doctorshub.css';
import '../styles/session.css';

const DoctorHome = () => {
    const navigate = useNavigate();
    const [userdata, setUserdata] = useState(null);
    const [doctorProfile, setDoctorProfile] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [activeMenuItem, setActiveMenuItem] = useState('appointments'); // appointments, edit-profile
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // Profile form state
    const [fullname, setFullname] = useState('');
    const [address, setAddress] = useState('');
    const [specialisation, setSpecialisation] = useState('');
    const [experience, setExperience] = useState('');
    const [fees, setFees] = useState('');
    const [timings, setTimings] = useState('');
    const [phone, setPhone] = useState('');

    const fetchDoctorProfile = async () => {
        try {
            // Find doctor profile corresponding to user
            const res = await api.get('/admin/getalldoctors');
            if (res.data.success) {
                const cached = JSON.parse(localStorage.getItem('userInfo'));
                const myProfile = res.data.data.find(d => d.userId === cached.userData._id);
                if (myProfile) {
                    setDoctorProfile(myProfile);
                    setFullname(myProfile.fullname);
                    setAddress(myProfile.address);
                    setSpecialisation(myProfile.specialisation);
                    setExperience(myProfile.experience);
                    setFees(myProfile.fees.toString());
                    setTimings(myProfile.timings?.join(', ') || '');
                    setPhone(myProfile.phone);
                }
            }
        } catch (err) {
            console.error('Failed to load doctor profile', err);
        }
    };

    const fetchDoctorAppointments = async () => {
        setLoading(true);
        try {
            const res = await api.get('/doctor/getdoctorappointments');
            if (res.data.success) {
                setAppointments(res.data.data);
            }
        } catch (err) {
            console.error('Failed to fetch doctor appointments', err);
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
        if (!cached.userData.isdoctor) {
            navigate('/userhome');
            return;
        }
        setUserdata(cached.userData);
        fetchDoctorProfile();
        fetchDoctorAppointments();
    }, [navigate]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');

        try {
            const timingsArray = timings.split(',').map(t => t.trim()).filter(Boolean);
            const res = await api.post('/doctor/updateprofile', {
                fullname,
                address,
                specialisation,
                experience,
                fees: Number(fees),
                timings: timingsArray,
                phone,
                userId: userdata._id
            });

            if (res.data.success) {
                setSuccessMsg('Doctor profile updated successfully!');
                fetchDoctorProfile();
            } else {
                setError(res.data.message || 'Profile update failed.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Profile update failed.');
        }
    };

    const handleStatusUpdate = async (appointmentId, status) => {
        setError('');
        setSuccessMsg('');
        try {
            const res = await api.post('/doctor/handlestatus', { appointmentId, status });
            if (res.data.success) {
                setSuccessMsg(`Appointment status updated to ${status}.`);
                fetchDoctorAppointments();
            } else {
                setError(res.data.message || 'Failed to update status.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update status.');
        }
    };

    const handleDownloadDocument = async (appointId, filename) => {
        try {
            // Trigger browser download by requesting binary file stream
            const response = await api.get(`/doctor/getdocumentdownload?appointId=${appointId}`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename || 'medical-report.pdf');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error('Download failed', err);
            alert('Failed to download document from the server.');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        navigate('/');
    };

    return (
        <div className="session-page-body" style={{ minHeight: '100vh', display: 'flex', background: '#0a0a0c', color: '#fff' }}>
            {/* Sidebar menu */}
            <aside className="session-sidebar" style={{ width: '280px', flexShrink: 0, borderRight: '1px solid rgba(255, 255, 255, 0.08)', background: '#111115', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                    <div className="logo-group" style={{ padding: '25px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                        <div className="logo-icon" style={{ background: '#10b981' }}>D</div>
                        <div className="logo-text" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Doctor Portal</div>
                    </div>
                    <ul className="sidebar-menu" style={{ listStyle: 'none', padding: '20px 10px', margin: 0 }}>
                        <li style={{ marginBottom: '10px' }}>
                            <button 
                                className={`menu-item ${activeMenuItem === 'appointments' ? 'active' : ''}`}
                                onClick={() => { setActiveMenuItem('appointments'); setError(''); setSuccessMsg(''); fetchDoctorAppointments(); }}
                                style={{ width: '100%', textAlign: 'left', background: activeMenuItem === 'appointments' ? '#10b981' : 'transparent', border: 'none', color: '#fff', padding: '12px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                                Appointments
                            </button>
                        </li>
                        <li style={{ marginBottom: '10px' }}>
                            <button 
                                className={`menu-item ${activeMenuItem === 'edit-profile' ? 'active' : ''}`}
                                onClick={() => { setActiveMenuItem('edit-profile'); setError(''); setSuccessMsg(''); }}
                                style={{ width: '100%', textAlign: 'left', background: activeMenuItem === 'edit-profile' ? '#10b981' : 'transparent', border: 'none', color: '#fff', padding: '12px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                                Edit Profile
                            </button>
                        </li>
                    </ul>
                </div>
                <div style={{ padding: '20px' }}>
                    <button 
                        onClick={() => navigate('/userhome')} 
                        style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', marginBottom: '10px' }}
                    >
                        Patient Dashboard
                    </button>
                    <button 
                        onClick={handleLogout} 
                        style={{ width: '100%', background: '#ef4444', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main content body */}
            <main style={{ flexGrow: 1, padding: '40px', overflowY: 'auto' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '20px' }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '1.8rem' }}>Welcome, Dr. {doctorProfile?.fullname || userdata?.fullName}</h1>
                        <p style={{ margin: '5px 0 0', color: '#808090', fontSize: '0.9rem' }}>Specialty: <span style={{ color: '#10b981', fontWeight: 'bold' }}>{doctorProfile?.specialisation || 'N/A'}</span></p>
                    </div>
                </header>

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

                {/* Tab: Doctor Appointments */}
                {activeMenuItem === 'appointments' && (
                    <div>
                        <h2 style={{ marginBottom: '20px', fontSize: '1.4rem' }}>Scheduled Patient Appointments</h2>
                        {loading ? (
                            <p style={{ color: '#808090' }}>Loading appointments...</p>
                        ) : appointments.length === 0 ? (
                            <p style={{ color: '#808090' }}>No appointments booked with you yet.</p>
                        ) : (
                            <div style={{ background: '#111115', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', overflow: 'hidden' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                                    <thead>
                                        <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                                            <th style={{ padding: '15px 20px' }}>Patient Name</th>
                                            <th style={{ padding: '15px 20px' }}>Email</th>
                                            <th style={{ padding: '15px 20px' }}>Scheduled Date</th>
                                            <th style={{ padding: '15px 20px' }}>Uploaded Record</th>
                                            <th style={{ padding: '15px 20px' }}>Status</th>
                                            <th style={{ padding: '15px 20px', textAlign: 'center' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {appointments.map(appt => (
                                            <tr key={appt._id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                                <td style={{ padding: '15px 20px', fontWeight: 'bold' }}>{appt.userInfo?.fullName || 'N/A'}</td>
                                                <td style={{ padding: '15px 20px', color: '#a0a0b0' }}>{appt.userInfo?.email || 'N/A'}</td>
                                                <td style={{ padding: '15px 20px' }}>{new Date(appt.date).toLocaleString()}</td>
                                                <td style={{ padding: '15px 20px' }}>
                                                    {appt.document ? (
                                                        <button 
                                                            onClick={() => handleDownloadDocument(appt._id, apppt.document.name)}
                                                            style={{ background: 'transparent', border: 'none', color: '#10b981', textDecoration: 'underline', cursor: 'pointer', padding: 0, fontSize: '0.9rem' }}
                                                        >
                                                            {appt.document.name}
                                                        </button>
                                                    ) : (
                                                        <span style={{ color: '#606070' }}>None</span>
                                                    )}
                                                </td>
                                                <td style={{ padding: '15px 20px' }}>
                                                    <span style={{ 
                                                        background: appt.status === 'approved' ? 'rgba(16, 185, 129, 0.15)' : appt.status === 'rejected' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
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
                                                <td style={{ padding: '15px 20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
                                                    {appt.status === 'pending' ? (
                                                        <>
                                                            <button 
                                                                onClick={() => handleStatusUpdate(appt._id, 'approved')}
                                                                style={{ background: '#10b981', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}
                                                            >
                                                                Approve
                                                            </button>
                                                            <button 
                                                                onClick={() => handleStatusUpdate(appt._id, 'rejected')}
                                                                style={{ background: '#ef4444', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}
                                                            >
                                                                Reject
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <span style={{ color: '#606070', fontSize: '0.85rem' }}>No Actions</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* Tab: Edit Profile */}
                {activeMenuItem === 'edit-profile' && (
                    <div style={{ maxWidth: '600px', background: '#111115', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '30px' }}>
                        <h2 style={{ marginBottom: '20px', fontSize: '1.4rem' }}>Update Professional Profile</h2>

                        <form onSubmit={handleUpdateProfile}>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: '#a0a0b0', marginBottom: '8px' }}>Full Name (Dr. Prefix)</label>
                                <input 
                                    type="text" 
                                    required
                                    value={fullname}
                                    onChange={(e) => setFullname(e.target.value)}
                                    style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '12px', borderRadius: '8px', color: '#fff', outline: 'none' }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                                <div style={{ flex: 1.2 }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#a0a0b0', marginBottom: '8px' }}>Specialisation</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={specialisation}
                                        onChange={(e) => setSpecialisation(e.target.value)}
                                        style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '12px', borderRadius: '8px', color: '#fff', outline: 'none' }}
                                    />
                                </div>
                                <div style={{ flex: 0.8 }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#a0a0b0', marginBottom: '8px' }}>Experience</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={experience}
                                        onChange={(e) => setExperience(e.target.value)}
                                        style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '12px', borderRadius: '8px', color: '#fff', outline: 'none' }}
                                    />
                                </div>
                                <div style={{ flex: 0.8 }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#a0a0b0', marginBottom: '8px' }}>Consulting Fees (INR)</label>
                                    <input 
                                        type="number" 
                                        required
                                        value={fees}
                                        onChange={(e) => setFees(e.target.value)}
                                        style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '12px', borderRadius: '8px', color: '#fff', outline: 'none' }}
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: '#a0a0b0', marginBottom: '8px' }}>Contact Phone</label>
                                <input 
                                    type="text" 
                                    required
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '12px', borderRadius: '8px', color: '#fff', outline: 'none' }}
                                />
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: '#a0a0b0', marginBottom: '8px' }}>Office Address</label>
                                <input 
                                    type="text" 
                                    required
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '12px', borderRadius: '8px', color: '#fff', outline: 'none' }}
                                />
                            </div>

                            <div style={{ marginBottom: '25px' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: '#a0a0b0', marginBottom: '8px' }}>Consulting Hours (comma separated)</label>
                                <input 
                                    type="text" 
                                    required
                                    placeholder="09:00 - 13:00, 15:00 - 19:00"
                                    value={timings}
                                    onChange={(e) => setTimings(e.target.value)}
                                    style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '12px', borderRadius: '8px', color: '#fff', outline: 'none' }}
                                />
                            </div>

                            <button 
                                type="submit" 
                                style={{ width: '100%', background: '#10b981', border: 'none', color: '#fff', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                                Save Profile Changes
                            </button>
                        </form>
                    </div>
                )}
            </main>
        </div>
    );
};

export default DoctorHome;
