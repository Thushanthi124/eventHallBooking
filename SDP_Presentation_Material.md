# SDP Interim Presentation: Technical Design & Validation Logic

**Role**: Senior Software Engineering Lecturer & Full-Stack Engineer Review
**Project**: Web-based Wedding Hall Booking Management System
**Focus**: Robust Validation & UI/UX Flow

---

## TASK 1: FORM VALIDATION DESIGN
**Academic Justification**: Frontend validation improves user experience (UX) by providing immediate feedback (latency reduction) and reduces unnecessary load on the server (bandwidth optimization). However, it must always be mirrored by backend validation for security.

### 1. Email Validation
*   **What is validated**:
    *   Non-empty.
    *   Standard format (user@domain.tld).
    *   No whitespace.
*   **Why it is important**: Ensures the communication channel is valid for booking confirmations and password resets. Prevents SQL injection surface (basic level).
*   **React Logic / Pseudo-code**:
    ```javascript
    const validateEmail = (email) => {
        // Regex: Standard HTML5 email validation pattern
        const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        if (!email) return "Email address is required.";
        if (!regex.test(email)) return "Please enter a valid email address (e.g., user@example.com).";
        return null; // Valid
    };
    ```
*   **User Error Message**: *"Invalid email format. Please check for typos."*

### 2. Phone Number Validation (Sri Lanka Context)
*   **What is validated**:
    *   Exactly 10 digits.
    *   Numeric only.
    *   (Optional strict) Starts with '07' or specific area codes.
*   **Why it is important**: Critical for immediate contact regarding event changes. Sri Lankan numbers strictly follow the 10-digit standard (e.g., 0771234567).
*   **React Logic / Pseudo-code**:
    ```javascript
    const validatePhone = (phone) => {
        // Regex: Exactly 10 digits
        const regex = /^\d{10}$/;
        if (!phone) return "Phone number is required.";
        if (!regex.test(phone)) return "Phone number must be exactly 10 digits.";
        return null;
    };
    ```
*   **User Error Message**: *"Please enter a valid 10-digit mobile number."*

### 3. Strong Password Validation
*   **What is validated**:
    *   Minimum 8 characters.
    *   At least 1 Uppercase.
    *   At least 1 Lowercase.
    *   At least 1 Number.
    *   At least 1 Special Character (!@#$%^&*).
*   **Why it is important**: **Security Rubric Requirement**. Prevents Dictionary Attacks and Brute Force attacks. Essential for protecting user booking data and payment history.
*   **React Logic / Pseudo-code**:
    ```javascript
    const validatePassword = (password) => {
        const minLength = /.{8,}/;
        const upper = /[A-Z]/;
        const lower = /[a-z]/;
        const number = /[0-9]/;
        const special = /[!@#$%^&*]/;

        if (!minLength.test(password)) return "Password must be at least 8 characters.";
        if (!upper.test(password)) return "Must contain at least one uppercase letter.";
        if (!lower.test(password)) return "Must contain at least one lowercase letter.";
        if (!number.test(password)) return "Must contain at least one number.";
        if (!special.test(password)) return "Must contain at least one special character (!@#$%^&*).";
        return null;
    };
    ```
*   **User Error Message**: *"Password too weak. Use 8+ chars with Upper, Lower, Number, and Symbol."*

### 4. Confirm Password Matching
*   **What is validated**: Equality check (`password === confirmPassword`).
*   **Why it is important**: Usability Heuristic (#5: Error Prevention). Prevents users from being locked out of their accounts immediately after creation due to typos in masked fields.
*   **React Logic**:
    ```javascript
    if (password !== confirmPassword) {
        setError("Passwords do not match.");
    }
    ```
*   **User Error Message**: *"Passwords do not match. Please try again."*

### 5. Booking Form Required Fields
*   **What is validated**: Date selection, Hall ID presence, Time Slot valid, Guest Count within limits.
*   **Why it is important**: Operational integrity. A booking cannot exist without a time and place. Prevents "Null Reference" errors in the backend and logistical failures.
*   **React Logic**:
    ```javascript
    if (!formData.date) return "Event Date is required.";
    if (!formData.hallId) return "Please select a hall.";
    if (formData.guests > hallCapacity) return `Max capacity is ${hallCapacity}.`;
    ```
*   **User Error Message**: *"Please complete all required fields to proceed."*

---

## TASK 2: END-TO-END UI FLOW (INTERIM PRESENTATION)

| Step | Screen Name | User Action | System Response | Validations Triggered |
| :--- | :--- | :--- | :--- | :--- |
| **1** | **Registration** | User enters Name, Email, Mobile, Password, Confirm Password. Clicks "Register". | Backend creates account. Sends Verification Email. Shows "Success" toast. | Email Format, Phone (10 digits), Password (Strict), Passwords Match. |
| **2** | **Login** | User enters Email & Password. Clicks "Login". | Authenticates user. Generates JWT. Redirects to Dashboard/Home. | Email exists? Password correct? Email Verified? |
| **3** | **Hall Listing (Home)** | User scrolls through halls. Clicks "Show Details". | Navigates to **Hall Details** page. Fetches specific hall data. | N/A (Read Only). |
| **4** | **Availability Check** | User selects a date on the calendar in **Booking Wizard (Step 1)**. | System highlights available slots (Morning/Evening). Greys out booked slots. | Date not in past. Date format valid. |
| **5** | **Booking Creation** | User fills Event Type, Guest Count, Food Package. Clicks "Next". | Calculates Total Price. Moves to **Summary Step**. | Guest count < Capacity. Required fields filled. |
| **6** | **Booking Confirmation** | User reviews details. Clicks "Pay & Confirm". | Sends booking to backend. Backend validates availability again (concurrency check). Saves Booking. | Token valid? Double-booking check (Backend). |
| **7** | **Admin Dashboard** | Admin logs in. Views "Booking Requests". Clicks "Confirm" or "Reject". | Updates status. Triggers **Email Notification** to customer. | Admin privileges verified. |

---
*Created by Antigravity (Assistant to Senior Lecturer/Engineer)*
