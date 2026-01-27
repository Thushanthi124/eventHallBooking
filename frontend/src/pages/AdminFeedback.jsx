import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminFeedback = () => {
    const navigate = useNavigate();
    const [feedbackList, setFeedbackList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFeedback();
    }, []);

    const fetchFeedback = async () => {
        try {
            const token = localStorage.getItem('userToken');
            const response = await fetch('http://127.0.0.1:5000/api/admin/feedback', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setFeedbackList(data);
            } else if (response.status === 401) {
                navigate('/login');
            }
        } catch (error) {
            console.error("Error fetching feedback:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '2rem' }}>
            <h1 style={{ color: '#111827', marginBottom: '20px' }}>Customer Feedback</h1>

            {loading ? (
                <p>Loading reviews...</p>
            ) : feedbackList.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {feedbackList.map(f => (
                        <div key={f.id} style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <div style={{ fontSize: '1.2rem' }}>{'⭐'.repeat(f.rating)}</div>
                                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{new Date(f.created_at).toLocaleDateString()}</span>
                            </div>
                            <p style={{ color: '#334155', lineHeight: '1.6', marginBottom: '1.5rem', fontStyle: 'italic' }}>
                                "{f.comments}"
                            </p>
                            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem', fontSize: '0.9rem' }}>
                                <div style={{ fontWeight: 'bold', color: '#1e293b' }}>{f.user_name}</div>
                                <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Event: {f.hall_name}</div>
                                <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{new Date(f.event_date).toLocaleDateString()}</div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ padding: '3rem', background: 'white', textAlign: 'center', borderRadius: '8px', color: '#64748b' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>💬</div>
                    <h3 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>No Feedback Yet</h3>
                    <p style={{ maxWidth: '400px', margin: '0 auto' }}>
                        Customer reviews and ratings will appear here once they complete their events.
                    </p>
                </div>
            )}
        </div>
    );
};

export default AdminFeedback;
