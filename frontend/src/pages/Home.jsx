import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/home.css';

const Home = () => {
    const navigate = useNavigate();

    return (
        <div className="home-container" style={{ minHeight: '100vh', background: '#0a0a0c', color: '#fff', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            {/* Top Navigation Bar */}
            <header className="app-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', background: '#111115', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', position: 'sticky', top: 0, zIndex: 100 }}>
                <div className="logo-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div className="logo-icon" style={{ background: '#ef4444', color: '#fff', width: '32px', height: '32px', borderRadius: '6px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', fontSize: '1.1rem' }}>D</div>
                    <div className="logo-text" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>MediCareBook</div>
                </div>
                <nav style={{ display: 'flex', gap: '25px' }}>
                    <Link to="/" style={{ color: '#ef4444', textDecoration: 'none', fontWeight: 'bold' }}>Home</Link>
                    <Link to="/login" style={{ color: '#a0a0b0', textDecoration: 'none', fontWeight: 'bold' }}>Login</Link>
                    <Link to="/register" style={{ color: '#a0a0b0', textDecoration: 'none', fontWeight: 'bold' }}>Register</Link>
                </nav>
            </header>

            {/* Hero Section */}
            <section className="hero-section" style={{ display: 'flex', padding: '80px 40px', maxWidth: '1200px', margin: '0 auto', alignItems: 'center', gap: '50px', flexWrap: 'wrap' }}>
                <div className="hero-text" style={{ flex: 1, minWidth: '300px' }}>
                    <h1 style={{ fontSize: '3rem', fontWeight: '900', lineHeight: '1.2', marginBottom: '20px', background: 'linear-gradient(90deg, #fff, #ef4444)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Streamlined Healthcare Consultation Booking
                    </h1>
                    <p style={{ fontSize: '1.1rem', color: '#a0a0b0', lineHeight: '1.6', marginBottom: '30px' }}>
                        Connect with approved medical specialists in your area. Schedule diagnostic visits, upload medical reports securely, and manage appointment workflows seamlessly.
                    </p>
                    <button 
                        onClick={() => navigate('/login')}
                        style={{ background: '#ef4444', border: 'none', color: '#fff', padding: '15px 30px', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)', transition: 'transform 0.2s, box-shadow 0.2s' }}
                        onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.5)'; }}
                        onMouseOut={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(239, 68, 68, 0.3)'; }}
                    >
                        Book your Doctor
                    </button>
                </div>
                <div className="hero-graphic" style={{ flex: 1, minWidth: '300px', display: 'flex', justifyContent: 'center', position: 'relative' }}>
                    <div style={{ width: '100%', height: '350px', background: 'radial-gradient(circle, rgba(239, 68, 68, 0.15) 0%, transparent 70%)', position: 'absolute', zIndex: 1 }}></div>
                    <div style={{ background: '#111115', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '40px', borderRadius: '20px', position: 'relative', zIndex: 2, boxShadow: '0 20px 40px rgba(0,0,0,0.4)', textAlign: 'center', width: '100%', maxWidth: '400px' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '10px' }}>🏥</div>
                        <h3 style={{ margin: '0 0 10px', fontSize: '1.4rem' }}>Clinical Registry</h3>
                        <p style={{ color: '#808090', margin: '0 0 20px', fontSize: '0.9rem' }}>Instant scheduling with 1000+ approved medical specialists across specialties.</p>
                        <div style={{ display: 'flex', justifyContent: 'space-around', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
                            <div>
                                <h4 style={{ margin: 0, color: '#ef4444' }}>1k+</h4>
                                <span style={{ fontSize: '0.75rem', color: '#808090' }}>Doctors</span>
                            </div>
                            <div>
                                <h4 style={{ margin: 0, color: '#ef4444' }}>24/7</h4>
                                <span style={{ fontSize: '0.75rem', color: '#808090' }}>Support</span>
                            </div>
                            <div>
                                <h4 style={{ margin: 0, color: '#ef4444' }}>100%</h4>
                                <span style={{ fontSize: '0.75rem', color: '#808090' }}>Verified</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* About Us Section */}
            <section className="about-section" style={{ background: '#111115', borderTop: '1px solid rgba(255, 255, 255, 0.08)', padding: '80px 40px' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                        <h2 style={{ fontSize: '2rem', margin: '0 0 10px' }}>About MediCareBook</h2>
                        <p style={{ color: '#808090', maxWidth: '600px', margin: '0 auto' }}>An innovative healthcare connection platform bridging the gap between patients, clinical providers, and administrators.</p>
                    </div>

                    <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: '250px', background: '#0a0a0c', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '12px', padding: '30px' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '15px' }}>🔍</div>
                            <h3 style={{ margin: '0 0 10px', fontSize: '1.2rem' }}>Specialist Directory</h3>
                            <p style={{ color: '#808090', margin: 0, fontSize: '0.9rem', lineHeight: '1.5' }}>Search and filter clinical specialists by specialization, location, timings, and consulting fees.</p>
                        </div>
                        <div style={{ flex: 1, minWidth: '250px', background: '#0a0a0c', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '12px', padding: '30px' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '15px' }}>📅</div>
                            <h3 style={{ margin: '0 0 10px', fontSize: '1.2rem' }}>Easy Booking</h3>
                            <p style={{ color: '#808090', margin: 0, fontSize: '0.9rem', lineHeight: '1.5' }}>Choose preferred dates and slots, and upload relevant medical history reports directly to the doctor's review queue.</p>
                        </div>
                        <div style={{ flex: 1, minWidth: '250px', background: '#0a0a0c', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '12px', padding: '30px' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '15px' }}>🔒</div>
                            <h3 style={{ margin: '0 0 10px', fontSize: '1.2rem' }}>Role-Based Access</h3>
                            <p style={{ color: '#808090', margin: 0, fontSize: '0.9rem', lineHeight: '1.5' }}>Verified platforms logins with role-based JWT tokens, password hashing, and admin approval workflows.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer style={{ padding: '30px 40px', background: '#0a0a0c', borderTop: '1px solid rgba(255, 255, 255, 0.05)', textAlign: 'center', color: '#808090', fontSize: '0.85rem' }}>
                <p style={{ margin: 0 }}>&copy; 2026 MediCareBook Inc. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Home;
