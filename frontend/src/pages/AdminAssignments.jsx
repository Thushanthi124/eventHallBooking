import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminAssignments = () => {
    const navigate = useNavigate();
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAssignments();
    }, []);

    const fetchAssignments = async () => {
        try {
            const token = localStorage.getItem('userToken');
            const response = await fetch('http://127.0.0.1:5000/api/assignments', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setAssignments(data);
            } else if (response.status === 401) {
                navigate('/login');
            }
        } catch (error) {
            console.error("Error fetching assignments:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '2rem' }}>
            <h1 style={{ color: '#111827', marginBottom: '20px' }}>Staff Assignments</h1>

            {loading ? (
                <p>Loading...</p>
            ) : assignments.length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        <tr>
                            <th style={{ padding: '12px', textAlign: 'left', color: '#64748b' }}>Staff Member</th>
                            <th style={{ padding: '12px', textAlign: 'left', color: '#64748b' }}>Booking ID</th>
                            <th style={{ padding: '12px', textAlign: 'left', color: '#64748b' }}>Task</th>
                            <th style={{ padding: '12px', textAlign: 'left', color: '#64748b' }}>Status</th>
                            <th style={{ padding: '12px', textAlign: 'left', color: '#64748b' }}>Assigned Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {assignments.map(a => (
                            <tr key={a.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '12px' }}>
                                    <div style={{ fontWeight: 600, color: '#1e293b' }}>{a.staff_name}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{a.staff_type} • {a.staff_email}</div>
                                </td>
                                <td style={{ padding: '12px' }}>#{a.booking_id}</td>
                                <td style={{ padding: '12px' }}>{a.task}</td>
                                <td style={{ padding: '12px' }}>
                                    <span style={{
                                        padding: '4px 8px',
                                        borderRadius: '12px',
                                        fontSize: '0.8rem',
                                        background: a.status === 'completed' ? '#dcfce7' : '#fef9c3',
                                        color: a.status === 'completed' ? '#166534' : '#854d0e'
                                    }}>
                                        {a.status}
                                    </span>
                                </td>
                                <td style={{ padding: '12px', color: '#64748b' }}>
                                    {new Date(a.assigned_at).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <div style={{ padding: '3rem', background: 'white', textAlign: 'center', borderRadius: '8px', color: '#64748b' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>📋</div>
                    <h3 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>No Staff Assignments Yet</h3>
                    <p style={{ maxWidth: '400px', margin: '0 auto', lineHeight: '1.5' }}>
                        To assign staff to a task, go to <strong>Manage Bookings</strong>, find a confirmed booking, and click the
                        <span style={{ display: 'inline-block', background: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', margin: '0 4px', fontWeight: 'bold' }}>+ Assign Staff</span>
                        button.
                    </p>
                    <button
                        onClick={() => navigate('/admin')}
                        style={{ marginTop: '1.5rem', padding: '0.8rem 1.5rem', background: '#800000', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        Go to Manage Bookings
                    </button>
                </div>
            )}
        </div>
    );
};

export default AdminAssignments;
