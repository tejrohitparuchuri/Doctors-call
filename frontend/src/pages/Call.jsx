import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import '../styles/call.css';

const cityCoordinates = {
    'Delhi': 'bbox=77.10%2C28.55%2C77.30%2C28.75&layer=mapnik',
    'Mumbai': 'bbox=72.75%2C18.90%2C72.95%2C19.10&layer=mapnik',
    'Pune': 'bbox=73.75%2C18.45%2C73.95%2C18.65&layer=mapnik',
    'Bangalore': 'bbox=77.50%2C12.85%2C77.70%2C13.05&layer=mapnik',
    'Hyderabad': 'bbox=78.35%2C17.30%2C78.55%2C17.50&layer=mapnik',
    'Ahmedabad': 'bbox=72.50%2C22.95%2C72.70%2C23.15&layer=mapnik',
    'Kolkata': 'bbox=88.30%2C22.50%2C88.50%2C22.70&layer=mapnik'
};

const directionSteps = {
    'Delhi': [
        'Exit Metro station gate 3 and turn right towards Ring Road.',
        'Proceed straight for 500 meters, past the central park entrance.',
        'The clinic is situated inside Apollo Medical Centre on the 2nd Floor.'
    ],
    'Mumbai': [
        'Head south on Western Express Highway past the flyover.',
        'Take the exit towards Bandra Kurla Complex (BKC).',
        'Drive 300 meters, the diagnostic facility is inside building C on your left.'
    ],
    'Pune': [
        'Drive down Senapati Bapat Road towards University circle.',
        'Turn left at the junction after the mall.',
        'The clinic is situated on the 3rd Floor of the Apex Care Building.'
    ],
    'Bangalore': [
        'From Outer Ring Road, head towards Sarjapur Road junction.',
        'Take a U-turn after the business park complex.',
        'Look for KIMS Outpost building next to the central library.'
    ],
    'Hyderabad': [
        'Proceed past HITEC City metro pillars towards Mindspace junction.',
        'Turn left at the cyber gateway park side-road.',
        'Enter Global Medical Hub tower A, clinic is on suite 402.'
    ],
    'Ahmedabad': [
        'Drive down SG Highway past the main bridge road.',
        'Take the service road towards the corporate sector.',
        'Clinic is on ground floor of the newly built AIMS Plaza.'
    ],
    'Kolkata': [
        'Head towards Salt Lake sector V main bypass road.',
        'Turn right past the IT park office tower block.',
        'The facility is located on Fortis Care center level 1.'
    ]
};

