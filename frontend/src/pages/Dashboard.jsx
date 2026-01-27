import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BackButton from '../components/BackButton';
import './Dashboard.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        confirmed: 0,
        pending: 0
    });
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showFeedback, setShowFeedback] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' or 'feedback'
    const [feedbackData, setFeedbackData] = useState({ rating: 5, comments: '' });

    const userEmail = localStorage.getItem('userEmail');
    const userId = localStorage.getItem('userId');

    const getSlotLabel = (start, end) => {
        if (start === '08:00' && end === '23:30') return 'Whole Day';
        if (start === '08:00' && end === '15:00') return 'Morning / Lunch';
        if (start === '17:00' && end === '23:30') return 'Evening Party';
        return `${start} - ${end}`;
    };

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const token = localStorage.getItem('userToken');
                const response = await fetch('http://127.0.0.1:5000/api/bookings', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log("Bookings Data:", data); // Debugging
                    setBookings(data);

                    // Calculate stats
                    const statsUpdate = data.reduce((acc, curr) => {
                        acc.total++;
                        acc[curr.status]++;
                        return acc;
                    }, { total: 0, confirmed: 0, pending: 0, rejected: 0 });

                    setStats(statsUpdate);
                } else if (response.status === 401) {
                    localStorage.clear();
                    navigate('/login');
                }
            } catch (error) {
                console.error("Error fetching bookings:", error);
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchBookings();
        } else {
            navigate('/login');
        }

        // Sync tab with URL
        const params = new URLSearchParams(location.search);
        if (params.get('tab') === 'feedback') {
            setActiveTab('feedback');
        } else {
            setActiveTab('dashboard');
        }
    }, [userId, navigate, location.search]);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const handleFeedbackSubmit = async () => {
        // if (!selectedBooking) return; // Removed to allow general feedback
        try {
            const token = localStorage.getItem('userToken');
            const payload = {
                rating: feedbackData.rating,
                comments: feedbackData.comments
            };

            // Only add booking_id if it's specific booking feedback
            if (activeTab === 'dashboard' && selectedBooking) {
                payload.booking_id = selectedBooking.id;
            }

            const response = await fetch('http://127.0.0.1:5000/api/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                alert("Thank you for your valuable feedback!");
                setShowFeedback(false);
                setFeedbackData({ rating: 5, comments: '' });
                setSelectedBooking(null);
                if (activeTab === 'feedback') {
                    // Optional: Reset form or show success state
                }
            } else {
                const data = await response.json();
                alert(data.error || "Failed to submit feedback");
            }
        } catch (error) {
            console.error("Feedback Error:", error);
            alert("Error submitting feedback");
        }
    };

    return (
        <div className="dashboard-page-content" style={{ padding: '2rem' }}>

            <header className="dashboard-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <BackButton />
                    <div className="welcome-text">
                        <h1>Welcome back!</h1>
                        <p>{userEmail}</p>
                    </div>
                </div>
                <Link to="/booking" className="btn-primary">
                    + Book a Venue
                </Link>
            </header>

            {activeTab === 'feedback' ? (
                <div className="feedback-section-container" style={{ maxWidth: '600px', margin: '0 auto' }}>
                    <h2>We Value Your Feedback</h2>
                    <p style={{ color: '#666', marginBottom: '2rem' }}>Let us know about your experience with Nadsathiramahal. Your suggestions help us improve.</p>

                    <div className="feedback-form-card" style={{ background: 'white', padding: '2rem', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>How would you rate us?</label>
                            <div className="star-rating" style={{ display: 'flex', gap: '10px', fontSize: '2rem', cursor: 'pointer' }}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <span
                                        key={star}
                                        onClick={() => setFeedbackData({ ...feedbackData, rating: star })}
                                        style={{ color: star <= feedbackData.rating ? '#fbbf24' : '#e5e7eb', transition: 'color 0.2s' }}
                                    >
                                        ★
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Your Comments</label>
                            <textarea
                                value={feedbackData.comments}
                                onChange={(e) => setFeedbackData({ ...feedbackData, comments: e.target.value })}
                                placeholder="What did you like? What can we do better?"
                                rows="5"
                                style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid #e5e7eb', fontFamily: 'inherit' }}
                            />
                        </div>

                        <button
                            className="btn-primary"
                            onClick={handleFeedbackSubmit}
                            style={{ width: '100%', justifyContent: 'center' }}
                        >
                            Submit Feedback
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    {/* Stats Summary */}
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon" style={{ background: '#dbeafe', color: '#1e40af' }}>📅</div>
                            <div className="stat-info">
                                <h3>Total Bookings</h3>
                                <p>{stats.total}</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon" style={{ background: '#dcfce7', color: '#15803d' }}>✅</div>
                            <div className="stat-info">
                                <h3>Confirmed</h3>
                                <p>{stats.confirmed}</p>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon" style={{ background: '#fef9c3', color: '#a16207' }}>⏳</div>
                            <div className="stat-info">
                                <h3>Awaiting Approval</h3>
                                <p>{stats.pending}</p>
                            </div>
                        </div>
                    </div>

                    {/* Bookings List */}
                    <section className="bookings-section">
                        <div className="section-header">
                            <h2>My Recent Bookings</h2>
                        </div>

                        {loading ? (
                            <div className="empty-state">Loading your bookings...</div>
                        ) : bookings.length > 0 ? (
                            <table className="bookings-table">
                                <thead>
                                    <tr>
                                        <th>Hall</th>
                                        <th>Event Date</th>
                                        <th>Status</th>
                                        <th>Price</th>
                                        <th>Payment</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.map((booking) => (
                                        <tr key={booking.id}>
                                            <td style={{ fontWeight: 600 }}>{booking.hall_name}</td>
                                            <td>{new Date(booking.event_date).toLocaleDateString()}</td>
                                            <td>
                                                <span className={`status-badge status-${booking.status}`}>
                                                    {booking.status === 'pending' ? 'Awaiting Approval' : booking.status}
                                                </span>
                                            </td>
                                            <td style={{ fontWeight: 700 }}>LKR {booking.total_price?.toLocaleString()}</td>
                                            <td>
                                                <span style={{
                                                    padding: '4px 10px',
                                                    borderRadius: '50px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 700,
                                                    background: booking.payment_status === 'paid' ? '#d1fae5' : '#fee2e2',
                                                    color: booking.payment_status === 'paid' ? '#059669' : '#b91c1c'
                                                }}>
                                                    {booking.payment_status?.toUpperCase()}
                                                </span>
                                            </td>
                                            <td>
                                                <button className="view-details-btn" onClick={() => setSelectedBooking(booking)}>
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="empty-state">
                                <p>You haven't made any bookings yet.</p>
                                <Link to="/booking" style={{ color: '#800000', fontWeight: '600' }}>
                                    Start your first booking now →
                                </Link>
                            </div>
                        )}
                    </section>
                </>
            )}

            {selectedBooking && (
                <div className="modal-overlay" onClick={() => setSelectedBooking(null)}>
                    <div className="booking-details-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-content-wrapper">
                            <h2 className="modal-title">{selectedBooking.hall_name}</h2>
                            <p className="modal-date">Event on {new Date(selectedBooking.event_date).toLocaleDateString()}</p>

                            <div className="detail-section">
                                <div className="detail-item">
                                    <span className="detail-label">Time Slot</span>
                                    <div className="detail-value-box" style={{ fontSize: '1.2rem', fontWeight: 600, color: '#0369a1' }}>
                                        {getSlotLabel(selectedBooking.start_time, selectedBooking.end_time)}
                                    </div>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Total Amount</span>
                                    <div className="detail-value-box" style={{ fontSize: '1.2rem', fontWeight: 800, color: '#4D0000' }}>
                                        LKR {selectedBooking.total_price?.toLocaleString()}
                                    </div>
                                </div>
                                <div className="detail-item">
                                    <span className="detail-label">Payment Status</span>
                                    <div className={`status-badge status-${selectedBooking.payment_status === 'paid' ? 'confirmed' : 'rejected'}`} style={{ display: 'inline-block' }}>
                                        {selectedBooking.payment_status?.toUpperCase()}
                                    </div>
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button className="btn-cancel" onClick={() => setSelectedBooking(null)}>Close</button>
                                {selectedBooking.payment_status === 'pending' && selectedBooking.status !== 'rejected' && (
                                    <button
                                        className="btn-primary"
                                        onClick={() => navigate('/booking', { state: { step: 3, bookingId: selectedBooking.id } })}
                                        style={{ margin: 0 }}
                                    >
                                        Complete Payment Now
                                    </button>
                                )}
                                {new Date(selectedBooking.event_date) < new Date() && selectedBooking.status === 'confirmed' && (
                                    <button
                                        className="btn-primary"
                                        style={{ background: '#d97706', margin: 0 }}
                                        onClick={() => setShowFeedback(true)}
                                    >
                                        ⭐ Give Feedback
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )
            }

            {
                showFeedback && (
                    <div className="modal-overlay" onClick={() => setShowFeedback(false)}>
                        <div className="booking-details-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                            <div className="modal-content-wrapper">
                                <h2 className="modal-title">Rate Your Experience</h2>
                                <p className="modal-date">How was your event at {selectedBooking?.hall_name}?</p>

                                <div className="form-group" style={{ margin: '1.5rem 0' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Rating</label>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <button
                                                key={star}
                                                onClick={() => setFeedbackData({ ...feedbackData, rating: star })}
                                                style={{
                                                    fontSize: '1.5rem',
                                                    background: 'none',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    color: star <= feedbackData.rating ? '#fbbf24' : '#d1d5db'
                                                }}
                                            >
                                                ★
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Comments</label>
                                    <textarea
                                        rows="4"
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                                        value={feedbackData.comments}
                                        onChange={(e) => setFeedbackData({ ...feedbackData, comments: e.target.value })}
                                        placeholder="Share your thoughts..."
                                    />
                                </div>

                                <div className="modal-actions">
                                    <button className="btn-cancel" onClick={() => setShowFeedback(false)}>Cancel</button>
                                    <button className="btn-primary" onClick={handleFeedbackSubmit}>Submit Review</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default Dashboard;
