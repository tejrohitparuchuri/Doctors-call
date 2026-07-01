import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/scanning.css';

const anatomicalMapping = {
    skeleton: {
        title: "Skeletal Framework",
        layerTag: "Osseous Tissue",
        zones: [
            { max: 22, name: "Cranium (Skull Bones)", vascular: "Minimum" },
            { max: 27, name: "Cervical Vertebrae (C1-C7)", vascular: "Minimum" },
            { max: 35, name: "Clavicle & Scapular Arch", vascular: "Moderate" },
            { max: 48, name: "Sternum & Upper Ribs", vascular: "High (Marrow)" },
            { max: 58, name: "Lower Floating Rib Cage", vascular: "High (Marrow)" },
            { max: 68, name: "Lumbar Vertebrae Spine", vascular: "Moderate" },
            { max: 78, name: "Pelvic Girdle (Ilium/Pubis)", vascular: "High" },
            { max: 92, name: "Femur (Upper Leg Bone)", vascular: "Maximal" },
            { max: 105, name: "Patella (Knee Cap Joint)", vascular: "Minimum" },
            { max: 130, name: "Tibia & Fibula Structures", vascular: "Moderate" }
        ]
    },
    muscle: {
        title: "Muscular Myofibrils",
        layerTag: "Striated Muscle",
        zones: [
            { max: 22, name: "Masseter & Cranial Fascia", vascular: "High" },
            { max: 27, name: "Trapezius Neck Complex", vascular: "High" },
            { max: 35, name: "Deltoid Shoulder Assemblies", vascular: "Very High" },
            { max: 48, name: "Pectoralis Major Chest", vascular: "Extensive" },
            { max: 58, name: "Rectus Abdominis (Upper)", vascular: "High" },
            { max: 68, name: "Obliques & Core Matrix", vascular: "High" },
            { max: 78, name: "Gluteal Hip Flexor Ring", vascular: "Extensive" },
            { max: 92, name: "Quadriceps Femoris Group", vascular: "Maximal" },
            { max: 105, name: "Patellar Tendon Extension", vascular: "Low" },
            { max: 130, name: "Gastrocnemius (Calf Muscle)", vascular: "Very High" }
        ]
    },
    organs: {
        title: "Visceral System",
        layerTag: "Splanchnic Organs",
        zones: [
            { max: 22, name: "Cerebral Cortex Brain Core", vascular: "Maximal" },
            { max: 27, name: "Pharynx & Laryngeal Tract", vascular: "Moderate" },
            { max: 35, name: "Superior Vena Cava / Trachea", vascular: "Extreme" },
            { max: 48, name: "Pleural Cavity (Left/Right Lungs)", vascular: "Extensive" },
            { max: 58, name: "Hepatic Liver / Gastric Stomach", vascular: "Maximal" },
            { max: 68, name: "Transverse Colon GI Tract", vascular: "High" },
            { max: 78, name: "Descending Small Intestines", vascular: "High" },
            { max: 92, name: "Femoral Arterial Pathways", vascular: "Extreme" },
            { max: 105, name: "Popliteal Vascular Nodes", vascular: "Moderate" },
            { max: 130, name: "Peripheral Vascular Extensions", vascular: "Low" }
        ]
    }
};

