import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/doctorshub.css'; // Leverage existing matrix/grid styles
import '../styles/session.css'; // Leverage sidebar/dashboard layout styles

const UserHome = () => {
    const navigate = useNavigate();
    const [userdata, setUserdata] = useState(null);
    const [doctors, setDoctors] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [activeMenuItem, setActiveMenuItem] = useState('home'); // home, appointments, apply, notifications
    const [notificationTab, setNotificationTab] = useState('unread'); // unread, read
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // Booking modal state
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [bookingDate, setBookingDate] = useState('');
    const [bookingFile, setBookingFile] = useState(null);
    const [bookingLoading, setBookingLoading] = useState(false);

    // Apply doctor form state
    const [fullname, setFullname] = useState('');
    const [docEmail, setDocEmail] = useState('');
    const [docPhone, setDocPhone] = useState('');
    const [docAddress, setDocAddress] = useState('');
    const [specialisation, setSpecialisation] = useState('');
    const [experience, setExperience] = useState('');
    const [fees, setFees] = useState('');
    const [timings, setTimings] = useState('09:00 - 13:00');

    // Fetch user profile and doctors
    const fetchUserData = async () => {
        try {
            const res = await api.post('/user/getuserdata');
            if (res.data.success) {
                setUserdata(res.data.data);
                // Update local storage with fresh user data
                const cached = JSON.parse(localStorage.getItem('userInfo'));
                if (cached) {
                    cached.userData = res.data.data;
                    localStorage.setItem('userInfo', JSON.stringify(cached));
                }
            }
        } catch (err) {
            console.error('Failed to retrieve user profile', err);
            handleLogout();
        }
    };

    const fetchDoctors = async () => {
        setLoading(true);
        try {
            const res = await api.get('/user/getalldoctorsu');
            if (res.data.success) {
                setDoctors(res.data.data);
            }
        } catch (err) {
            console.error('Failed to retrieve doctors list', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchAppointments = async () => {
        try {
            const res = await api.get('/user/getuserappointments');
            if (res.data.success) {
                setAppointments(res.data.data);
            }
        } catch (err) {
            console.error('Failed to retrieve user appointments', err);
        }
    };

    useEffect(() => {
        const cached = JSON.parse(localStorage.getItem('userInfo'));
        if (!cached || !cached.token) {
            navigate('/login');
            return;
        }
        fetchUserData();
        fetchDoctors();
        fetchAppointments();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        navigate('/');
    };

    const handleApplyDoctor = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');

        if (!fullname || !docEmail || !docPhone || !docAddress || !specialisation || !experience || !fees) {
            setError('Please fill in all application fields.');
            return;
        }

        try {
            const res = await api.post('/user/registerdoc', {
                fullname,
                email: docEmail,
                phone: docPhone,
                address: docAddress,
                specialisation,
                experience,
                fees: Number(fees),
                timings,
                userId: userdata._id
            });
            if (res.data.success) {
                setSuccessMsg('Your doctor profile application has been submitted successfully for admin review.');
                // Clear form
                setFullname('');
                setDocEmail('');
                setDocPhone('');
                setDocAddress('');
                setSpecialisation('');
                setExperience('');
                setFees('');
                fetchUserData();
            } else {
                setError(res.data.message || 'Application submission failed.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Application submission failed.');
        }
    };

    const handleBookAppointment = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');

        if (!bookingDate) {
            setError('Please specify a date and time.');
            return;
        }

        setBookingLoading(true);
        try {
            const formData = new FormData();
            formData.append('doctorId', selectedDoctor._id);
            formData.append('date', bookingDate);
            if (bookingFile) {
                formData.append('image', bookingFile);
            }

            const res = await api.post('/user/getappointment', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (res.data.success) {
                setSuccessMsg(`Successfully booked appointment request with Dr. ${selectedDoctor.fullname}!`);
                setSelectedDoctor(null);
                setBookingDate('');
                setBookingFile(null);
                fetchAppointments();
            } else {
                setError(res.data.message || 'Booking appointment failed.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Booking appointment failed.');
        } finally {
            setBookingLoading(false);
        }
    };

    const markAllNotificationsRead = async () => {
        try {
            const res = await api.post('/user/getallnotification');
            if (res.data.success) {
                setUserdata(res.data.data);
            }
        } catch (err) {
            console.error('Failed to mark notifications read', err);
        }
    };

    const deleteAllNotifications = async () => {
        try {
            const res = await api.post('/user/deleteallnotification');
            if (res.data.success) {
                setUserdata(res.data.data);
            }
        } catch (err) {
            console.error('Failed to clear notifications', err);
        }
    };

    const unreadCount = userdata?.notification?.length || 0;

    return (
        <div className="session-page-body" style={{ minHeight: '100vh', display: 'flex', background: '#0a0a0c', color: '#fff' }}>
            {/* Sidebar menu */}
            <aside className="session-sidebar" style={{ width: '280px', flexShrink: 0, borderRight: '1px solid rgba(255, 255, 255, 0.08)', background: '#111115', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                    <div className="logo-group" style={{ padding: '25px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                        <div className="logo-icon">D</div>
                        <div className="logo-text" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>MediCareBook</div>
                    </div>
                    <ul className="sidebar-menu" style={{ listStyle: 'none', padding: '20px 10px', margin: 0 }}>
                        <li style={{ marginBottom: '10px' }}>
                            <button 
                                className={`menu-item ${activeMenuItem === 'home' ? 'active' : ''}`}
                                onClick={() => { setActiveMenuItem('home'); setError(''); setSuccessMsg(''); }}
                                style={{ width: '100%', textAlign: 'left', background: activeMenuItem === 'home' ? '#ef4444' : 'transparent', border: 'none', color: '#fff', padding: '12px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                                Home
                            </button>
                        </li>
                        <li style={{ marginBottom: '10px' }}>
                            <button 
                                className={`menu-item ${activeMenuItem === 'appointments' ? 'active' : ''}`}
                                onClick={() => { setActiveMenuItem('appointments'); setError(''); setSuccessMsg(''); fetchAppointments(); }}
                                style={{ width: '100%', textAlign: 'left', background: activeMenuItem === 'appointments' ? '#ef4444' : 'transparent', border: 'none', color: '#fff', padding: '12px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                                Appointments History
                            </button>
                        </li>
                        {!userdata?.isdoctor && (
                            <li style={{ marginBottom: '10px' }}>
                                <button 
                                    className={`menu-item ${activeMenuItem === 'apply' ? 'active' : ''}`}
                                    onClick={() => { setActiveMenuItem('apply'); setError(''); setSuccessMsg(''); }}
                                    style={{ width: '100%', textAlign: 'left', background: activeMenuItem === 'apply' ? '#ef4444' : 'transparent', border: 'none', color: '#fff', padding: '12px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                                >
                                    Apply as Doctor
                                </button>
                            </li>
                        )}
                        <li style={{ marginBottom: '10px' }}>
                            <button 
                                className={`menu-item ${activeMenuItem === 'notifications' ? 'active' : ''}`}
                                onClick={() => { setActiveMenuItem('notifications'); setError(''); setSuccessMsg(''); }}
                                style={{ width: '100%', textAlign: 'left', background: activeMenuItem === 'notifications' ? '#ef4444' : 'transparent', border: 'none', color: '#fff', padding: '12px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                            >
                                <span>Notifications</span>
                                {unreadCount > 0 && <span style={{ background: '#ef4444', color: '#fff', borderRadius: '50%', padding: '2px 8px', fontSize: '0.75rem' }}>{unreadCount}</span>}
                            </button>
                        </li>
                    </ul>
                </div>
                <div style={{ padding: '20px' }}>
                    <button 
                        onClick={handleLogout} 
                        style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', color: '#a0a0b0', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main content body */}
            <main style={{ flexGrow: 1, padding: '40px', overflowY: 'auto' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '20px' }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '1.8rem' }}>Welcome, {userdata?.isdoctor ? `Dr. ${userdata?.fullName}` : userdata?.fullName}</h1>
                        <p style={{ margin: '5px 0 0', color: '#808090', fontSize: '0.9rem' }}>Account Role: <span style={{ color: '#ef4444', fontWeight: 'bold', textTransform: 'uppercase' }}>{userdata?.type}</span></p>
                    </div>
                    {userdata?.isdoctor && (
                        <button 
                            onClick={() => navigate('/doctorhome')} 
                            style={{ background: '#10b981', border: 'none', padding: '10px 20px', color: '#fff', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                            Go to Doctor Portal
                        </button>
                    )}
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

                {/* Tab: Home (Browse Doctors) */}
                {activeMenuItem === 'home' && (
                    <div>
                        <h2 style={{ marginBottom: '20px', fontSize: '1.4rem' }}>Approved Medical Registries</h2>
                        {loading ? (
                            <p style={{ color: '#808090' }}>Loading available specialists...</p>
                        ) : doctors.length === 0 ? (
                            <p style={{ color: '#808090' }}>No approved doctors listed on the platform at this time.</p>
                        ) : (
                            <div className="doctors-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                                {doctors.map(doc => (
                                    <div key={doc._id} className="doctor-card" style={{ background: '#111115', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '25px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                        <div>
                                            <h3 style={{ margin: '0 0 10px', fontSize: '1.2rem', color: '#fff' }}>Dr. {doc.fullname}</h3>
                                            <p style={{ margin: '0 0 8px', color: '#ef4444', fontWeight: 'bold', fontSize: '0.9rem' }}>{doc.specialisation}</p>
                                            <p style={{ margin: '0 0 15px', color: '#808090', fontSize: '0.85rem' }}>Experience: {doc.experience}</p>
                                            
                                            <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '15px', marginTop: '10px', fontSize: '0.85rem', color: '#a0a0b0' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                    <span>Consultation Fee:</span>
                                                    <span style={{ color: '#fff', fontWeight: 'bold' }}>₹{doc.fees}</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                    <span>Office Address:</span>
                                                    <span style={{ color: '#fff', textAlign: 'right', maxWidth: '180px', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>{doc.address}</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <span>Timings:</span>
                                                    <span style={{ color: '#fff' }}>{doc.timings?.join(', ') || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <button 
                                            onClick={() => { setSelectedDoctor(doc); setSuccessMsg(''); setError(''); }}
                                            style={{ width: '100%', background: '#ef4444', border: 'none', color: '#fff', padding: '12px', borderRadius: '8px', marginTop: '20px', cursor: 'pointer', fontWeight: 'bold' }}
                                        >
                                            Book Now
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Booking Doctor Modal */}
                {selectedDoctor && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
                        <div style={{ background: '#111115', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', maxWidth: '500px', width: '100%', padding: '30px' }}>
                            <h2 style={{ margin: '0 0 10px', fontSize: '1.4rem' }}>Book Consultation</h2>
                            <p style={{ margin: '0 0 20px', color: '#808090' }}>Booking appointment with <strong>Dr. {selectedDoctor.fullname}</strong> ({selectedDoctor.specialisation})</p>
                            
                            <form onSubmit={handleBookAppointment}>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#a0a0b0', marginBottom: '8px' }}>Select Date & Time</label>
                                    <input 
                                        type="datetime-local" 
                                        required
                                        min={new Date().toISOString().slice(0, 16)}
                                        value={bookingDate}
                                        onChange={(e) => setBookingDate(e.target.value)}
                                        style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '12px', borderRadius: '8px', color: '#fff', outline: 'none' }}
                                    />
                                </div>
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#a0a0b0', marginBottom: '8px' }}>Upload Medical Record / Document (Optional)</label>
                                    <input 
                                        type="file" 
                                        onChange={(e) => setBookingFile(e.target.files[0])}
                                        style={{ width: '100%', background: 'transparent', border: 'none', color: '#fff', outline: 'none' }}
                                    />
                                </div>

                                <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
                                    <button 
                                        type="button" 
                                        onClick={() => setSelectedDoctor(null)}
                                        style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={bookingLoading}
                                        style={{ flex: 1, background: '#ef4444', border: 'none', color: '#fff', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                                    >
                                        <span>Confirm Booking</span>
                                        {bookingLoading && <div className="loader" style={{ border: '2px solid #fff', borderTop: '2px solid transparent', width: '14px', height: '14px', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Tab: Appointments History */}
                {activeMenuItem === 'appointments' && (
                    <div>
                        <h2 style={{ marginBottom: '20px', fontSize: '1.4rem' }}>Your Consultations History</h2>
                        {appointments.length === 0 ? (
                            <p style={{ color: '#808090' }}>You have not booked any consultations yet.</p>
                        ) : (
                            <div style={{ background: '#111115', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', overflow: 'hidden' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                                    <thead>
                                        <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                                            <th style={{ padding: '15px 20px' }}>Doctor</th>
                                            <th style={{ padding: '15px 20px' }}>Specialty</th>
                                            <th style={{ padding: '15px 20px' }}>Scheduled Date</th>
                                            <th style={{ padding: '15px 20px' }}>Document</th>
                                            <th style={{ padding: '15px 20px' }}>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {appointments.map(appt => (
                                            <tr key={appt._id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                                                <td style={{ padding: '15px 20px', fontWeight: 'bold' }}>Dr. {appt.docName}</td>
                                                <td style={{ padding: '15px 20px', color: '#a0a0b0' }}>{appt.doctorInfo?.specialisation || 'N/A'}</td>
                                                <td style={{ padding: '15px 20px' }}>{new Date(appt.date).toLocaleString()}</td>
                                                <td style={{ padding: '15px 20px' }}>
                                                    {appt.document ? (
                                                        <span style={{ color: '#a0a0b0', textDecoration: 'underline' }}>{appt.document.name}</span>
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
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* Tab: Apply as Doctor */}
                {activeMenuItem === 'apply' && (
                    <div style={{ maxWidth: '600px', background: '#111115', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '30px' }}>
                        <h2 style={{ marginBottom: '10px', fontSize: '1.4rem' }}>Doctor Application Registry</h2>
                        <p style={{ margin: '0 0 25px', color: '#808090', fontSize: '0.9rem' }}>Fill out your credentials and specialization to list yourself as an approved specialist on the network.</p>

                        <form onSubmit={handleApplyDoctor}>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: '#a0a0b0', marginBottom: '8px' }}>Full Name (Dr. Prefix)</label>
                                <input 
                                    type="text" 
                                    required
                                    placeholder="Smith"
                                    value={fullname}
                                    onChange={(e) => setFullname(e.target.value)}
                                    style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '12px', borderRadius: '8px', color: '#fff', outline: 'none' }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#a0a0b0', marginBottom: '8px' }}>Professional Email</label>
                                    <input 
                                        type="email" 
                                        required
                                        placeholder="smith@doctor.com"
                                        value={docEmail}
                                        onChange={(e) => setDocEmail(e.target.value)}
                                        style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '12px', borderRadius: '8px', color: '#fff', outline: 'none' }}
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#a0a0b0', marginBottom: '8px' }}>Phone Number</label>
                                    <input 
                                        type="text" 
                                        required
                                        placeholder="9998887776"
                                        value={docPhone}
                                        onChange={(e) => setDocPhone(e.target.value)}
                                        style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '12px', borderRadius: '8px', color: '#fff', outline: 'none' }}
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: '#a0a0b0', marginBottom: '8px' }}>Clinic Address</label>
                                <input 
                                    type="text" 
                                    required
                                    placeholder="123 Medical Plaza, Bangalore"
                                    value={docAddress}
                                    onChange={(e) => setDocAddress(e.target.value)}
                                    style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '12px', borderRadius: '8px', color: '#fff', outline: 'none' }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '15px', marginBottom: '25px' }}>
                                <div style={{ flex: 1.2 }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#a0a0b0', marginBottom: '8px' }}>Specialisation</label>
                                    <select 
                                        value={specialisation} 
                                        required
                                        onChange={(e) => setSpecialisation(e.target.value)}
                                        style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '12px', borderRadius: '8px', color: '#fff', outline: 'none' }}
                                    >
                                        <option value="" disabled style={{ background: '#1c1c1e' }}>Select Specialisation</option>
                                        <option value="General Physician" style={{ background: '#1c1c1e' }}>General Physician</option>
                                        <option value="Cardiologist" style={{ background: '#1c1c1e' }}>Cardiologist</option>
                                        <option value="Neurologist" style={{ background: '#1c1c1e' }}>Neurologist</option>
                                        <option value="Orthopedic Surgeon" style={{ background: '#1c1c1e' }}>Orthopedic Surgeon</option>
                                        <option value="Oncologist" style={{ background: '#1c1c1e' }}>Oncologist</option>
                                        <option value="ENT Specialist" style={{ background: '#1c1c1e' }}>ENT Specialist</option>
                                        <option value="Pediatrician" style={{ background: '#1c1c1e' }}>Pediatrician</option>
                                        <option value="Gastroenterologist" style={{ background: '#1c1c1e' }}>Gastroenterologist</option>
                                    </select>
                                </div>
                                <div style={{ flex: 0.8 }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#a0a0b0', marginBottom: '8px' }}>Experience</label>
                                    <input 
                                        type="text" 
                                        required
                                        placeholder="5 years"
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
                                        placeholder="500"
                                        value={fees}
                                        onChange={(e) => setFees(e.target.value)}
                                        style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '12px', borderRadius: '8px', color: '#fff', outline: 'none' }}
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                style={{ width: '100%', background: '#ef4444', border: 'none', color: '#fff', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                                Submit Doctor Application
                            </button>
                        </form>
                    </div>
                )}

                {/* Tab: Notifications */}
                {activeMenuItem === 'notifications' && (
                    <div style={{ maxWidth: '800px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button 
                                    onClick={() => setNotificationTab('unread')}
                                    style={{ background: 'transparent', border: 'none', borderBottom: notificationTab === 'unread' ? '2px solid #ef4444' : 'none', color: notificationTab === 'unread' ? '#ef4444' : '#808090', padding: '10px', cursor: 'pointer', fontWeight: 'bold' }}
                                >
                                    Unread Notifications ({unreadCount})
                                </button>
                                <button 
                                    onClick={() => setNotificationTab('read')}
                                    style={{ background: 'transparent', border: 'none', borderBottom: notificationTab === 'read' ? '2px solid #ef4444' : 'none', color: notificationTab === 'read' ? '#ef4444' : '#808090', padding: '10px', cursor: 'pointer', fontWeight: 'bold' }}
                                >
                                    Read Notifications ({userdata?.seennotification?.length || 0})
                                </button>
                            </div>

                            <div>
                                {notificationTab === 'unread' && unreadCount > 0 && (
                                    <button 
                                        onClick={markAllNotificationsRead}
                                        style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}
                                    >
                                        Mark all as read
                                    </button>
                                )}
                                {notificationTab === 'read' && (userdata?.seennotification?.length || 0) > 0 && (
                                    <button 
                                        onClick={deleteAllNotifications}
                                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#a0a0b0', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85rem' }}
                                    >
                                        Clear all read
                                    </button>
                                )}
                            </div>
                        </div>

                        {notificationTab === 'unread' ? (
                            unreadCount === 0 ? (
                                <p style={{ color: '#808090' }}>No new notifications.</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {userdata?.notification.map((notif, idx) => (
                                        <div key={idx} style={{ background: '#111115', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '15px 20px', borderRadius: '8px' }}>
                                            <p style={{ margin: 0 }}>{notif.message}</p>
                                        </div>
                                    ))}
                                </div>
                            )
                        ) : (
                            (userdata?.seennotification?.length || 0) === 0 ? (
                                <p style={{ color: '#808090' }}>No notifications history.</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {userdata?.seennotification.map((notif, idx) => (
                                        <div key={idx} style={{ background: '#111115', border: '1px solid rgba(255, 255, 255, 0.05)', padding: '15px 20px', borderRadius: '8px', opacity: 0.7 }}>
                                            <p style={{ margin: 0 }}>{notif.message}</p>
                                        </div>
                                    ))}
                                </div>
                            )
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default UserHome;
