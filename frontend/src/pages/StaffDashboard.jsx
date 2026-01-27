// src/pages/StaffDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../components/BackButton';
import './StaffDashboard.css';

const StaffDashboard = () => {
    const navigate = useNavigate();
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const userId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('userRole');
    const staffType = localStorage.getItem('staffType');

    useEffect(() => {
        if (!userId || userRole !== 'staff') {
            navigate('/login');
            return;
        }
        fetchAssignments();
    }, [userId, userRole, navigate]);

    const fetchAssignments = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('userToken');
            const response = await fetch('http://127.0.0.1:5000/api/staff/assignments', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setAssignments(data);
            }
        } catch (error) {
            console.error("Error fetching assignments:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            const token = localStorage.getItem('userToken');
            const response = await fetch(`http://127.0.0.1:5000/api/assignments/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                fetchAssignments();
            }
        } catch (error) {
            alert("Error updating status.");
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <div className="staff-page-content" style={{ padding: '2rem' }}>
            <header className="staff-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <BackButton />
                    <div>
                        <h1 style={{ fontSize: '2rem', color: '#111827' }}>Daily Assignments</h1>
                        <p style={{ color: '#6b7280' }}>Manage your tasks for upcoming events</p>
                    </div>
                </div>
            </header>

            {loading ? (
                <p>Loading your tasks...</p>
            ) : assignments.length > 0 ? (
                assignments.map(task => (
                    <div key={task.id} className="assignment-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <h3 style={{ margin: 0, color: '#1e40af' }}>{task.hall_name}</h3>
                            <span className={`status-indicator status-${task.status}`}>
                                {task.status.replace('_', ' ').toUpperCase()}
                            </span>
                        </div>

                        <div className="assignment-details">
                            <div className="detail-node">
                                <span className="node-label">Date & Time</span>
                                <span className="node-value">
                                    {new Date(task.event_date).toLocaleDateString()} <br />
                                    <span style={{ fontSize: '0.9em', color: '#4b5563' }}>
                                        {task.start_time} {staffType === 'cleaner' && ` - ${task.end_time}`}
                                    </span>
                                </span>
                            </div>

                            {(staffType === 'kitchen' || staffType === 'server') && (
                                <>
                                    <div className="detail-node">
                                        <span className="node-label">Guests</span>
                                        <span className="node-value">{task.guests} pax</span>
                                    </div>
                                    <div className="detail-node">
                                        <span className="node-label">Food Pkg</span>
                                        <span className="node-value" style={{ textTransform: 'capitalize' }}>{task.food_package}</span>
                                    </div>
                                </>
                            )}

                            {staffType === 'kitchen' && task.custom_preferences && (
                                <div className="detail-node full-width-node" style={{ gridColumn: 'span 2' }}>
                                    <span className="node-label" style={{ color: '#b91c1c' }}>Dietary / Custom Requests</span>
                                    <div className="node-value" style={{ fontSize: '0.9rem', background: '#fff1f2', padding: '8px', borderRadius: '6px', border: '1px solid #fda4af' }}>
                                        {task.custom_preferences}
                                    </div>
                                </div>
                            )}

                            <div className="detail-node">
                                <span className="node-label">Task</span>
                                <span className="node-value" style={{ color: '#d97706' }}>{task.task}</span>
                            </div>
                        </div>

                        {task.status !== 'completed' && (
                            <div className="status-toggle">
                                <button
                                    className="btn-complete"
                                    onClick={() => handleUpdateStatus(task.id, 'completed')}
                                >
                                    Mark as Completed
                                </button>
                                <button
                                    style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', textDecoration: 'underline' }}
                                    onClick={() => handleUpdateStatus(task.id, 'in_progress')}
                                >
                                    Update to In-Progress
                                </button>
                            </div>
                        )}
                    </div>
                ))
            ) : (
                <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: '15px' }}>
                    <p style={{ fontSize: '1.2rem', color: '#9ca3af' }}>No assignments found for today.</p>
                </div>
            )}
        </div>
    );
};

export default StaffDashboard;
