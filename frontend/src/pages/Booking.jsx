// src/pages/Booking.jsx
import React, { useState } from 'react';
import './Booking.css';

const Booking = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    eventDate: '',
    hallType: 'standard',
    guests: 50,
    foodPackage: 'basic',
    specialRequests: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Booking Data:', formData);
    alert('Booking Submitted!');
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="booking-container">
      <nav className="navbar">
        <div className="nav-left">
          <h1 className="logo">Nadsathiramahal</h1>
        </div>
        <div className="nav-center">
          <a href="/" className="nav-link">Home</a>
          <a href="/dashboard" className="nav-link">Dashboard</a>
          <a href="/booking" className="nav-link active">Book Now</a>
        </div>
        <div className="nav-right">
          <button className="logout-btn">Logout</button>
        </div>
      </nav>

      <div className="booking-form-container">
        <h2>Book Your Event Hall</h2>
        
        <form onSubmit={handleSubmit} className="booking-form">
          <div className="form-row">
            <div className="form-group">
              <label>Full Name *</label>
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleChange}
                required 
                placeholder="Enter your full name"
              />
            </div>
            
            <div className="form-group">
              <label>Email *</label>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                required 
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Phone Number *</label>
              <input 
                type="tel" 
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required 
                placeholder="Enter your phone number"
              />
            </div>
            
            <div className="form-group">
              <label>Event Date *</label>
              <input 
                type="date" 
                name="eventDate"
                value={formData.eventDate}
                onChange={handleChange}
                required 
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Hall Type *</label>
              <select name="hallType" value={formData.hallType} onChange={handleChange}>
                <option value="standard">Standard Hall (₹15,000)</option>
                <option value="premium">Premium Hall (₹25,000)</option>
                <option value="luxury">Luxury Hall (₹40,000)</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Number of Guests *</label>
              <input 
                type="number" 
                name="guests"
                value={formData.guests}
                onChange={handleChange}
                min="50"
                max="500"
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label>Food Package</label>
            <select name="foodPackage" value={formData.foodPackage} onChange={handleChange}>
              <option value="basic">Basic Package (₹500/person)</option>
              <option value="standard">Standard Package (₹800/person)</option>
              <option value="premium">Premium Package (₹1200/person)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Special Requests</label>
            <textarea 
              name="specialRequests"
              value={formData.specialRequests}
              onChange={handleChange}
              placeholder="Any special requirements or requests..."
              rows="4"
            />
          </div>

          <div className="form-summary">
            <h3>Booking Summary</h3>
            <p>Hall: {formData.hallType === 'standard' ? 'Standard' : formData.hallType === 'premium' ? 'Premium' : 'Luxury'}</p>
            <p>Guests: {formData.guests}</p>
            <p>Date: {formData.eventDate || 'Select date'}</p>
          </div>

          <button type="submit" className="submit-btn">Confirm Booking</button>
        </form>
      </div>
    </div>
  );
};

export default Booking;