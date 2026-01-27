// src/pages/Support.jsx
import React from "react";
import { Link } from "react-router-dom";
import './Home.css';

const Support = () => {
  return (
    <div className="home-container">
      <nav className="navbar">
        <div className="nav-left">
          <h1 className="logo">Nadsathira<span>mahal</span></h1>
        </div>
        <nav className="nav-center">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/dashboard" className="nav-link">Dashboard</Link>
          <Link to="/about" className="nav-link">About</Link>
          <Link to="/support" className="nav-link active">Support</Link>
        </nav>
        <div className="nav-right">
          <Link to="/login" className="login-btn">Reserve Now</Link>
        </div>
      </nav>

      <section style={{ padding: '8rem 4rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '4rem', color: '#4D0000', marginBottom: '1rem' }}>Support Center</h1>
          <p style={{ fontSize: '1.2rem', color: '#666' }}>How can we help you plan your perfect event?</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
          <div style={{ padding: '3rem', background: 'white', borderRadius: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.05)', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>📞</div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#4D0000' }}>Direct Contact</h3>
            <p style={{ color: '#666', marginBottom: '1.5rem' }}>Our concierge team is available 24/7 for urgent inquiries.</p>
            <p style={{ fontWeight: '600', color: '#800000' }}>+94 77 123 4567</p>
          </div>

          <div style={{ padding: '3rem', background: 'white', borderRadius: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.05)', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>✉️</div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#4D0000' }}>Email Us</h3>
            <p style={{ color: '#666', marginBottom: '1.5rem' }}>Send us your event requirements and we'll reply within 4 hours.</p>
            <p style={{ fontWeight: '600', color: '#800000' }}>concierge@nadsathira.com</p>
          </div>

          <div style={{ padding: '3rem', background: 'white', borderRadius: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.05)', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>📍</div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#4D0000' }}>Visit Our Office</h3>
            <p style={{ color: '#666', marginBottom: '1.5rem' }}>Walk-in consultations available Monday to Saturday.</p>
            <p style={{ fontWeight: '600', color: '#800000' }}>123 Grand Ballroom Avenue, Colombo 07</p>
          </div>
        </div>

        <div style={{ marginTop: '8rem', background: 'white', padding: '4rem', borderRadius: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.5rem', color: '#4D0000', marginBottom: '2rem', textAlign: 'center' }}>Frequently Asked Questions</h2>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ borderBottom: '1px solid #eee', padding: '1.5rem 0' }}>
              <h4 style={{ marginBottom: '0.5rem' }}>Can I visit the halls before booking?</h4>
              <p style={{ color: '#666' }}>Absolutely. We recommend visiting during daytime hours to see the venues in their natural light. Contact our concierge to schedule a tour.</p>
            </div>
            <div style={{ borderBottom: '1px solid #eee', padding: '1.5rem 0' }}>
              <h4 style={{ marginBottom: '0.5rem' }}>Do you provide catering?</h4>
              <p style={{ color: '#666' }}>Yes, we have three distinct food packages (Basic, Standard, Luxury). We also allow outside catering for certain events subject to a corkage fee.</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-bottom">
          <p>© 2026 Nadsathiramahal Private Limited. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Support;
