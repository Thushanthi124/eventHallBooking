import React, { useState, useEffect } from 'react';
import './Admin.css';

const AdminMessages = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchMessages = async () => {
        try {
            const token = localStorage.getItem('userToken');
            const response = await fetch('http://127.0.0.1:5000/api/admin/notifications', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setMessages(data);
            } else {
                console.error("Failed to fetch messages");
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    return (
        <div className="dashboard-page-content">
            <header className="page-header">
                <div className="header-content">
                    <h1>Sent Messages</h1>
                    <p>History of all notifications sent to customers.</p>
                </div>
            </header>

            <div className="admin-content-card">
                {loading ? (
                    <div>Loading messages...</div>
                ) : messages.length > 0 ? (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Sent Date</th>
                                <th>Customer Name</th>
                                <th>Customer Email</th>
                                <th>Message</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {messages.map((msg) => (
                                <tr key={msg.id}>
                                    <td>{new Date(msg.created_at).toLocaleString()}</td>
                                    <td>{msg.user_name}</td>
                                    <td>{msg.user_email}</td>
                                    <td style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {msg.message}
                                    </td>
                                    <td>
                                        <span className={`status-badge status-${msg.is_read ? 'confirmed' : 'pending'}`}>
                                            {msg.is_read ? 'Read' : 'Unread'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
                        <p>No messages have been sent yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminMessages;
