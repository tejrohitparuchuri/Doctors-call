import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/doctorshub.css';

const specializationsMap = {
    'Bones': ['Orthopedic Surgeon'],
    'Muscle': ['Orthopedic Surgeon', 'General Physician'],
    'Brain': ['Neurologist', 'Psychiatrist'],
    'Organs': [
        'Cardiologist',
        'Gastroenterologist',
        'Gynecologist',
        'Oncologist',
        'Pediatrician',
        'Dermatologist',
        'ENT Specialist',
        'Ophthalmologist'
    ]
};

const allSpecializations = [
    'ENT Specialist',
    'General Physician',
    'Psychiatrist',
    'Dermatologist',
    'Orthopedic Surgeon',
    'Gynecologist',
    'Oncologist',
    'Neurologist',
    'Ophthalmologist',
    'Cardiologist',
    'Pediatrician',
    'Gastroenterologist'
];

const allPlaces = [
    'Delhi',
    'Mumbai',
    'Pune',
    'Bangalore',
    'Hyderabad',
    'Ahmedabad',
    'Kolkata'
];

const DoctorsHub = () => {
    const navigate = useNavigate();
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [costLimit, setCostLimit] = useState(2000);
    
    // Filters
    const [selectedPlace, setSelectedPlace] = useState('');
    const [selectedSpecialty, setSelectedSpecialty] = useState('');
    const [searchText, setSearchText] = useState('');
    
    // User profile matching data
    const [userProfile, setUserProfile] = useState(null);
    const [suggestedSpecs, setSuggestedSpecs] = useState([]);

    // Appointment booking state
    const [bookingDocId, setBookingDocId] = useState(null);
    const [bookingMessage, setBookingMessage] = useState('');

    // Load user profile & suggestions
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/auth/profile');
                setUserProfile(res.data);

                // Map user parts to specializations
                const specs = new Set();
                
                // 1. Check saved parts
                if (res.data.savedParts && res.data.savedParts.length > 0) {
                    res.data.savedParts.forEach(part => {
                        // Check if the part name or active category matches skeleton/muscle/organ/brain
                        const partLower = part.toLowerCase();
                        if (partLower.includes('skull') || partLower.includes('cranium') || partLower.includes('spine') || partLower.includes('vertebrae') || partLower.includes('bone') || partLower.includes('rib') || partLower.includes('pelvic') || partLower.includes('femur') || partLower.includes('joint')) {
                            specializationsMap['Bones'].forEach(s => specs.add(s));
                        }
                        if (partLower.includes('muscle') || partLower.includes('tendon') || partLower.includes('oblique') || partLower.includes('gluteal') || partLower.includes('quadriceps') || partLower.includes('calf')) {
                            specializationsMap['Muscle'].forEach(s => specs.add(s));
                        }
                        if (partLower.includes('brain') || partLower.includes('cerebral') || partLower.includes('cortex')) {
                            specializationsMap['Brain'].forEach(s => specs.add(s));
                        }
                        // Default to Organ specialties
                        specializationsMap['Organs'].forEach(s => specs.add(s));
                    });
                }

                // 2. Check health condition problem terms
                if (res.data.healthCondition) {
                    const condLower = res.data.healthCondition.toLowerCase();
                    if (condLower.includes('heart') || condLower.includes('bp') || condLower.includes('hypertension')) {
                        specs.add('Cardiologist');
                    }
                    if (condLower.includes('stomach') || condLower.includes('gastric') || condLower.includes('liver') || condLower.includes('digestion')) {
                        specs.add('Gastroenterologist');
                    }
                    if (condLower.includes('brain') || condLower.includes('nerve') || condLower.includes('neuropathy')) {
                        specs.add('Neurologist');
                    }
                    if (condLower.includes('fever') || condLower.includes('cough') || condLower.includes('pain')) {
                        specs.add('General Physician');
                    }
                    if (condLower.includes('cancer') || condLower.includes('tumor')) {
                        specs.add('Oncologist');
                    }
                }

                setSuggestedSpecs(Array.from(specs));
            } catch (err) {
                console.error('Failed to load profile', err);
            }
        };
        fetchProfile();
    }, []);

    // Fetch doctors based on filters
    const fetchDoctors = async () => {
        setLoading(true);
        try {
            const queryParams = [];
            if (costLimit) queryParams.push(`costLimit=${costLimit}`);
            if (selectedPlace) queryParams.push(`place=${selectedPlace}`);
            if (selectedSpecialty) queryParams.push(`specialty=${selectedSpecialty}`);
            if (searchText) queryParams.push(`search=${encodeURIComponent(searchText)}`);

            const url = `/doctors?${queryParams.join('&')}`;
            const res = await api.get(url);
            setDoctors(res.data);
        } catch (err) {
            console.error('Error fetching doctors', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDoctors();
    }, [costLimit, selectedPlace, selectedSpecialty, searchText]);

    const resetFilters = () => {
        setCostLimit(2000);
        setSelectedPlace('');
        setSelectedSpecialty('');
        setSearchText('');
    };

    const handleBookMatrix = (doc) => {
        navigate('/purchase', { state: { doctor: doc } });
    };

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        navigate('/login');
    };

    // Sort specializations: Suggested specializations first
    const sortedSpecializations = [
        ...suggestedSpecs,
        ...allSpecializations.filter(s => !suggestedSpecs.includes(s))
    ];

    return (
        <div className="hub-page-body">
            <header className="app-header">
                <div className="logo-group">
                    <div className="logo-icon">D</div>
                    <div className="logo-text">Doctors' Call</div>
                </div>
                <nav>
                    <Link to="/scanner">Precision Anatomy Portal</Link>
                    <Link to="/hub" className="active">Doctors' Hub</Link>
                    <Link to="/session">Session</Link>
                    <Link to="/profile">Profile</Link>
                    <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }}>Logout</a>
                </nav>
            </header>

            <div className="hub-container">
                <div className="marketplace">
                    <div className="market-header">
                        <h2>Hire your doctor for a term</h2>
                        <div className="results-count">
                            {loading ? 'Iterating database...' : `Showing ${doctors.length} specialist${doctors.length === 1 ? '' : 's'}`}
                        </div>
                    </div>

                    {/* Patient profile context display */}
                    {userProfile && (
                        <div style={{
                            padding: '12px 18px',
                            background: 'rgba(255, 255, 255, 0.02)',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            borderRadius: '10px',
                            fontSize: '0.85rem',
                            display: 'flex',
                            gap: '20px',
                            alignItems: 'center',
                            flexWrap: 'wrap'
                        }}>
                            <span style={{ color: 'var(--accent-red)', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>My Profile Details:</span>
                            <span><strong>Problem:</strong> {userProfile.healthCondition || 'None'}</span>
                            <span><strong>Saved Parts:</strong> {userProfile.savedParts?.join(', ') || '0 items'}</span>
                            {suggestedSpecs.length > 0 && (
                                <span style={{ color: 'var(--accent-amber)' }}>
                                    💡 Suggestions prioritized inside specialization list!
                                </span>
                            )}
                        </div>
                    )}

                    {bookingMessage && (
                        <div style={{
                            padding: '12px 20px',
                            background: 'rgba(239, 68, 68, 0.15)',
                            border: '1px solid var(--accent-red)',
                            borderRadius: '8px',
                            color: '#fff',
                            fontWeight: '600',
                            fontSize: '0.9rem',
                            marginTop: '15px'
                        }}>
                            {bookingMessage}
                        </div>
                    )}

                    <div className="doctors-grid" style={{ marginTop: '15px' }}>
                        {!loading && doctors.length === 0 && (
                            <div className="no-results">No clinicians match your filter parameters.</div>
                        )}
                        {doctors.map(doc => (
                            <div className="doctor-card" key={doc._id}>
                                <div className="card-header">
                                    <div className="avatar">{doc.initials}</div>
                                    <div className="doc-info">
                                        <h3>{doc.name}</h3>
                                        <p>{doc.specialty}</p>
                                    </div>
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '5px' }}>
                                    <div>🏢 {doc.hospitalName || 'Clinic'}</div>
                                    <div>📍 {doc.place || 'Unknown'} • 🕒 {doc.experience} Years Exp</div>
                                    <div style={{ color: 'var(--accent-amber)', fontWeight: 'bold' }}>★ {doc.rating} Rating</div>
                                </div>
                                <div className="specialty-badges">
                                    {doc.parts && doc.parts.map(part => (
                                        <span className="badge accent" key={part}>{part}</span>
                                    ))}
                                </div>
                                <div className="card-footer">
                                    <div className="cost-info">
                                        <span className="cost-label">Session rate</span>
                                        <span className="cost-val">₹{doc.cost?.toLocaleString('en-IN')}/hr</span>
                                    </div>
                                    <button 
                                        className="btn-book"
                                        disabled={bookingDocId === doc._id}
                                        onClick={() => handleBookMatrix(doc)}
                                    >
                                        {bookingDocId === doc._id ? 'BOOKING...' : 'BOOK MATRIX'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="filter-sidebar">
                    {/* Smart Search */}
                    <div className="filter-section">
                        <h4>Smart Search</h4>
                        <input 
                            type="text" 
                            placeholder="Search name, specialty, hospital..."
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px 14px',
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: '10px',
                                color: '#fff',
                                outline: 'none',
                                fontSize: '0.9rem'
                            }}
                        />
                    </div>

                    <div className="filter-section">
                        <h4>Max Hourly Rate</h4>
                        <div className="cost-slider-container">
                            <input 
                                type="range" 
                                min="400" 
                                max="2000" 
                                step="50" 
                                value={costLimit}
                                onChange={(e) => setCostLimit(Number(e.target.value))}
                            />
                            <div className="slider-labels">
                                <span>₹400</span>
                                <span style={{ color: 'var(--accent-red)' }}>₹{costLimit?.toLocaleString('en-IN')}</span>
                                <span>₹2,000</span>
                            </div>
                        </div>
                    </div>

                    {/* Specialization Filter Dropdown */}
                    <div className="filter-section">
                        <h4>Specialization</h4>
                        <select 
                            value={selectedSpecialty}
                            onChange={(e) => setSelectedSpecialty(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px 14px',
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: '10px',
                                color: '#fff',
                                outline: 'none',
                                fontSize: '0.9rem',
                                cursor: 'pointer'
                            }}
                        >
                            <option value="" style={{ background: '#1c1c1e' }}>All Specializations</option>
                            {suggestedSpecs.length > 0 && (
                                <optgroup label="Suggested For You" style={{ background: '#1c1c1e', color: 'var(--accent-amber)' }}>
                                    {suggestedSpecs.map(spec => (
                                        <option key={spec} value={spec} style={{ background: '#1c1c1e', color: '#fff' }}>{spec} 💡</option>
                                    ))}
                                </optgroup>
                            )}
                            <optgroup label="Other Specialties" style={{ background: '#1c1c1e' }}>
                                {sortedSpecializations.map(spec => (
                                    <option key={spec} value={spec} style={{ background: '#1c1c1e' }}>{spec}</option>
                                ))}
                            </optgroup>
                        </select>
                    </div>

                    {/* Place / City Location Filter */}
                    <div className="filter-section">
                        <h4>City / Location</h4>
                        <select 
                            value={selectedPlace}
                            onChange={(e) => setSelectedPlace(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px 14px',
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: '10px',
                                color: '#fff',
                                outline: 'none',
                                fontSize: '0.9rem',
                                cursor: 'pointer'
                            }}
                        >
                            <option value="" style={{ background: '#1c1c1e' }}>All Cities</option>
                            {allPlaces.map(place => (
                                <option key={place} value={place} style={{ background: '#1c1c1e' }}>{place}</option>
                            ))}
                        </select>
                    </div>

                    <button className="btn-reset" onClick={resetFilters}>RESET FILTERS</button>
                </div>
            </div>
        </div>
    );
};

export default DoctorsHub;
