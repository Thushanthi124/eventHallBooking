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

## TASK 3: FUTURE ENHANCEMENTS & PRODUCTION READINESS

**1. Payment Gateway Integration**
A simulated payment workflow is currently implemented to demonstrate transaction handling, logic, and state transitions (e.g., partial vs. full payments). Integration with real-world payment gateways such as Stripe, PayPal, or local Sri Lankan gateways (PayHere) is identified as future work to handle actual monetary transactions securely.

**2. Robust Security Hardening**
Basic authentication (password hashing, verifications) and authorization (role-based access control via decorators) are successfully implemented. However, advanced security hardening is proposed for production deployment, including:
*   **Rate Limiting:** To prevent DDoS or brute-force endpoint attacks.
*   **Token Lifecycle Management:** Implementing HTTP-only secure cookies and refresh/access token rotation.
*   **HTTPS Enforcement:** Ensuring all traffic is encrypted over SSL/TLS in deployment.

**3. Scalability & System Architecture**
The current system is designed for single-instance deployment, which is sufficient for MVP presentation and validation. Scalability enhancements are considered future improvements as operations grow. These include:
*   **Caching Layers:** Implementing Redis or Memcached to quickly serve frequently accessed data (like Hall details and static availability).
*   **Distributed Architecture:** Containerizing the application (Docker/Kubernetes) and setting up load balancers to handle peak traffic during wedding seasons.

---

## TASK 4: DATABASE SCHEMA & NORMALIZATION (3NF)
**Academic Justification**: A well-structured relational database ensures data integrity, minimizes redundancy, and prevents update anomalies. The system's underlying MySQL database complies with the Third Normal Form (3NF).

### Key Architectural Decisions:
1. **Separation of Entities (1NF/2NF Compliance)**
   * User data, Hall details, Food Packages, and Bookings are decoupled into separate tables. 
   * A `Booking` relies on Foreign Keys (`user_id`, `hall_id`, `food_package_id`) rather than duplicating the customer name, hall name, or meal plan details on every transaction row.

2. **Elimination of Transitive Dependencies (3NF Compliance)**
   * **Hall Owner Migration:** Hall owner details (Name, Email, Phone) were historically tightly coupled to the Hall entity. To achieve 3NF, the `HallOwner` entity was created. The `halls` table now only contains a `owner_id` Foreign Key, ensuring that if an owner updates their contact number, it only needs to be updated in a single place.
   * **Calculated Fields Avoidance:** The database stores `price_per_head` for food and `price_per_day` for halls. Total pricing is dynamically calculated on the backend during the booking process (`Booking.total_price = hall_price + food_total`) before insertion, rather than maintaining static, desynchronized sum fields.

---

## TASK 5: ROLE-BASED ACCESS CONTROL (RBAC) & SECURITY
**Academic Justification**: Proper access control ensures that actors within the system only interact with the data and actions necessary for their operational role, subscribing to the Principle of Least Privilege (PoLP).

### RBAC Implementation matrix
The system architecture defines three distinct user personas, enforced by custom Flask decorators (`@token_required`, `@admin_required`, `@staff_required`, `@customer_or_admin`) on the backend API layer.

* **Admin (`A` Prefix):**
  * Full CRUD (Create, Read, Update, Delete) access. 
  * Can manipulate Hall data, approve/reject pending bookings, and assign operational tasks to Staff.
* **Customer (`C` Prefix):**
  * Execution access limited to their own scope.
  * Can browse halls, view availability, secure a booking date, and process Mock Payments. They cannot view other customers' bookings.
* **Staff/Operations (`S` Prefix):**
  * Restricted logistical access. Requires initial Admin approval before account activation (`is_approved = False` by default).
  * Can view their assigned tasks (e.g., Catering Setup, Cleaning) for a specific confirmed booking and update their task status to "Completed". 

---
*Created by Antigravity (Assistant to Senior Lecturer/Engineer)*
