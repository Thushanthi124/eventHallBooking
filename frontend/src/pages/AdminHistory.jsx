import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import BackButton from '../components/BackButton';

const AdminHistory = () => {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [filteredBookings, setFilteredBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    useEffect(() => {
        fetchBookings();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [searchTerm, statusFilter, startDate, endDate, bookings]);

    const fetchBookings = async () => {
        try {
            const token = localStorage.getItem('userToken');
            const response = await fetch('http://127.0.0.1:5000/api/bookings', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                // Filter only past bookings initially
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const pastBookings = data.filter(b => {
                    const eventDate = new Date(b.event_date);
                    return eventDate < today;
                });

                // Sort by date descending (newest past date first)
                pastBookings.sort((a, b) => new Date(b.event_date) - new Date(a.event_date));

                setBookings(pastBookings);
                setFilteredBookings(pastBookings);
            } else if (response.status === 401) {
                navigate('/login');
            }
        } catch (error) {
            console.error("Error fetching history:", error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let result = bookings;

        // Search (Customer or Hall)
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(b =>
                b.user_name.toLowerCase().includes(term) ||
                b.hall_name.toLowerCase().includes(term) ||
                String(b.id).includes(term)
            );
        }

        // Status
        if (statusFilter !== 'all') {
            result = result.filter(b => b.status === statusFilter);
        }

        // Date Range
        if (startDate) {
            result = result.filter(b => new Date(b.event_date) >= startDate);
        }
        if (endDate) {
            result = result.filter(b => new Date(b.event_date) <= endDate);
        }

        setFilteredBookings(result);
    };

    const resetFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setStartDate(null);
        setEndDate(null);
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <BackButton />
                <h1 style={{ color: '#111827', marginTop: '1rem' }}>📜 Booking History</h1>
                <p style={{ color: '#6b7280' }}>Archive of all past events and reservations.</p>
            </div>

            {/* Filters Section */}
            <div style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                marginBottom: '2rem',
                display: 'flex',
                gap: '1rem',
                flexWrap: 'wrap',
                alignItems: 'flex-end'
            }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Search</label>
                    <input
                        type="text"
                        placeholder="Customer, Hall, or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', padding: '0.7rem', borderRadius: '6px', border: '1px solid #d1d5db' }}
                    />
                </div>

                <div style={{ width: '150px' }}>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Status</label>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={{ width: '100%', padding: '0.7rem', borderRadius: '6px', border: '1px solid #d1d5db' }}
                    >
                        <option value="all">All Statuses</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="rejected">Rejected</option>
                        <option value="pending">Pending</option>
                    </select>
                </div>

                <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Date Range</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <DatePicker
                            selected={startDate}
                            onChange={date => setStartDate(date)}
                            placeholderText="Start Date"
                            className="form-input"
                            style={{ padding: '0.7rem', borderRadius: '6px', border: '1px solid #d1d5db' }}
                        />
                        <DatePicker
                            selected={endDate}
                            onChange={date => setEndDate(date)}
                            placeholderText="End Date"
                            className="form-input"
                            style={{ padding: '0.7rem', borderRadius: '6px', border: '1px solid #d1d5db' }}
                        />
                    </div>
                </div>

                <button
                    onClick={resetFilters}
                    style={{
                        padding: '0.7rem 1.5rem',
                        background: '#f3f4f6',
                        color: '#4b5563',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 600
                    }}
                >
                    Reset
                </button>
            </div>

            {/* Table */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>Loading history...</div>
            ) : filteredBookings.length > 0 ? (
                <div style={{ overflowX: 'auto', background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                        <thead style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                            <tr>
                                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', color: '#6b7280' }}>ID</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', color: '#6b7280' }}>Hall</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', color: '#6b7280' }}>Customer</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', color: '#6b7280' }}>Event Date</th>
                                <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', color: '#6b7280' }}>Status</th>
                                <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.875rem', color: '#6b7280' }}>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBookings.map((booking) => (
                                <tr key={booking.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                    <td style={{ padding: '1rem', color: '#9ca3af', fontFamily: 'monospace' }}>#{booking.id}</td>
                                    <td style={{ padding: '1rem', fontWeight: 600, color: '#1f2937' }}>{booking.hall_name}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ color: '#1f2937' }}>{booking.user_name}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{booking.user_email}</div>
                                    </td>
                                    <td style={{ padding: '1rem', color: '#374151' }}>
                                        {new Date(booking.event_date).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '4px 10px',
                                            borderRadius: '9999px',
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            background: booking.status === 'confirmed' ? '#d1fae5' : booking.status === 'rejected' ? '#fee2e2' : '#f3f4f6',
                                            color: booking.status === 'confirmed' ? '#065f46' : booking.status === 'rejected' ? '#991b1b' : '#374151'
                                        }}>
                                            {booking.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: '#111827' }}>
                                        LKR {booking.total_price?.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: '12px' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}>🕵️‍♀️</div>
                    <h3 style={{ color: '#374151' }}>No past bookings found</h3>
                    <p style={{ color: '#6b7280' }}>Try adjusting your filters.</p>
                </div>
            )}
        </div>
    );
};

export default AdminHistory;
