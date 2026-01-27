import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import BackButton from '../components/BackButton';
import './Admin.css';

const Admin = () => {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        confirmed: 0,
        rejected: 0
    });
    const [staffList, setStaffList] = useState([]);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedBookingForStaff, setSelectedBookingForStaff] = useState(null);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
    const [assignmentData, setAssignmentData] = useState({
        staff_id: '',
        task: ''
    });

    // Calendar Modal State
    const [selectedDayBookings, setSelectedDayBookings] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);

    // Calendar Helpers
    const getCalendarStatus = (date) => {
        const dateStr = date.toISOString().split('T')[0];
        const bookingsForDay = bookings.filter(b => b.event_date.startsWith(dateStr) && b.status !== 'rejected');
        if (bookingsForDay.length === 0) return 'available';
        const hasFull = bookingsForDay.some(b => b.start_time === '08:00' && b.end_time === '23:30');
        if (hasFull) return 'full';
        return 'partial';
    };

    const getSlotLabel = (start, end) => {
        if (start === '08:00' && end === '23:30') return 'Whole Day';
        if (start === '08:00' && end === '15:00') return 'Morning / Lunch';
        if (start === '17:00' && end === '23:30') return 'Evening Party';
        return `${start} - ${end}`; // Fallback
    };

    useEffect(() => {
        if (viewMode === 'feedback') {
            const fetchFeedback = async () => {
                try {
                    const token = localStorage.getItem('userToken');
                    const response = await fetch('http://127.0.0.1:5000/api/admin/feedback', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (response.ok) {
                        const data = await response.json();
                        setFeedbackList(data);
                    }
                } catch (error) {
                    console.error("Error fetching feedback:", error);
                }
            };
            fetchFeedback();
        }
    }, [viewMode]);

    const handleDateClick = (date) => {
        const dateStr = date.toISOString().split('T')[0];
        const dayBookings = bookings.filter(b => b.event_date.startsWith(dateStr) && b.status !== 'rejected');

        if (dayBookings.length > 0) {
            setSelectedDate(date);
            setSelectedDayBookings(dayBookings);
            // setShowDayDetails(true); // Removed in favor of side panel
        }
    };

    const userEmail = localStorage.getItem('userEmail');
    const userId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('userRole');

    useEffect(() => {
        // Security check: ensure only admin can access
        if (!userId || userRole !== 'admin') {
            navigate('/login');
            return;
        }
        fetchBookings();
        fetchStaff();
    }, [userId, userRole, navigate]);

    const fetchStaff = async () => {
        try {
            const token = localStorage.getItem('userToken');
            const response = await fetch('http://127.0.0.1:5000/api/staff/list', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setStaffList(data);
            }
        } catch (error) {
            console.error("Error fetching staff:", error);
        }
    };

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('userToken');
            const response = await fetch('http://127.0.0.1:5000/api/bookings', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                // Sort bookings by date (newest first)
                const sortedData = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                setBookings(sortedData);

                // Calculate stats
                const statsUpdate = sortedData.reduce((acc, curr) => {
                    acc.total++;
                    acc[curr.status]++;
                    return acc;
                }, { total: 0, pending: 0, confirmed: 0, rejected: 0 });

                setStats(statsUpdate);
            } else if (response.status === 401) {
                localStorage.clear();
                navigate('/login');
            }
        } catch (error) {
            console.error("Error fetching bookings:", error);
            alert("Connection error. Could not fetch bookings.");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (bookingId, newStatus) => {
        const confirmMessage = newStatus === 'confirmed'
            ? "Confirming this booking will send an automated Gmail notification to the customer. Proceed?"
            : "Are you sure you want to reject this booking?";

        if (!window.confirm(confirmMessage)) return;

        try {
            const token = localStorage.getItem('userToken');
            const response = await fetch(`http://127.0.0.1:5000/api/bookings/${bookingId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            const data = await response.json();

            if (response.ok) {
                alert(`Booking ${newStatus} successfully!${newStatus === 'confirmed' ? ' Notification sent.' : ''}`);
                // Refresh data
                fetchBookings();
            } else {
                alert(data.error || "Failed to update booking status.");
            }
        } catch (error) {
            alert("Connection error. Check if the server is running.");
        }
    };

    const handleAssignStaff = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('userToken');
            const response = await fetch('http://127.0.0.1:5000/api/assignments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    booking_id: selectedBookingForStaff.id,
                    staff_id: assignmentData.staff_id,
                    task: assignmentData.task
                })
            });

            if (response.ok) {
                alert("Staff assigned successfully!");
                setShowAssignModal(false);
                setAssignmentData({ staff_id: '', task: '' });
            } else {
                alert("Failed to assign staff.");
            }
        } catch (error) {
            alert("Connection error.");
        }
    };

    // Logout is now handled by Global Sidebar

    return (
        <div className="admin-page-content" style={{ padding: '2rem' }}>
            <header className="admin-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <BackButton style={{ color: 'inherit' }} />
                    <div>
                        <h1>Admin Dashboard</h1>
                        <p>Welcome back, Administrator ({userEmail})</p>
                    </div>
                </div>
            </header>

            {/* Stats Summary */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#dbeafe', color: '#1e40af' }}>📊</div>
                    <div className="stat-info">
                        <h3>Total</h3>
                        <p>{stats.total}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#fef9c3', color: '#a16207' }}>⏳</div>
                    <div className="stat-info">
                        <h3>Pending</h3>
                        <p>{stats.pending}</p>
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
                    <div className="stat-icon" style={{ background: '#fee2e2', color: '#b91c1c' }}>❌</div>
                    <div className="stat-info">
                        <h3>Rejected</h3>
                        <p>{stats.rejected}</p>
                    </div>
                </div>
            </div>

            {/* Bookings Table */}
            <section className="bookings-section">
                <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2>All Reservations</h2>
                    <div className="view-toggle">
                        <button
                            className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                            onClick={() => setViewMode('list')}
                        >
                            📜 List
                        </button>
                        <button
                            className={`toggle-btn ${viewMode === 'calendar' ? 'active' : ''}`}
                            onClick={() => setViewMode('calendar')}
                        >
                            📅 Calendar
                        </button>
                        <button
                            className={`toggle-btn ${viewMode === 'feedback' ? 'active' : ''}`}
                            onClick={() => setViewMode('feedback')}
                        >
                            💬 Feedback
                        </button>
                    </div>
                </div>

                {viewMode === 'feedback' ? (
                    <div className="feedback-view">
                        <h3 style={{ marginBottom: '1rem', color: '#666' }}>Customer Reviews & Suggestions</h3>
                        {feedbackList.length > 0 ? (
                            <div className="feedback-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                                {feedbackList.map(item => (
                                    <div key={item.id} style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                            <div style={{ fontWeight: 'bold', color: '#1e293b' }}>{item.user_name}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{new Date(item.created_at).toLocaleDateString()}</div>
                                        </div>
                                        <div style={{ color: '#fbbf24', fontSize: '1.2rem', marginBottom: '0.8rem' }}>
                                            {'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}
                                        </div>
                                        <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.5', background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                                            "{item.comments}"
                                        </p>
                                        <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem' }}>
                                            {item.hall_name !== 'General Feedback' ? (
                                                <span>Ref: <strong>{item.hall_name}</strong> on {item.event_date}</span>
                                            ) : (
                                                <span style={{ color: '#059669', fontWeight: 'bold' }}>General Feedback</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">No feedback received yet.</div>
                        )}
                    </div>
                ) : viewMode === 'calendar' ? (
                    <div className="admin-calendar-container" style={{ display: 'flex', gap: '2rem', height: '600px' }}>
                        {/* Left Side: Calendar */}
                        <div className="calendar-wrapper" style={{ flex: 2, background: 'white', padding: '1.5rem', borderRadius: '15px', overflowY: 'auto' }}>
                            <DatePicker
                                inline
                                onChange={handleDateClick}
                                highlightDates={[]}
                                dayClassName={(date) => {
                                    const status = getCalendarStatus(date);
                                    return `calendar-day-${status}`;
                                }}
                                renderDayContents={(day, date) => {
                                    const status = getCalendarStatus(date);
                                    const dateStr = date.toISOString().split('T')[0];
                                    const dayBookings = bookings.filter(b => b.event_date.startsWith(dateStr) && b.status !== 'rejected');

                                    return (
                                        <div className="calendar-day-content" title={`${dayBookings.length} bookings`}>
                                            {day}
                                            {dayBookings.length > 0 && <span className="day-dot"></span>}
                                        </div>
                                    );
                                }}
                            />
                            <div className="calendar-legend" style={{ marginTop: '1rem', display: 'flex', gap: '1rem', fontSize: '0.9rem', justifyContent: 'center' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ width: 10, height: 10, background: '#fee2e2', borderRadius: '50%', border: '1px solid #991b1b' }}></span> Full Day Booked</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ width: 10, height: 10, background: '#dbeafe', borderRadius: '50%', border: '1px solid #1e40af' }}></span> Partial Booked</span>
                            </div>
                        </div>

                        {/* Right Side: Details Panel */}
                        <div className="calendar-details-panel" style={{ flex: 1, background: 'white', padding: '1.5rem', borderRadius: '15px', overflowY: 'auto', borderLeft: '4px solid #4D0000' }}>
                            {selectedDate ? (
                                <>
                                    <h2 style={{ marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                                        {selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                                    </h2>

                                    <div className="day-bookings-list">
                                        {selectedDayBookings.length > 0 ? (
                                            selectedDayBookings.map(booking => (
                                                <div key={booking.id} style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #e2e8f0' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                        <h3 style={{ margin: 0, color: '#4D0000', fontSize: '1.1rem' }}>{booking.hall_name}</h3>
                                                        <span className={`status-badge status-${booking.status}`} style={{ fontSize: '0.7rem' }}>{booking.status}</span>
                                                    </div>
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem', fontSize: '0.9rem', color: '#64748b' }}>
                                                        <div><strong>Customer:</strong> {booking.user_name}</div>
                                                        <div><strong>Slot:</strong> <span style={{ color: '#0369a1', fontWeight: 600 }}>{getSlotLabel(booking.start_time, booking.end_time)}</span></div>
                                                        <div><strong>Guests:</strong> {booking.guests}</div>
                                                        <div><strong>Food:</strong> {booking.food_package}</div>
                                                    </div>

                                                    {booking.custom_preferences && (
                                                        <div style={{ marginTop: '0.8rem', padding: '0.6rem', background: '#fff1f2', borderRadius: '6px', border: '1px solid #fda4af', fontSize: '0.85rem' }}>
                                                            <div style={{ fontWeight: 'bold', color: '#b91c1c' }}>Notes:</div>
                                                            <div style={{ fontStyle: 'italic', color: '#881337' }}>"{booking.custom_preferences}"</div>
                                                        </div>
                                                    )}

                                                    {booking.status === 'pending' && (
                                                        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                                                            <button
                                                                className="btn-action btn-confirm"
                                                                onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                                                                style={{ flex: 1, padding: '0.6rem' }}
                                                            >
                                                                Approve
                                                            </button>
                                                            <button
                                                                className="btn-action btn-reject"
                                                                onClick={() => handleUpdateStatus(booking.id, 'rejected')}
                                                                style={{ flex: 1, padding: '0.6rem' }}
                                                            >
                                                                Reject
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <div style={{ textAlign: 'center', color: '#94a3b8', marginTop: '2rem' }}>
                                                <p>No events scheduled for this day.</p>
                                                <div style={{ fontSize: '3rem', opacity: 0.3 }}>📅</div>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
                                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👈</div>
                                    <p>Select a date to view details</p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : loading ? (
                    <div className="loading-container">
                        <p>Loading bookings...</p>
                    </div>
                ) : bookings.length > 0 ? (
                    <table className="bookings-table">
                        <thead>
                            <tr>
                                <th>Customer</th>
                                <th>Hall</th>
                                <th>Event Date</th>
                                <th>Total Price</th>
                                <th>Payment</th>
                                <th>Status</th>
                                <th>Feedback</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map((booking) => (
                                <tr key={booking.id}>
                                    <td>
                                        <div style={{ fontWeight: 600 }}>{booking.user_name}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>ID: #{booking.user_id}</div>
                                    </td>
                                    <td>{booking.hall_name}</td>
                                    <td>{new Date(booking.event_date).toLocaleDateString()}</td>
                                    <td style={{ minWidth: '150px' }}>
                                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Total: LKR {booking.total_price?.toLocaleString()}</div>
                                        {booking.paid_amount > 0 && booking.paid_amount < booking.total_price && (
                                            <div style={{ fontSize: '0.75rem', color: '#15803d' }}>
                                                Paid: LKR {booking.paid_amount?.toLocaleString()} <br />
                                                <span style={{ color: '#b91c1c' }}>Due: LKR {(booking.total_price - booking.paid_amount)?.toLocaleString()}</span>
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        <span style={{
                                            padding: '4px 10px',
                                            borderRadius: '50px',
                                            fontSize: '0.75rem',
                                            fontWeight: 700,
                                            background: booking.payment_status === 'paid' ? '#d1fae5' : (booking.payment_status === 'partial' ? '#fef9c3' : '#fee2e2'),
                                            color: booking.payment_status === 'paid' ? '#059669' : (booking.payment_status === 'partial' ? '#a16207' : '#b91c1c'),
                                            border: 'none'
                                        }}>
                                            {booking.payment_status?.toUpperCase()}
                                        </span>
                                        {booking.payment_status === 'partial' && (
                                            <div style={{ fontSize: '0.65rem', color: '#a16207', marginTop: '4px' }}>50% Advance</div>
                                        )}
                                    </td>
                                    <td>
                                        <span className={`status-badge status-${booking.status}`}>
                                            {booking.status}
                                        </span>
                                    </td>
                                    <td>
                                        {booking.feedback ? (
                                            <div title={booking.feedback.comments} style={{ cursor: 'help' }}>
                                                {'⭐'.repeat(booking.feedback.rating)}
                                            </div>
                                        ) : <span style={{ color: '#cbd5e1' }}>-</span>}
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            {booking.status === 'pending' ? (
                                                <>
                                                    <button
                                                        className="btn-action btn-confirm"
                                                        onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                                                        title="Confirm & Notify"
                                                    >
                                                        Confirm
                                                    </button>
                                                    <button
                                                        className="btn-action btn-reject"
                                                        onClick={() => handleUpdateStatus(booking.id, 'rejected')}
                                                        title="Reject"
                                                    >
                                                        Reject
                                                    </button>
                                                </>
                                            ) : booking.status === 'confirmed' ? (
                                                <button
                                                    className="btn-action btn-confirm"
                                                    onClick={() => {
                                                        setSelectedBookingForStaff(booking);
                                                        setShowAssignModal(true);
                                                    }}
                                                    style={{ background: '#dbeafe', color: '#1e40af' }}
                                                >
                                                    + Assign Staff
                                                </button>
                                            ) : (
                                                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Processed</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="empty-state">
                        <p>No booking requests found.</p>
                    </div>
                )}
            </section>

            {/* Assignment Modal */}
            {
                showAssignModal && (
                    <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                        <div className="modal-content" style={{ background: 'white', padding: '2rem', borderRadius: '1rem', width: '100%', maxWidth: '450px' }}>
                            <h2 style={{ marginBottom: '1.5rem' }}>Assign Staff to {selectedBookingForStaff.hall_name}</h2>
                            <form onSubmit={handleAssignStaff}>
                                <div className="form-group" style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Select Staff Member</label>
                                    <select
                                        required
                                        className="form-input"
                                        value={assignmentData.staff_id}
                                        onChange={(e) => setAssignmentData({ ...assignmentData, staff_id: e.target.value })}
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd' }}
                                    >
                                        <option value="">-- Choose Staff --</option>
                                        {staffList.map(s => (
                                            <option key={s.id} value={s.id}>{s.username} ({s.staff_type})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group" style={{ marginBottom: '2rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Task/Instructions</label>
                                    <textarea
                                        required
                                        placeholder="e.g. Set up tables for 250 guests"
                                        className="form-input"
                                        value={assignmentData.task}
                                        onChange={(e) => setAssignmentData({ ...assignmentData, task: e.target.value })}
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd', minHeight: '100px', fontFamily: 'inherit' }}
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                    <button type="button" onClick={() => setShowAssignModal(false)} style={{ padding: '0.8rem 1.5rem', borderRadius: '8px', border: '1px solid #ddd', background: '#f8fafc', cursor: 'pointer' }}>Cancel</button>
                                    <button type="submit" style={{ padding: '0.8rem 1.5rem', borderRadius: '8px', border: 'none', background: '#4D0000', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>Assign Now</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

        </div >
    );
};

export default Admin;