const Call = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { doctor, consultationType = 'online' } = location.state || {};

    const [isMuted, setIsMuted] = useState(false);
    const [isVideoMuted, setIsVideoMuted] = useState(false);
    const [stream, setStream] = useState(null);
    const [mediaError, setMediaError] = useState('');

    const localVideoRef = useRef(null);

    // Initialize Camera and Microphone Stream
    useEffect(() => {
        if (consultationType === 'online') {
            const getMedia = async () => {
                try {
                    const mediaStream = await navigator.mediaDevices.getUserMedia({
                        video: true,
                        audio: true
                    });
                    setStream(mediaStream);
                    if (localVideoRef.current) {
                        localVideoRef.current.srcObject = mediaStream;
                    }
                } catch (err) {
                    console.error('Camera/Mic permission failed:', err);
                    setMediaError('Unable to access camera or microphone. Please verify site permissions.');
                }
            };
            getMedia();
        }

        // Clean up media tracks when leaving page
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [consultationType]);

    const handleToggleMute = () => {
        if (stream) {
            const audioTrack = stream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMuted(!audioTrack.enabled);
            }
        }
    };

    const handleToggleVideo = () => {
        if (stream) {
            const videoTrack = stream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoMuted(!videoTrack.enabled);
            }
        }
    };

    const handleEndCall = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        navigate('/hub');
    };

    if (!doctor) {
        return (
            <div className="call-page-body" style={{ justifyContent: 'center', alignItems: 'center', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h2>No Session Matrix Selected</h2>
                <Link to="/hub" style={{ color: 'var(--accent-red)', fontWeight: 'bold' }}>Return to Doctors' Hub</Link>
            </div>
        );
    }

    const mapBbox = cityCoordinates[doctor.place] || cityCoordinates['Mumbai'];
    const steps = directionSteps[doctor.place] || directionSteps['Mumbai'];

    return (
        <div className="call-page-body">
            <header className="app-header">
                <div className="logo-group">
                    <div className="logo-icon">D</div>
                    <div className="logo-text">Doctors' Call</div>
                </div>
                <nav>
                    <Link to="/scanner">Precision Anatomy Portal</Link>
                    <Link to="/hub">Doctors' Hub</Link>
                    <Link to="/session">Session</Link>
                    <Link to="/profile">Profile</Link>
                    <a href="#" onClick={(e) => { e.preventDefault(); localStorage.removeItem('token'); navigate('/login'); }}>Logout</a>
                </nav>
            </header>

            <div className="call-container">
                <div style={{ width: '100%' }}>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: 'bold' }}>
                        {consultationType === 'online' ? 'Active Consultation Matrix' : 'Offline Navigation Portal'}
                    </h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
                        Consulting {doctor.name} ({doctor.specialty})
                    </p>
                </div>

                <div className="consultation-panel">
                    {/* Tele-Presence Video Panel */}
                    {consultationType === 'online' ? (
                        <div className="video-section">
                            {/* Doctor Avatar Stream */}
                            <div className="doctor-stream" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '15px' }}>
                                <div style={{
                                    width: '120px',
                                    height: '120px',
                                    borderRadius: '50%',
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    border: '2px solid var(--accent-red)',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    fontSize: '2.5rem',
                                    fontWeight: 'bold',
                                    color: 'var(--accent-red)'
                                }}>
                                    {doctor.initials}
                                </div>
                                <div style={{ fontSize: '1.1rem', fontWeight: '600' }}>{doctor.name}</div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Connecting tele-presence stream...</div>
                            </div>

                            {/* Local Camera Stream */}
                            <div className="local-stream-container">
                                {mediaError ? (
                                    <div style={{ fontSize: '0.7rem', padding: '10px', color: 'var(--accent-red)', textAlign: 'center' }}>
                                        {mediaError}
                                    </div>
                                ) : (
                                    <video 
                                        ref={localVideoRef}
                                        className="local-video"
                                        autoPlay 
                                        playsInline 
                                        muted 
                                    />
                                )}
                            </div>

                            {/* Call Controls */}
                            <div className="call-controls">
                                <button 
                                    className={`control-btn mute-audio ${isMuted ? 'muted' : ''}`}
                                    onClick={handleToggleMute}
                                    title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
                                >
                                    🎙️
                                </button>
                                <button 
                                    className={`control-btn mute-video ${isVideoMuted ? 'muted' : ''}`}
                                    onClick={handleToggleVideo}
                                    title={isVideoMuted ? 'Start Camera' : 'Stop Camera'}
                                >
                                    📷
                                </button>
                                <button 
                                    className="control-btn end-call"
                                    onClick={handleEndCall}
                                    title="End Consultation"
                                >
                                    🛑
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="video-section" style={{ background: '#111', display: 'flex', flexDirection: 'column', gap: '10px', padding: '20px' }}>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--accent-red)' }}>Clinic Consultation Protocol</div>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textAlign: 'center', maxWidth: '400px' }}>
                                You have selected an offline consultation slot. Please use the navigation coordinates in the side panel to proceed to {doctor.hospitalName || 'the clinic'}.
                            </p>
                            <button 
                                onClick={() => navigate('/hub')}
                                style={{ marginTop: '20px', padding: '12px 24px', background: 'var(--accent-red)', color: '#ffffff', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                            >
                                BACK TO HUB
                            </button>
                        </div>
                    )}

                    {/* Navigation Map Panel */}
                    <div className="map-section">
                        <h3 style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--accent-red)' }}>
                            Clinic Location Map
                        </h3>
                        
                        <div className="map-frame-container">
                            <iframe 
                                title="Clinic Location Map"
                                width="100%" 
                                height="100%" 
                                frameBorder="0" 
                                scrolling="no" 
                                marginHeight="0" 
                                marginWidth="0" 
                                src={`https://www.openstreetmap.org/export/embed.html?${mapBbox}`}
                                style={{ border: 'none' }}
                            />
                        </div>

                        <div className="directions-box">
                            <h4 style={{ fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '10px', color: 'var(--accent-amber)' }}>
                                Route Guidance ({doctor.place})
                            </h4>
                            {steps.map((step, idx) => (
                                <div className="direction-step" key={idx}>
                                    <div className="step-num">{idx + 1}</div>
                                    <div>{step}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Call;
