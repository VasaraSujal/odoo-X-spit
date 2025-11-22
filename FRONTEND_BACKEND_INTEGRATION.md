# Frontend-Backend Integration Guide

## ✅ Integration Complete

The React frontend has been successfully integrated with the Express backend API.

## 🔄 Changes Made

### 1. **Updated `Frontend/src/api/auth.ts`**
   - ❌ Removed: Mock API implementation with simulated delays
   - ✅ Added: Real HTTP requests to backend using native `fetch` API
   - ✅ Added: JWT token handling with Bearer authentication
   - ✅ Added: Backend user to frontend user mapping
   - ✅ Added: Error handling with backend error format
   - ✅ Added: All authentication methods:
     - `login()` - POST /api/auth/login
     - `signup()` - POST /api/auth/register
     - `getCurrentUser()` - GET /api/auth/me
     - `updateProfile()` - PUT /api/auth/profile
     - `updatePassword()` - PUT /api/auth/password
     - `logout()` - POST /api/auth/logout
     - `getAllUsers()` - GET /api/auth/users (Admin only)

### 2. **Updated `Frontend/src/contexts/AuthContext.tsx`**
   - ✅ Added: `refreshUser()` method to reload user data
   - ✅ Enhanced: Error handling in login/logout
   - ✅ Enhanced: Token validation on app startup
   - ✅ Added: Proper error logging

### 3. **Created Environment Configuration**
   - ✅ Created `.env` - Template environment file
   - ✅ Created `.env.local` - Local environment overrides (git-ignored)
   - ✅ Set `VITE_API_URL=http://localhost:5000/api`

## 🔑 Key Features

### Authentication Flow
1. **Login**: User enters credentials → Frontend sends POST to `/api/auth/login` → Backend validates → Returns JWT token and user data → Token stored in localStorage
2. **Auto-login**: App checks localStorage for token on startup → Fetches user data from `/api/auth/me` → Restores session
3. **Protected Routes**: All API calls include `Authorization: Bearer {token}` header
4. **Logout**: Clears localStorage and calls `/api/auth/logout` to invalidate session

### Role Mapping
The backend uses different role names than the frontend:
- **Backend**: `inventory_manager` → **Frontend**: `admin`
- **Backend**: `warehouse_staff` → **Frontend**: `staff`

This mapping is handled automatically in `mapBackendUserToFrontend()` function.

### Error Handling
Backend errors are caught and thrown with appropriate messages:
```typescript
// Backend error format
{
  success: false,
  message: "Error message",
  errors: [{ field: "email", message: "Invalid email" }]
}
```

## 🚀 How to Test

### 1. Start Backend Server
```powershell
cd Backend
npm run dev
```
Backend runs on: **http://localhost:5000**

### 2. Start Frontend Development Server
```powershell
cd Frontend
npm run dev
```
Frontend runs on: **http://localhost:5173**

### 3. Test Registration Flow
1. Go to http://localhost:5173/signup
2. Fill in the form:
   - Name: John Doe
   - Email: john@example.com
   - Password: SecurePass123!
   - Role: Select either "Inventory Manager" or "Warehouse Staff"
3. Click "Create Account"
4. On success, you'll be redirected to login page

### 4. Test Login Flow
1. Go to http://localhost:5173/login
2. Enter credentials:
   - Email: john@example.com
   - Password: SecurePass123!
3. Click "Sign In"
4. On success, you'll be redirected to dashboard
5. Check browser DevTools → Application → Local Storage → `authToken` should be present

### 5. Test Protected Routes
1. After login, navigate to dashboard
2. Open DevTools → Network tab
3. You should see API requests with `Authorization: Bearer {token}` header
4. User data is fetched from `/api/auth/me`

### 6. Test Logout
1. Click logout button in the app
2. Token is removed from localStorage
3. You're redirected to login page
4. Backend session is cleared

## 🛠️ API Endpoints Used

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Create new user account | No |
| POST | `/api/auth/login` | Login with email/password | No |
| GET | `/api/auth/me` | Get current user data | Yes |
| PUT | `/api/auth/profile` | Update user profile | Yes |
| PUT | `/api/auth/password` | Change password | Yes |
| POST | `/api/auth/logout` | Logout and clear session | Yes |
| GET | `/api/auth/users` | Get all users (admin only) | Yes (Admin) |

## 📝 Environment Variables

Create a `.env.local` file in the `Frontend` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

For production, update this to your production backend URL.

## 🔐 Security Notes

1. **JWT Tokens**: Stored in localStorage (7-day expiration)
2. **CORS**: Backend configured to accept requests from `http://localhost:5173`
3. **Password**: Backend hashes passwords with bcrypt (12 salt rounds)
4. **Protected Routes**: All sensitive endpoints require valid JWT token
5. **Role-Based Access**: Admin-only endpoints check user role

## 🐛 Troubleshooting

### Issue: "Network Error" or "Failed to fetch"
**Solution**: Make sure backend server is running on port 5000
```powershell
cd Backend
npm run dev
```

### Issue: "Unauthorized" or "Invalid token"
**Solution**: 
1. Clear localStorage in browser DevTools
2. Logout and login again
3. Check if token is expired (7 day expiration)

### Issue: CORS errors
**Solution**: Backend CORS is configured for `http://localhost:5173`. If you change frontend port, update CORS in `Backend/server.js`:
```javascript
app.use(
  cors({
    origin: "http://localhost:YOUR_PORT",
    credentials: true,
  })
);
```

### Issue: "Cannot find module" errors
**Solution**: Install frontend dependencies
```powershell
cd Frontend
npm install
```

## ✨ Next Steps

The authentication integration is complete! You can now:

1. ✅ **Test the complete auth flow**: Register → Login → Access protected routes → Logout
2. ✅ **Implement other API integrations**: Products, Warehouses, Operations, Dashboard
3. ✅ **Add role-based UI**: Show/hide features based on user role (admin vs staff)
4. ✅ **Implement profile management**: Use `updateProfile()` and `updatePassword()` methods
5. ✅ **Add user management**: Use `getAllUsers()` for admin dashboard

## 📚 Additional Resources

- Backend API Documentation: `Backend/README.md`
- Backend Testing Guide: `Backend/TEST_API.md`
- Backend Setup Guide: `BACKEND_SETUP.md`

---

**Status**: ✅ Frontend successfully integrated with backend API
**Last Updated**: ${new Date().toLocaleString()}