const Scanner = () => {
    const navigate = useNavigate();
    const [activeSys, setActiveSys] = useState('skeleton');
    const [isLocked, setIsLocked] = useState(false);
    const [coords, setCoords] = useState({ x: 0, y: 0 });
    const [targetName, setTargetName] = useState('Cranium (Skull)');
    const [vascular, setVascular] = useState('Low (Cortical)');
    
    // User profile state loaded from server
    const [insuranceId, setInsuranceId] = useState('Loading...');
    const [savedPartsCount, setSavedPartsCount] = useState(0);
    const [savedParts, setSavedParts] = useState([]);
    const [isSaved, setIsSaved] = useState(false);

    // Suggested Doctors
    const [suggestedDocs, setSuggestedDocs] = useState([]);
    const [bookingMessage, setBookingMessage] = useState('');
    const [bookingDocId, setBookingDocId] = useState(null);

    // DOM Elements references
    const viewportRef = useRef(null);
    const lensRef = useRef(null);
    const skinRef = useRef(null);
    const svgRefs = {
        skeleton: useRef(null),
        muscle: useRef(null),
        organs: useRef(null)
    };

    // Tab buttons offsets for sliding indicator
    const btnRefs = {
        skeleton: useRef(null),
        muscle: useRef(null),
        organs: useRef(null)
    };
    const [indicatorStyle, setIndicatorStyle] = useState({});

    // Fetch user profile
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/auth/profile');
                setInsuranceId(res.data.insuranceId || 'None');
                setSavedPartsCount(res.data.savedParts?.length || 0);
                setSavedParts(res.data.savedParts || []);
            } catch (err) {
                console.error('Failed to load profile', err);
                setInsuranceId('None');
            }
        };
        fetchProfile();
    }, []);

    // Update Tab Sliding Indicator
    useEffect(() => {
        const activeBtn = btnRefs[activeSys].current;
        if (activeBtn) {
            setIndicatorStyle({
                left: `${activeBtn.offsetLeft}px`,
                width: `${activeBtn.offsetWidth}px`
            });
        }
    }, [activeSys]);

    // Fetch Suggested Doctors based on active system and locked part
    useEffect(() => {
        if (!isLocked) {
            setSuggestedDocs([]);
            return;
        }

        const fetchSuggestions = async () => {
            let partLabel = 'Organs';
            if (activeSys === 'skeleton') partLabel = 'Bones';
            if (activeSys === 'muscle') partLabel = 'Muscle';
            if (activeSys === 'organs') {
                if (targetName.toLowerCase().includes('brain') || targetName.toLowerCase().includes('cerebral')) {
                    partLabel = 'Brain';
                }
            }
            try {
                const res = await api.get(`/doctors?parts=${partLabel}`);
                // Sort by rating desc, slice top 3
                const sorted = (res.data || []).sort((a, b) => b.rating - a.rating).slice(0, 3);
                setSuggestedDocs(sorted);
            } catch (err) {
                console.error('Failed to fetch suggested doctors', err);
            }
        };
        fetchSuggestions();
    }, [activeSys, targetName, isLocked]);

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        navigate('/login');
    };

    const handleMouseMove = (e) => {
        if (isLocked) return;

        const viewport = viewportRef.current;
        const lens = lensRef.current;
        const skin = skinRef.current;
        if (!viewport || !lens || !skin) return;

        const rect = viewport.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setCoords({ x: Math.round(x), y: Math.round(y) });

        lens.style.opacity = '1';
        lens.style.left = `${x}px`;
        lens.style.top = `${y}px`;

        const radius = 25;
        const maskVal = `radial-gradient(circle ${radius}px at ${x}px ${y}px, transparent 99%, #000 100%)`;
        skin.style.maskImage = maskVal;
        skin.style.webkitMaskImage = maskVal;

        const svgEl = svgRefs[activeSys].current;
        if (svgEl) {
            const pt = svgEl.createSVGPoint();
            pt.x = e.clientX;
            pt.y = e.clientY;
            const svgPoint = pt.matrixTransform(svgEl.getScreenCTM().inverse());
            const clampedSvgY = Math.max(0, Math.min(130, svgPoint.y));

            const dataset = anatomicalMapping[activeSys].zones;
            const match = dataset.find(zone => clampedSvgY <= zone.max) || dataset[dataset.length - 1];

            setTargetName(match.name);
            setVascular(match.vascular);
            setIsSaved(savedParts.includes(match.name));
        }
    };

    const handleMouseLeave = () => {
        if (!isLocked) {
            const lens = lensRef.current;
            const skin = skinRef.current;
            if (lens) lens.style.opacity = '0';
            if (skin) {
                skin.style.maskImage = 'none';
                skin.style.webkitMaskImage = 'none';
            }
        }
    };

    const handleViewportClick = () => {
        setIsLocked(!isLocked);
    };

    const addPartToProfile = async () => {
        if (!targetName || isSaved) return;

        try {
            const res = await api.put('/auth/profile/saved-parts', { part: targetName });
            setSavedParts(res.data.savedParts);
            setSavedPartsCount(res.data.savedParts.length);
            setIsSaved(true);
        } catch (err) {
            console.error('Failed to save part to profile', err);
        }
    };

    const switchSystem = (sys) => {
        if (isLocked) return;
        setActiveSys(sys);
        setIsSaved(savedParts.includes(anatomicalMapping[sys].zones[0].name));
    };

    const handleSuggestBook = async (doc) => {
        setBookingDocId(doc._id);
        setBookingMessage('');
        try {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(14, 0, 0, 0);

            await api.post('/appointments', {
                doctorId: doc._id,
                dateTime: tomorrow
            });
            setBookingMessage(`Booking request for ${doc.name} successfully submitted for admin approval! Navigate to the 'Session' tab to track status and pay once approved.`);
            setTimeout(() => setBookingMessage(''), 8000);
        } catch (err) {
            console.error('Failed to book doctor from suggestions', err);
            setBookingMessage(err.response?.data?.message || 'Failed to submit booking request.');
        } finally {
            setBookingDocId(null);
        }
    };

    return (
        <div className="scanner-page-body">
            <header className="app-header">
                <div className="logo-group">
                    <div className="logo-icon">D</div>
                    <div className="logo-text">Doctors' Call</div>
                </div>
                <nav>
                    <Link to="/scanner" className="active">Precision Anatomy Portal</Link>
                    <Link to="/hub">Doctors' Hub</Link>
                    <Link to="/session">Session</Link>
                    <Link to="/profile">Profile</Link>
                    <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }}>Logout</a>
                </nav>
            </header>

            <div style={{ textAlign: 'center', marginTop: '10px', marginBottom: '5px' }}>
                <h1 style={{ fontSize: '1.6rem', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#ffffff', marginBottom: '4px' }}>Precision Anatomy Portal</h1>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Hover to scan layers, click to lock coordinates & discover matching specialists</p>
            </div>

            <div className="menu">
                <div className="menu-indicator" style={indicatorStyle}></div>
                <button 
                    ref={btnRefs.skeleton}
                    className={`menu-btn ${activeSys === 'skeleton' ? 'active' : ''}`} 
                    onClick={() => switchSystem('skeleton')}
                >
                    BONE
                </button>
                <button 
                    ref={btnRefs.muscle}
                    className={`menu-btn ${activeSys === 'muscle' ? 'active' : ''}`} 
                    onClick={() => switchSystem('muscle')}
                >
                    MUSCLE
                </button>
                <button 
                    ref={btnRefs.organs}
                    className={`menu-btn ${activeSys === 'organs' ? 'active' : ''}`} 
                    onClick={() => switchSystem('organs')}
                >
                    ORGAN
                </button>
            </div>

            <div className="workspace">
                <div 
                    className="container" 
                    id="viewport" 
                    ref={viewportRef}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    onClick={handleViewportClick}
                >
                    <div 
                        className="lens-ring" 
                        id="lens" 
                        ref={lensRef}
                        style={{ borderColor: isLocked ? 'var(--accent-amber)' : 'var(--accent-red)' }}
                    ></div>

                    <div className={`internal-layer ${activeSys === 'skeleton' ? 'active' : ''}`} id="sys-skeleton">
                        <svg ref={svgRefs.skeleton} viewBox="0 0 100 130" fill="none" stroke="#e2e8f0" strokeWidth="1.8" strokeLinecap="round">
                            <path d="M42 20 C42 12, 58 12, 58 20 C58 24, 55 27, 50 27 Z" fill="#141414" />
                            <line x1="50" y1="27" x2="50" y2="75" strokeDasharray="1 2" strokeWidth="2.5" />
                            <path d="M34 34 L50 36 L66 34 M38 41 C42 39, 58 39, 62 41 M36 47 C42 45, 58 45, 64 47 M35 53 C42 51, 58 51, 65 53 M36 59 C42 57, 58 57, 64 59" />
                            <line x1="50" y1="36" x2="50" y2="60" strokeWidth="3" />
                            <path d="M36 75 C36 70, 64 70, 64 75 L60 83 H40 Z" fill="#141414" />
                            <line x1="33" y1="34" x2="25" y2="56" />
                            <line x1="25" y1="56" x2="18" y2="76" />
                            <line x1="67" y1="34" x2="75" y2="56" />
                            <line x1="75" y1="56" x2="82" y2="76" />
                            <line x1="41" y1="83" x2="38" y2="105" strokeWidth="2.2" />
                            <line x1="38" y1="105" x2="35" y2="128" />
                            <line x1="59" y1="83" x2="62" y2="105" strokeWidth="2.2" />
                            <line x1="62" y1="105" x2="65" y2="128" />
                        </svg>
                    </div>

                    <div className={`internal-layer ${activeSys === 'muscle' ? 'active' : ''}`} id="sys-muscle">
                        <svg ref={svgRefs.muscle} viewBox="0 0 100 130" fill="#ef4444" stroke="#7f1d1d" strokeWidth="0.8">
                            <path d="M43 20 C43 13, 57 13, 57 20 C57 26, 54 29, 50 29 Z" />
                            <path d="M44 29 L34 35 L36 38 L50 32 L64 38 L66 35 L56 29 Z" fill="#991b1b" />
                            <path d="M34 36 C42 36, 50 40, 50 51 C40 51, 34 46, 34 36 Z" />
                            <path d="M66 36 C58 36, 50 40, 50 51 C60 51, 66 46, 66 36 Z" />
                            <rect x="41" y="53" width="8" height="6" />
                            <rect x="51" y="53" width="8" height="6" />
                            <rect x="41" y="60" width="8" height="6" />
                            <rect x="51" y="60" width="8" height="6" />
                            <rect x="41" y="67" width="8" height="6" />
                            <rect x="51" y="67" width="8" height="6" />
                            <path d="M34 35 C31 35, 29 42, 27 54 L31 54 Z" />
                            <path d="M66 35 C69 35, 71 42, 73 54 L69 54 Z" />
                            <path d="M27 54 L19 76 H23 L31 54 Z" />
                            <path d="M73 54 L81 76 H77 L69 54 Z" />
                            <path d="M39 78 L35 105 H41 L43 78 Z" fill="#991b1b" />
                            <path d="M61 78 L65 105 H59 L57 78 Z" fill="#991b1b" />
                        </svg>
                    </div>

                    <div className={`internal-layer ${activeSys === 'organs' ? 'active' : ''}`} id="sys-organs">
                        <svg ref={svgRefs.organs} viewBox="0 0 100 130" fill="none" strokeWidth="1.2">
                            <path d="M44 19 C44 14, 56 14, 56 19 Z" fill="#f472b6" stroke="#be185d" />
                            <line x1="50" y1="24" x2="50" y2="34" stroke="#64748b" strokeDasharray="1 1" strokeWidth="2" />
                            <path d="M36 36 C36 32, 48 34, 48 48 C44 52, 36 46, 36 36 Z" fill="#fca5a5" stroke="#dc2626" />
                            <path d="M64 36 C64 32, 52 34, 52 48 C56 52, 64 46, 64 36 Z" fill="#fca5a5" stroke="#dc2626" />
                            <path d="M48 43 C48 41, 52 41, 52 44 C52 46, 48 48, 48 43 Z" fill="#ef4444" stroke="#991b1b" />
                            <path d="M36 51 L52 49 L49 56 L38 55 Z" fill="#b45309" stroke="#78350f" />
                            <path d="M51 52 Q58 50, 62 55 Q56 61, 49 57 Z" fill="#fbbf24" stroke="#d97706" />
                            <rect x="40" y="61" width="20" height="14" rx="3" fill="#34d399" stroke="#047857" opacity="0.9" />
                        </svg>
                    </div>

                    <div className="skin-layer" id="skin" ref={skinRef}>
                        <svg viewBox="0 0 100 130" fill="#334155">
                            <path d="M40 20 C40 10, 60 10, 60 20 C60 26, 56 28, 54 30 L53 34 C63 34, 70 38, 70 48 L76 74 C78 80, 74 82, 72 76 L66 54 L66 75 C66 84, 62 128, 58 128 C55 128, 53 105, 50 105 C47 105, 45 128, 42 128 C38 128, 34 84, 34 75 L34 54 L28 76 C26 82, 22 80, 24 74 L30 48 C30 38, 37 34, 47 34 L46 30 C44 28, 40 26, 40 20 Z" />
                        </svg>
                    </div>
                </div>

                <div className={`info-panel ${isLocked ? 'locked' : ''}`} id="panel">
                    <div className="panel-header">
                        <span className="info-tag" id="panel-tag">{isLocked ? "DATA EXTRACTED" : "SCANNER ACTIVE"}</span>
                        <span 
                            id="lock-status" 
                            style={{ 
                                fontSize: '0.75rem', 
                                fontWeight: 'bold', 
                                color: isLocked ? 'var(--accent-amber)' : 'var(--accent-red)' 
                            }}
                        >
                            {isLocked ? "LOCK CAPTURED" : "LIVE MATRIX"}
                        </span>
                    </div>

                    <div>
                        <h3 id="sys-title">{anatomicalMapping[activeSys].title}</h3>
                    </div>

                    <div className="target-display">
                        <h4>Identified Structure</h4>
                        <div id="target-name">{targetName}</div>
                    </div>

                    <div className="meta-box">
                        <div className="meta-line"><span>Coordinates</span><span id="meta-coords">X: {coords.x}px | Y: {coords.y}px</span></div>
                        <div className="meta-line"><span>Anatomy Layer</span><span id="meta-layer">{anatomicalMapping[activeSys].layerTag}</span></div>
                        <div className="meta-line"><span>Vascular Level</span><span id="meta-vascular">{vascular}</span></div>
                    </div>

                    <div className="meta-box" style={{ marginTop: '10px' }}>
                        <div className="meta-line"><span>Profile Insurance</span><span id="profile-insurance">{insuranceId}</span></div>
                        <div className="meta-line"><span>Saved Anatomy</span><span id="profile-saved-count">{savedPartsCount} item{savedPartsCount === 1 ? '' : 's'}</span></div>
                    </div>

                    <button 
                        id="profile-btn" 
                        className={`btn-profile ${isLocked && !isSaved ? 'active' : ''}`}
                        disabled={!isLocked || isSaved} 
                        onClick={addPartToProfile}
                    >
                        {isSaved ? "ADDED TO PROFILE!" : "ADD TO MY PROFILE"}
                    </button>

                    {/* Booking feedback */}
                    {bookingMessage && (
                        <div style={{ marginTop: '10px', fontSize: '0.8rem', padding: '6px', background: 'rgba(239,68,68,0.15)', border: '1px solid var(--accent-red)', borderRadius: '4px', textAlign: 'center' }}>
                            {bookingMessage}
                        </div>
                    )}

                    {/* Suggested Doctors Box */}
                    <div className="suggested-doctors-box" style={{ marginTop: '15px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '15px' }}>
                        <h4 style={{ fontSize: '0.75rem', color: 'var(--accent-red)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Suggested Specialists</h4>
                        {suggestedDocs.length === 0 ? (
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Click on a body part to select and suggest suitable doctors.</div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {suggestedDocs.map(doc => (
                                    <div key={doc._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '8px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                                        <div style={{ flex: 1, paddingRight: '10px' }}>
                                            <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#ffffff' }}>{doc.name}</div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{doc.specialty}</div>
                                            <div style={{ fontSize: '0.65rem', color: 'var(--accent-amber)', marginTop: '2px' }}>★ {doc.rating} • {doc.place} • ₹{doc.cost.toLocaleString('en-IN')}/hr</div>
                                        </div>
                                        <button 
                                            disabled={bookingDocId === doc._id}
                                            onClick={() => handleSuggestBook(doc)}
                                            style={{ padding: '6px 10px', background: 'var(--accent-red)', color: '#ffffff', fontSize: '0.7rem', fontWeight: 'bold', border: 'none', borderRadius: '6px', cursor: 'pointer', minWidth: '50px' }}
                                        >
                                            {bookingDocId === doc._id ? '...' : 'BOOK'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="status-footer" style={{ marginTop: '15px' }}>
                        <div className="status-dot"></div>
                        <span id="status-text">
                            {isLocked ? "SNAPSHOT HALTED. CLICK TO RESET." : "HOVER TO ITERATE TRACKING"}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Scanner;
