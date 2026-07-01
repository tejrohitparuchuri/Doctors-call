import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import '../styles/purchase.css';

const Purchase = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { doctor, appointmentId } = location.state || {};

    const [consultationType, setConsultationType] = useState('online');
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [upiId, setUpiId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    if (!doctor) {
        return (
            <div className="purchase-page-body" style={{ justifyContent: 'center', alignItems: 'center', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h2>No Session Matrix Selected</h2>
                <Link to="/hub" style={{ color: 'var(--accent-red)', fontWeight: 'bold' }}>Return to Doctors' Hub</Link>
            </div>
        );
    }

    // Base conversion for rupees
    const baseFee = doctor.cost;
    const bookingFee = 250; // Flat platform admin processing fee in ₹
    const gstRate = 0.18; // 18% medical service tax
    const gstAmount = Math.round(baseFee * gstRate);
    const totalAmount = baseFee + bookingFee + gstAmount;

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (appointmentId) {
                // User is paying for a pre-approved pending appointment
                await api.post(`/appointments/${appointmentId}/pay`, {
                    consultationType
                });
            } else {
                // Fallback: create and confirm immediately
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                tomorrow.setHours(14, 0, 0, 0);

                await api.post('/appointments', {
                    doctorId: doctor._id,
                    dateTime: tomorrow,
                    consultationType
                });
            }

            setSuccessMessage(`Payment Successful! Connecting to your consultation view...`);
            setTimeout(() => {
                navigate('/call', { state: { doctor, consultationType } });
            }, 2500);
        } catch (err) {
            console.error('Payment booking failed', err);
            setError(err.response?.data?.message || 'Payment verification failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="purchase-page-body">
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

            <div className="purchase-container">
                <div className="purchase-card">
                    <div className="purchase-header">
                        <h2>Secure Medical Transaction</h2>
                        <p>Complete payment authorization to secure your diagnostic slot</p>
                    </div>

                    {successMessage && (
                        <div style={{ padding: '15px', background: 'rgba(52, 211, 153, 0.15)', border: '1px solid #34d399', borderRadius: '10px', color: '#fff', fontWeight: '600', marginBottom: '20px' }}>
                            {successMessage}
                        </div>
                    )}

                    {error && (
                        <div style={{ padding: '15px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--accent-red)', borderRadius: '10px', color: '#fff', fontWeight: '600', marginBottom: '20px' }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handlePaymentSubmit}>
                        <div className="form-group">
                            <label htmlFor="consultType">Consultation Protocol</label>
                            <select 
                                id="consultType"
                                value={consultationType}
                                onChange={(e) => setConsultationType(e.target.value)}
                            >
                                <option value="online">Online Video Consult (Tele-Presence)</option>
                                <option value="offline">Offline Physical Consult (In-Person Clinic)</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Authorization Method</label>
                            <div className="payment-options">
                                <div 
                                    className={`payment-tab ${paymentMethod === 'card' ? 'active' : ''}`}
                                    onClick={() => setPaymentMethod('card')}
                                >
                                    Debit / Credit Card
                                </div>
                                <div 
                                    className={`payment-tab ${paymentMethod === 'upi' ? 'active' : ''}`}
                                    onClick={() => setPaymentMethod('upi')}
                                >
                                    UPI (BHIM/PhonePe/GPay)
                                </div>
                            </div>
                        </div>

                        {paymentMethod === 'card' ? (
                            <div>
                                <div className="form-group">
                                    <label htmlFor="cardNum">Card Number</label>
                                    <input 
                                        type="text" 
                                        id="cardNum" 
                                        required 
                                        placeholder="4111 2222 3333 4444"
                                        value={cardNumber}
                                        onChange={(e) => setCardNumber(e.target.value)}
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '15px' }}>
                                    <div className="form-group" style={{ flex: 1.2 }}>
                                        <label htmlFor="expiry">Expiration Date</label>
                                        <input 
                                            type="text" 
                                            id="expiry" 
                                            required 
                                            placeholder="MM/YY"
                                            value={expiry}
                                            onChange={(e) => setExpiry(e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group" style={{ flex: 0.8 }}>
                                        <label htmlFor="cvv">Security Code (CVV)</label>
                                        <input 
                                            type="password" 
                                            id="cvv" 
                                            required 
                                            maxLength="3"
                                            placeholder="•••"
                                            value={cvv}
                                            onChange={(e) => setCvv(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="form-group">
                                <label htmlFor="upi">UPI Address</label>
                                <input 
                                    type="text" 
                                    id="upi" 
                                    required 
                                    placeholder="username@okhdfcbank"
                                    value={upiId}
                                    onChange={(e) => setUpiId(e.target.value)}
                                />
                            </div>
                        )}

                        <button type="submit" className="btn-pay" disabled={loading}>
                            {loading ? 'AUTHORIZING TRANSACTION...' : `CONFIRM & PAY ₹${totalAmount.toLocaleString('en-IN')}`}
                        </button>
                    </form>
                </div>

                <div className="summary-card">
                    <h3 style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px', color: 'var(--accent-red)' }}>Session Matrix Summary</h3>
                    
                    <div style={{ marginBottom: '20px' }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{doctor.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{doctor.specialty}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>🏢 {doctor.hospitalName}</div>
                    </div>

                    <div className="summary-line">
                        <span>Hourly Session Rate</span>
                        <span>₹{baseFee.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="summary-line">
                        <span>Platform Processing</span>
                        <span>₹{bookingFee}</span>
                    </div>
                    <div className="summary-line">
                        <span>Medical GST (18%)</span>
                        <span>₹{gstAmount}</span>
                    </div>

                    <div className="summary-total">
                        <span>Total Cost</span>
                        <span>₹{totalAmount.toLocaleString('en-IN')}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Purchase;
