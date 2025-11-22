# Frontend-Backend Integration Testing Checklist

## Pre-Flight Checks

- [ ] Backend server is running on `http://localhost:5000`
  ```powershell
  cd Backend
  npm run dev
  ```
  Expected output: `✅ Server running on port 5000` and `✅ MongoDB Connected`

- [ ] Frontend dev server is running on `http://localhost:5173`
  ```powershell
  cd Frontend
  npm run dev
  ```

- [ ] Environment variables are set
  - Backend `.env` has `FRONTEND_URL=http://localhost:5173`
  - Frontend `.env.local` has `VITE_API_URL=http://localhost:5000/api`

## 🧪 Test Cases

### 1. User Registration (/signup)

**Steps:**
1. Navigate to `http://localhost:5173/signup`
2. Fill in form:
   - Name: `Test Manager`
   - Email: `test.manager@example.com`
   - Password: `SecurePass123!`
   - Role: Select `Inventory Manager`
3. Click "Create Account"

**Expected Results:**
- ✅ Success message appears
- ✅ Redirected to login page
- ✅ Check Backend terminal - new user created log

**Backend Verification:**
```powershell
# In PowerShell from Backend directory
Invoke-RestMethod -Uri "http://localhost:5000/api/auth/users" `
  -Method GET `
  -Headers @{
    "Authorization" = "Bearer YOUR_ADMIN_TOKEN"
  }
```

---

### 2. User Login (/login)

**Steps:**
1. Navigate to `http://localhost:5173/login`
2. Enter credentials:
   - Email: `test.manager@example.com`
   - Password: `SecurePass123!`
3. Click "Sign In"

**Expected Results:**
- ✅ Login successful
- ✅ Redirected to dashboard
- ✅ Browser DevTools → Application → Local Storage → `authToken` exists
- ✅ User data appears in UI (name, role, avatar)

**Browser Console Check:**
```javascript
// Should have token
localStorage.getItem('authToken')
```

---

### 3. Protected Route Access

**Steps:**
1. After login, stay on dashboard
2. Open DevTools → Network tab
3. Refresh the page

**Expected Results:**
- ✅ Request to `/api/auth/me` is made
- ✅ Request includes `Authorization: Bearer {token}` header
- ✅ Response returns user data
- ✅ No authentication errors

**Network Tab Check:**
```
Request URL: http://localhost:5000/api/auth/me
Request Method: GET
Request Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Response:
  {
    "success": true,
    "user": {
      "id": "...",
      "name": "Test Manager",
      "email": "test.manager@example.com",
      "role": "inventory_manager"
    }
  }
```

---

### 4. Logout Flow

**Steps:**
1. Click logout button in the UI
2. Check Local Storage
3. Try accessing a protected route

**Expected Results:**
- ✅ `authToken` removed from localStorage
- ✅ Redirected to login page
- ✅ Cannot access dashboard without logging in again
- ✅ Backend receives logout request

**Verification:**
```javascript
// In browser console - should return null
localStorage.getItem('authToken')
```

---

### 5. Token Expiration Handling

**Steps:**
1. Login successfully
2. Manually corrupt the token in localStorage:
   ```javascript
   localStorage.setItem('authToken', 'invalid-token-12345')
   ```
3. Refresh the page

**Expected Results:**
- ✅ Token validation fails
- ✅ User is logged out automatically
- ✅ Redirected to login page
- ✅ No errors in console (handled gracefully)

---

### 6. Role-Based Registration

**Test Case A: Inventory Manager**
1. Register with role: `Inventory Manager`
2. Login with new account
3. Check user object in console

**Expected:**
```javascript
{
  id: "...",
  name: "...",
  email: "...",
  role: "admin" // Frontend maps inventory_manager to admin
}
```

**Test Case B: Warehouse Staff**
1. Register with role: `Warehouse Staff`
2. Login with new account
3. Check user object

**Expected:**
```javascript
{
  role: "staff" // Frontend maps warehouse_staff to staff
}
```

---

### 7. Network Error Handling

**Steps:**
1. Stop the backend server
2. Try to login from frontend

**Expected Results:**
- ✅ Error message displayed to user
- ✅ No app crash
- ✅ Error logged in console
- ✅ User stays on login page

---

### 8. CORS Verification

**Steps:**
1. Open DevTools → Console
2. Login successfully
3. Check for CORS errors

**Expected Results:**
- ✅ No CORS errors
- ✅ Requests go through successfully
- ✅ Cookies are sent with requests (credentials: true)

**CORS Header Check in Network Tab:**
```
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Credentials: true
```

---

### 9. Password Validation

**Steps:**
1. Try to register with weak password: `123`
2. Try to login with wrong password

**Expected Results:**
- ✅ Registration fails with validation error
- ✅ Login fails with "Invalid credentials" message
- ✅ Password is never shown in network requests

---

### 10. Email Validation

**Steps:**
1. Register with invalid email: `notanemail`
2. Register with duplicate email (use existing email)

**Expected Results:**
- ✅ Invalid email error from backend validator
- ✅ Duplicate email error: "User already exists"

---

## 🔍 Backend Health Check

```powershell
# Test backend is responding
Invoke-RestMethod -Uri "http://localhost:5000/api/health"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "API is running",
  "timestamp": "2024-01-XX..."
}
```

---

## 📊 Integration Status

- [x] Auth API replaced with real backend calls
- [x] Token storage in localStorage
- [x] JWT Bearer authentication
- [x] CORS configured correctly
- [x] Role mapping (backend ↔ frontend)
- [x] Error handling
- [x] Auto-login on page refresh
- [x] Logout functionality
- [x] Environment variables configured

---

## 🚨 Common Issues & Solutions

### Issue: "Failed to fetch"
**Cause**: Backend not running
**Solution**: 
```powershell
cd Backend
npm run dev
```

### Issue: "CORS policy error"
**Cause**: Frontend URL mismatch
**Solution**: Check Backend `.env` has `FRONTEND_URL=http://localhost:5173`

### Issue: "Unauthorized 401"
**Cause**: Invalid or expired token
**Solution**: Clear localStorage and login again
```javascript
localStorage.clear()
```

### Issue: "User not found"
**Cause**: Database connection issue
**Solution**: Check MongoDB URI in Backend `.env`

---

## ✅ Success Criteria

All tests pass when:
- ✅ Registration creates users in MongoDB
- ✅ Login returns valid JWT token
- ✅ Token persists across page refreshes
- ✅ Protected routes require authentication
- ✅ Logout clears session
- ✅ Role mapping works correctly
- ✅ Error handling is graceful
- ✅ No CORS errors
- ✅ No console errors during normal flow

---

**Ready to test?** Start both servers and run through the checklist! 🚀
