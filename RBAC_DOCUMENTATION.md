# Role-Based Access Control (RBAC) Implementation

## Overview
The Event Hall Booking System now has comprehensive role-based access control with two user roles:
- **Customer**: Can book halls and view their own bookings
- **Admin**: Can manage halls, view all bookings, and approve/reject booking requests

## Backend Implementation

### Authentication Decorators (`backend/app/auth.py`)

Three decorators are available:

1. **`@token_required`**: Requires user to be authenticated
2. **`@admin_required`**: Requires user to be authenticated AND have admin role
3. **`@customer_or_admin`**: Requires any authenticated user

### Protected Endpoints

| Endpoint | Method | Access Level | Description |
|----------|--------|--------------|-------------|
| `/api/auth/register` | POST | Public | Register new user |
| `/api/auth/login` | POST | Public | User login |
| `/api/halls` | GET | Public | View all halls |
| `/api/halls` | POST | **Admin Only** | Add new hall |
| `/api/bookings` | POST | Customer/Admin | Create booking |
| `/api/bookings` | GET | Customer/Admin | View bookings (filtered by role) |
| `/api/bookings/<id>/status` | PUT | **Admin Only** | Update booking status |

### API Request Headers

For protected routes, include the user ID in headers:
```
X-User-ID: <user_id>
```

## Frontend Implementation

### Login Behavior

**Email-based role detection (for demo):**
- Emails containing "admin" → Admin role
- All other emails → Customer role

**Examples:**
```
admin@example.com → Admin
john.customer@example.com → Customer
```

### Protected Routes

| Route | Access Level | Redirect Behavior |
|-------|--------------|-------------------|
| `/` | Public | - |
| `/login` | Public | - |
| `/booking` | Customer/Admin | Login required |
| `/dashboard` | Customer/Admin | Login required |
| `/admin` | **Admin Only** | Customers redirected to dashboard |

### Components

**`RoleProtectedRoute`**: Wraps routes that need role-based protection
```jsx
<RoleProtectedRoute allowedRoles={['admin']}>
  <AdminPage />
</RoleProtectedRoute>
```

## User Data Storage (localStorage)

When a user logs in, the following data is stored:
```javascript
localStorage.setItem('isLoggedIn', 'true');
localStorage.setItem('userEmail', email);
localStorage.setItem('userRole', 'admin' | 'customer');
localStorage.setItem('userId', userId);
```

## Testing the System

### Test as Customer
1. Login with: `customer@example.com` / any password
2. You will be redirected to `/booking`
3. You can create bookings
4. You can only see your own bookings
5. Cannot access `/admin` route

### Test as Admin
1. Login with: `admin@example.com` / any password
2. You will be redirected to `/admin`
3. You can add new halls
4. You can view all bookings from all users
5. You can approve/reject booking requests
6. Full access to all routes

## Security Features

✅ Route-level protection (frontend)
✅ API endpoint protection (backend)
✅ Role-based filtering of data
✅ Automatic redirection based on permissions
✅ Session cleanup on logout

## Production Considerations

For production deployment, you should:

1. **Implement JWT tokens** instead of user ID headers
2. **Add secure session management**
3. **Use environment variables** for secrets
4. **Implement password hashing** (already done in backend)
5. **Add HTTPS** for secure communication
6. **Implement CSRF protection**
7. **Add rate limiting** for API endpoints
8. **Connect login to actual backend API** instead of email-based role detection

## Backend Integration Example

To connect the frontend login to your backend API:

```javascript
const handleLogin = async (e) => {
  e.preventDefault();
  
  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userEmail', data.user.email);
      localStorage.setItem('userRole', data.user.role);
      localStorage.setItem('userId', data.user.id);
      
      // Redirect based on role
      navigate(data.user.role === 'admin' ? '/admin' : '/booking');
    }
  } catch (error) {
    console.error('Login failed:', error);
  }
};
```
