// src/pages/Booking.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import BackButton from '../components/BackButton';
import './Booking.css';

const Booking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(location.state?.step || 1); // 1: Details, 2: Summary, 3: Payment
  const [bookingId, setBookingId] = useState(location.state?.bookingId || null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    eventDate: new Date(),
    selectedSlot: 'lunch', // 'lunch' or 'evening'
    startTime: '08:00', // Default based on slot
    endTime: '15:00',   // Default based on slot
    hallType: '',
    guests: 50,
    foodPackage: 'standard',
    specialRequests: '',
    paidAmount: 0
  });
  const [halls, setHalls] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchHalls = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/api/halls');
        if (response.ok) {
          const data = await response.json();
          setHalls(data);

          // If valid bookingId exists, load that booking's data
          if (bookingId) {
            const token = localStorage.getItem('userToken');
            const bookingRes = await fetch(`http://127.0.0.1:5000/api/bookings/${bookingId}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (bookingRes.ok) {
              const bookingData = await bookingRes.json();
              // Populate form with existing booking data
              setFormData({
                name: localStorage.getItem('userName') || '', // Or fetch user details
                email: localStorage.getItem('userEmail') || '',
                phone: bookingData.phone,
                eventDate: new Date(bookingData.event_date),
                selectedSlot: 'custom', // Logic to determine slot from time
                startTime: bookingData.start_time.substring(0, 5),
                endTime: bookingData.end_time.substring(0, 5),
                hallType: bookingData.hall_id.toString(),
                guests: bookingData.guests,
                foodPackage: bookingData.food_package,
                specialRequests: bookingData.custom_preferences || '',
                paidAmount: bookingData.paid_amount || 0
              });

              // Determine slot for visual highlighting
              const s = bookingData.start_time.substring(0, 5);
              const e = bookingData.end_time.substring(0, 5);
              if (s === '08:00' && e === '15:00') setFormData(prev => ({ ...prev, selectedSlot: 'lunch' }));
              else if (s === '17:00' && e === '23:30') setFormData(prev => ({ ...prev, selectedSlot: 'evening' }));
              else if (s === '08:00' && e === '23:30') setFormData(prev => ({ ...prev, selectedSlot: 'fullday' }));
            }
          } else {
            // Default logic for new booking
            let preSelectedId = '';
            if (location.state?.hallId) {
              preSelectedId = location.state.hallId.toString();
            } else if (data.length > 0) {
              preSelectedId = data[0].id.toString();
            }
            setFormData(prev => ({ ...prev, hallType: preSelectedId }));
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchHalls();
  }, [bookingId]);

  // Fetch booked slots when hall changes
  useEffect(() => {
    if (formData.hallType) {
      fetchBookedSlots(formData.hallType);
    }
  }, [formData.hallType]);

  const fetchBookedSlots = async (hallId) => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/public/bookings?hall_id=${hallId}`);
      if (response.ok) {
        const data = await response.json();
        setBookedSlots(data);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  };

  // Helper to get YYYY-MM-DD in local time
  const formatDateKey = (date) => {
    if (!date) return '';
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split('T')[0];
  };

  const getDayStatus = (date) => {
    const dateStr = formatDateKey(date);
    const bookingsForDay = bookedSlots.filter(b => b.event_date === dateStr);

    if (bookingsForDay.length === 0) return { status: 'available', tooltip: 'Available' };

    const lunchBooked = bookingsForDay.some(b => b.start_time === '08:00' && b.end_time === '15:00');
    const eveningBooked = bookingsForDay.some(b => b.start_time === '17:00' && b.end_time === '23:30');
    const fullDayBooked = bookingsForDay.some(b => b.start_time === '08:00' && b.end_time === '23:30');

    if (fullDayBooked || (lunchBooked && eveningBooked)) return { status: 'full', tooltip: 'Fully Booked' };
    if (lunchBooked) return { status: 'partial', tooltip: 'Lunch Booked (Evening Available)' };
    if (eveningBooked) return { status: 'partial', tooltip: 'Evening Booked (Lunch Available)' };

    return { status: 'available', tooltip: 'Available' };
  };

  const isSlotAvailable = (slot) => {
    if (!formData.eventDate) return true;
    const dateStr = formatDateKey(formData.eventDate);
    const bookingsForDay = bookedSlots.filter(b => b.event_date === dateStr);

    const lunchBooked = bookingsForDay.some(b => (b.start_time === '08:00' && b.end_time === '15:00') || (b.start_time === '08:00' && b.end_time === '23:30'));
    const eveningBooked = bookingsForDay.some(b => (b.start_time === '17:00' && b.end_time === '23:30') || (b.start_time === '08:00' && b.end_time === '23:30'));
    const fullDayBooked = bookingsForDay.length > 0; // If ANYTHING is booked, full day is unavailable

    if (slot === 'lunch') return !lunchBooked;
    if (slot === 'evening') return !eveningBooked;
    if (slot === 'fullday') return !fullDayBooked;
    return true;
  };

  const handleSlotChange = (slot) => {
    if (slot === 'lunch') {
      setFormData(prev => ({ ...prev, selectedSlot: 'lunch', startTime: '08:00', endTime: '15:00' }));
    } else if (slot === 'evening') {
      setFormData(prev => ({ ...prev, selectedSlot: 'evening', startTime: '17:00', endTime: '23:30' }));
    } else {
      setFormData(prev => ({ ...prev, selectedSlot: 'fullday', startTime: '08:00', endTime: '23:30' }));
    }
  };

  const foodPackages = {
    basic: {
      name: 'Saiva Sapadu (Basic)',
      price: 500,
      menu: ['White Rice', 'Sambar', 'Rasam', 'Kootu', 'Poriyal', 'Appalam', 'Pickle', 'Payasam']
    },
    standard: {
      name: 'Kalyana Virunthu (Standard)',
      price: 800,
      menu: ['Sweet', 'Vadai', 'White Rice', 'Vegetable Biryani', 'Sambar', 'Rasam', 'Vatha Kuzhambu', 'Aviyal', 'Beans Poriyal', 'Curd', 'Appalam', 'Pal Payasam', 'Ice Cream']
    },
    premium: {
      name: 'Nadsathira Special (Luxury)',
      price: 1200,
      menu: ['Welcome Drink', 'Mysore Pak', 'Medhu Vadai', 'Ghee Rice', 'Vegetable Biryani', 'Mushroom Gravy', 'Drumstick Sambar', 'Pepper Rasam', 'Paneer Butter Masala', 'Cauliflower 65', 'Potato Fry', 'Fruits Salad', 'Semiya Payasam', 'Ice Cream & Beeda']
    }
  };

  const calculatePricing = () => {
    const selectedHall = halls.find(h => h.id.toString() === formData.hallType);
    if (!selectedHall) return { hallBase: 0, foodTotal: 0, total: 0 };

    let hallBase = 0;
    if (formData.selectedSlot === 'lunch') {
      hallBase = selectedHall.price_morning || (selectedHall.price_per_day / 2); // Fallback if 0
    } else if (formData.selectedSlot === 'evening') {
      hallBase = selectedHall.price_evening || (selectedHall.price_per_day * 0.8); // Fallback logic
    } else {
      hallBase = selectedHall.price_per_day;
    }

    const foodTotal = formData.guests * foodPackages[formData.foodPackage].price;
    return { hallBase, foodTotal, total: hallBase + foodTotal };
  };

  const validateStep1 = () => {
    let tempErrors = {};
    if (!formData.name) tempErrors.name = "Full Name is required";
    if (!formData.eventDate) tempErrors.eventDate = "Date is required";

    // Strict 10 digit phone validation
    const phoneRegex = /^\d{10}$/;
    if (!formData.phone || !phoneRegex.test(formData.phone)) {
      tempErrors.phone = "Phone number must be exactly 10 digits";
    }

    if (!isSlotAvailable(formData.selectedSlot)) tempErrors.slot = "Selected slot is already booked";

    // Guest Capacity Validation
    const selectedHall = halls.find(h => h.id.toString() === formData.hallType);
    if (selectedHall) {
      if (formData.guests > selectedHall.capacity) {
        tempErrors.guests = `Guest count exceeds hall capacity (${selectedHall.capacity})`;
      }
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) setStep(2);
  };

  const handleSubmitBooking = async () => {
    const userId = localStorage.getItem('userId');
    const dateStr = formatDateKey(formData.eventDate);


    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch('http://127.0.0.1:5000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          hall_id: formData.hallType,
          event_date: dateStr,
          start_time: formData.startTime,
          end_time: formData.endTime,
          phone: formData.phone,
          guests: formData.guests,
          food_package: formData.foodPackage,
          custom_preferences: formData.customPreferences
        })
      });
      const data = await response.json();
      if (response.ok) {
        setBookingId(data.booking.id);
        setStep(3); // Move to Payment
      } else {
        alert(data.error);
      }
    } catch (e) { alert("Error connecting to server."); }
  };

  /* State for payment type */
  const [paymentType, setPaymentType] = useState('full'); // 'full' or 'advance'

  const handlePayment = async () => {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('userToken');
    
    if (!token) {
      alert("Your session has expired or you are not logged in. Please log in again.");
      navigate('/login', { state: { from: location } });
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:5000/api/bookings/${bookingId}/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          payment_type: paymentType
        })
      });
      
      if (response.ok) {
        // alert("Payment successful! Your booking is secured.");
        navigate('/payment-success');
      } else {
        const errorData = await response.json();
        if (response.status === 401) {
            alert(errorData.error || "Session expired. Please log in again.");
            localStorage.clear();
            navigate('/login');
        } else {
            alert(errorData.error || "Payment verification failed.");
        }
      }
    } catch (e) {
      console.error("Payment Error:", e);
      alert("Network error: Could not verify payment. Please check your connection.");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const pricing = calculatePricing();

  return (
    <div className="booking-container">
      <nav className="navbar">
        <div className="nav-left">
          <h1 className="logo">Nadsathira<span>mahal</span></h1>
        </div>
        <div className="nav-center">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/dashboard" className="nav-link">Dashboard</Link>
          <Link to="/booking" className="nav-link active">Book Now</Link>
        </div>
        <div className="nav-right">
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </nav>

      <div className="booking-wizard">
        <div className="wizard-progress">
          <div className={`step-node ${step >= 1 ? 'active' : ''}`}>1. Details</div>
          <div className="step-line"></div>
          <div className={`step-node ${step >= 2 ? 'active' : ''}`}>2. Review</div>
          <div className="step-line"></div>
          <div className={`step-node ${step >= 3 ? 'active' : ''}`}>3. Payment</div>
        </div>

        <div className="wizard-content">
          {step === 1 && (
            <div className="step-view">
              <BackButton style={{ alignSelf: 'flex-start', marginBottom: '1rem' }} />
              <h2 className="step-title">Event Information</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Thushanthi" />
                  {errors.name && <span className="error-msg">{errors.name}</span>}
                </div>

                <div className="form-group full-width">
                  <label>Selected Venue</label>
                  <div className="halls-selection-grid">
                    {halls.filter(hall => hall.id.toString() === formData.hallType).map(hall => (
                      <div
                        key={hall.id}
                        className="hall-option-card selected"
                        style={{
                          backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url(${hall.image_url})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          cursor: 'default'
                        }}
                      >
                        <div className="hall-card-header">
                          <span className="hall-name" style={{ color: 'white' }}>{hall.name}</span>
                          <span className="hall-price" style={{ background: 'rgba(255,255,255,0.9)', color: '#800000' }}>LKR {hall.price_per_day.toLocaleString()}</span>
                        </div>
                        <div className="hall-card-details">
                          <span style={{ color: '#e2e8f0' }}>Capacity: {hall.capacity}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-group full-width">
                  <label>Event Date & Availability</label>
                  <div className="calendar-wrapper">
                    <DatePicker
                      selected={formData.eventDate}
                      onChange={(date) => setFormData({ ...formData, eventDate: date })}
                      inline
                      minDate={new Date(new Date().setHours(0, 0, 0, 0))}
                      dayClassName={(date) => {
                        const { status } = getDayStatus(date);
                        return `calendar-day-${status}`;
                      }}
                      renderDayContents={(day, date) => {
                        const { tooltip } = getDayStatus(date);
                        return (
                          <div title={tooltip}>
                            {day}
                          </div>
                        );
                      }}
                    />
                  </div>
                  {errors.eventDate && <span className="error-msg">{errors.eventDate}</span>}
                </div>

                <div className="form-group full-width">
                  <label>Select Time Slot</label>
                  <div className="slot-selector">
                    <div
                      className={`slot-option ${formData.selectedSlot === 'lunch' ? 'selected' : ''} ${!isSlotAvailable('lunch') ? 'disabled' : ''}`}
                      onClick={() => isSlotAvailable('lunch') && handleSlotChange('lunch')}
                    >
                      <div className="slot-name">Lunch / Morning Event</div>
                      <div className="slot-time">08:00 AM - 03:00 PM</div>
                      {!isSlotAvailable('lunch') && <span className="slot-badge">BOOKED</span>}
                    </div>

                    <div
                      className={`slot-option ${formData.selectedSlot === 'evening' ? 'selected' : ''} ${!isSlotAvailable('evening') ? 'disabled' : ''}`}
                      onClick={() => isSlotAvailable('evening') && handleSlotChange('evening')}
                    >
                      <div className="slot-name">Evening Party</div>
                      <div className="slot-time">05:00 PM - 11:30 PM</div>
                      {!isSlotAvailable('evening') && <span className="slot-badge">BOOKED</span>}
                    </div>

                    <div
                      className={`slot-option full-width ${formData.selectedSlot === 'fullday' ? 'selected' : ''} ${!isSlotAvailable('fullday') ? 'disabled' : ''}`}
                      onClick={() => isSlotAvailable('fullday') && handleSlotChange('fullday')}
                    >
                      <div className="slot-name">Whole Day Event</div>
                      <div className="slot-time">08:00 AM - 11:30 PM</div>
                      {!isSlotAvailable('fullday') && <span className="slot-badge">UNAVAILABLE</span>}
                    </div>
                  </div>
                  {errors.slot && <span className="error-msg">{errors.slot}</span>}
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="077XXXXXXX" />
                  {errors.phone && <span className="error-msg">{errors.phone}</span>}
                </div>

                <div className="form-group">
                  <label>Guest Count</label>
                  <input type="number" name="guests" value={formData.guests} onChange={handleChange} min="50" />
                  {errors.guests && <span className="error-msg">{errors.guests}</span>}
                </div>
                <div className="form-group full-width">
                  <label>Select Dining Experience</label>
                  <div className="food-packages-grid">
                    {Object.entries(foodPackages).map(([key, pkg]) => (
                      <div
                        key={key}
                        className={`food-package-card ${formData.foodPackage === key ? 'selected' : ''}`}
                        onClick={() => setFormData(prev => ({ ...prev, foodPackage: key }))}
                      >
                        <div className="pkg-name">{pkg.name}</div>
                        <div className="pkg-price">LKR {pkg.price}/p</div>
                        <div className="pkg-menu-tooltip">
                          <strong>Menu Highlights:</strong>
                          <ul>
                            {pkg.menu.map((item, i) => <li key={i}>{item}</li>)}
                          </ul>
                        </div>
                        <div className="pkg-hover-hint">Hover for Menu</div>
                      </div>
                    ))}
                  </div>

                  <div className="form-group full-width" style={{ marginTop: '1rem' }}>
                    <label>Dietary Restrictions / Custom Requests</label>
                    <textarea
                      name="customPreferences"
                      value={formData.customPreferences || ''}
                      onChange={handleChange}
                      placeholder="e.g., No Onion/Garlic, Less Spicy, Diabetic Friendly..."
                      rows="3"
                    />
                  </div>
                </div>
              </div>
              <div className="wizard-actions">
                <button className="wizard-btn secondary" onClick={() => navigate(-1)}>Cancel</button>
                <button className="wizard-btn" onClick={handleNextStep}>Check Price & Summary →</button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="step-view">
              <h2 className="step-title">Review Your Selection</h2>
              <div className="summary-board">
                <div className="summary-section">
                  <h3>Event Details</h3>
                  <div className="summary-row"><span>Venue:</span> <strong>{halls.find(h => h.id.toString() === formData.hallType)?.name}</strong></div>
                  <div className="summary-row"><span>Date:</span> <strong>{formData.eventDate.toDateString()}</strong></div>
                  <div className="summary-row"><span>Time:</span> <strong>{formData.selectedSlot === 'lunch' ? 'Morning (08:00 - 15:00)' : 'Evening (17:00 - 23:30)'}</strong></div>
                  <div className="summary-row"><span>Guests:</span> <strong>{formData.guests}</strong></div>
                </div>
                <div className="pricing-board">
                  <h3>Price Breakdown</h3>
                  <div className="price-item"><span>Venue Base Rate</span> <span>LKR {pricing.hallBase.toLocaleString()}</span></div>
                  <div className="price-item"><span>Hospitality & Food</span> <span>LKR {pricing.foodTotal.toLocaleString()}</span></div>
                  <div className="price-total"><span>Total Payable</span> <span>LKR {pricing.total.toLocaleString()}</span></div>
                </div>
              </div>
              <div className="wizard-actions">
                <button className="wizard-btn secondary" onClick={() => setStep(1)}>← Edit Details</button>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                  <button className="wizard-btn" onClick={handleSubmitBooking}>Proceed to Payment →</button>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>* You can choose to pay Full or Advance (50%) in the next step</span>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="step-view center">
              <div className="payment-security">🔒 SSL Secured Checkout</div>
              <h2 className="step-title">Secure Payment</h2>

              <div className="payment-options-container" style={{ margin: '20px 0', textAlign: 'left', width: '100%' }}>
                {formData.paidAmount > 0 && (
                  <div style={{ padding: '15px', background: '#f0f9ff', borderRadius: '8px', marginBottom: '20px', border: '1px solid #bae6fd' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <span style={{ color: '#0369a1', fontWeight: 600 }}>Total Booking Cost:</span>
                      <span style={{ fontWeight: 700 }}>LKR {pricing.total.toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <span style={{ color: '#15803d', fontWeight: 600 }}>Already Paid:</span>
                      <span style={{ fontWeight: 700, color: '#15803d' }}>- LKR {formData.paidAmount.toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #cbd5e1', paddingTop: '5px' }}>
                      <span style={{ color: '#b91c1c', fontWeight: 700 }}>Remaining Balance:</span>
                      <span style={{ fontWeight: 700, color: '#b91c1c' }}>LKR {(pricing.total - formData.paidAmount).toLocaleString()}</span>
                    </div>
                  </div>
                )}

                <div
                  className={`payment-option ${paymentType === 'full' ? 'selected' : ''}`}
                  onClick={() => setPaymentType('full')}
                  style={{
                    padding: '15px',
                    border: `2px solid ${paymentType === 'full' ? '#800000' : '#e2e8f0'}`,
                    borderRadius: '8px',
                    marginBottom: '10px',
                    cursor: 'pointer',
                    background: paymentType === 'full' ? '#fff1f2' : 'white',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#333' }}>
                      {formData.paidAmount > 0 ? "Pay Remaining Balance" : "Pay Full Amount"}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#666' }}>
                      {formData.paidAmount > 0 ? "Clear your dues now" : "Complete your payment now"}
                    </div>
                  </div>
                  <div style={{ fontWeight: 'bold', color: '#800000' }}>
                    LKR {(pricing.total - formData.paidAmount).toLocaleString()}
                  </div>
                </div>

                {/* Only show Advance option if nothing has been paid yet */}
                {formData.paidAmount === 0 && (
                  <div
                    className={`payment-option ${paymentType === 'advance' ? 'selected' : ''}`}
                    onClick={() => setPaymentType('advance')}
                    style={{
                      padding: '15px',
                      border: `2px solid ${paymentType === 'advance' ? '#800000' : '#e2e8f0'}`,
                      borderRadius: '8px',
                      marginBottom: '20px',
                      cursor: 'pointer',
                      background: paymentType === 'advance' ? '#fff1f2' : 'white',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 'bold', color: '#333' }}>Pay Advance (50%)</div>
                      <div style={{ fontSize: '0.9rem', color: '#666' }}>Pay the rest later</div>
                    </div>
                    <div style={{ fontWeight: 'bold', color: '#800000' }}>LKR {(pricing.total / 2).toLocaleString()}</div>
                  </div>
                )}
              </div>

              <div className="payment-amount">
                Total to Pay: LKR {(paymentType === 'advance' ? (pricing.total / 2) : (pricing.total - formData.paidAmount)).toLocaleString()}
              </div>

              <div className="credit-card">
                <div className="card-top">
                  <div className="bank-chip"></div>
                  <div className="brand">VISA</div>
                </div>
                <div className="card-number">4242 4242 4242 4242</div>
                <div className="card-info">
                  <div className="card-holder">
                    <label>HOLDER</label>
                    <div>{formData.name || 'CARD HOLDER'}</div>
                  </div>
                  <div className="card-expiry">
                    <label>EXPIRES</label>
                    <div>12/28</div>
                  </div>
                </div>
              </div>

              <div className="wizard-actions">
                <button className="wizard-btn secondary" onClick={() => setStep(2)}>← Back</button>
                <button className="pay-now-btn" style={{ width: 'auto', flex: 1 }} onClick={handlePayment}>
                  Proceed to Pay LKR {(paymentType === 'advance' ? (pricing.total / 2) : (pricing.total - formData.paidAmount)).toLocaleString()}
                </button>
              </div>
              <div className="payment-trust">Your date will be instantly secured upon successful payment.</div>
            </div>
          )}
        </div>
      </div >
    </div >
  );
};

export default Booking;