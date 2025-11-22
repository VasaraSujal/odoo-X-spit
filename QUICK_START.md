# 🚀 Quick Start Guide - Frontend & Backend

## Prerequisites
- ✅ Backend server created with Express.js
- ✅ MongoDB database connected
- ✅ Frontend integrated with backend API
- ✅ All dependencies installed

## 1️⃣ Start the Backend

Open a terminal and run:

```powershell
cd Backend
npm run dev
```

**Expected Output:**
```
[nodemon] starting `node server.js`
✅ Server running in development mode on port 5000
✅ MongoDB Connected: ac-rbyk3w8-shard-00-00.fxrbf1y.mongodb.net
   Database: stockmaster_db
```

**Backend is running at:** `http://localhost:5000`

## 2️⃣ Start the Frontend

Open a **new terminal** (keep backend running) and run:

```powershell
cd Frontend
npm run dev
```

**Expected Output:**
```
VITE v5.4.21  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

**Frontend is running at:** `http://localhost:5173`

## 3️⃣ Test the Integration

### Create Your First User

1. **Open browser**: `http://localhost:5173/signup`

2. **Fill the form**:
   ```
   Name: John Doe
   Email: john@example.com
   Password: SecurePass123!
   Role: Inventory Manager
   ```

3. **Click "Create Account"**

4. **Success!** You should see a success message and redirect to login

### Login

1. **Enter credentials**:
   ```
   Email: john@example.com
   Password: SecurePass123!
   ```

2. **Click "Sign In"**

3. **Success!** You should be redirected to the dashboard

### Verify Token

Open browser DevTools:
- Press `F12`
- Go to "Application" tab
- Click "Local Storage" → `http://localhost:5173`
- You should see `authToken` with a JWT token

### Test Auto-Login

1. Refresh the page (`F5`)
2. You should stay logged in
3. Check Network tab - you'll see a request to `/api/auth/me`

### Test Logout

1. Click the logout button
2. You'll be redirected to login page
3. Token is removed from Local Storage

## 🎉 That's It!

Your authentication system is now fully functional with:
- ✅ User registration
- ✅ User login
- ✅ JWT token authentication
- ✅ Auto-login on page refresh
- ✅ Logout functionality
- ✅ Role-based access (Inventory Manager / Warehouse Staff)

## 📖 More Information

- **Integration Guide**: See `FRONTEND_BACKEND_INTEGRATION.md`
- **Testing Checklist**: See `INTEGRATION_TESTING.md`
- **Complete Summary**: See `INTEGRATION_SUMMARY.md`
- **Backend API Docs**: See `Backend/README.md`
- **Backend Testing**: See `Backend/TEST_API.md`

## 🛠️ Troubleshooting

### Backend won't start
```powershell
# Make sure you're in the Backend directory
cd Backend

# Install dependencies if missing
npm install

# Try again
npm run dev
```

### Frontend won't start
```powershell
# Make sure you're in the Frontend directory
cd Frontend

# Install dependencies if missing
npm install

# Try again
npm run dev
```

### Can't connect to backend
- Make sure backend is running on port 5000
- Check `.env.local` has `VITE_API_URL=http://localhost:5000/api`
- Check backend `.env` has `FRONTEND_URL=http://localhost:5173`

### Login doesn't work
- Check browser console for errors
- Check Network tab in DevTools
- Make sure MongoDB is connected (check backend terminal)
- Try registering a new user first

---

**Happy coding!** 🎊
