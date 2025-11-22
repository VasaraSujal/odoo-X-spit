# StockMaster Backend API

Backend API for StockMaster Inventory Management System with MongoDB and JWT authentication.

## Features

- ✅ User authentication (Register, Login, Logout)
- ✅ Role-based access control (Inventory Manager, Warehouse Staff)
- ✅ JWT token-based authentication
- ✅ Password hashing with bcrypt
- ✅ MongoDB database integration
- ✅ Input validation
- ✅ Error handling
- ✅ Security headers with Helmet
- ✅ CORS enabled

## User Roles

### Inventory Manager
- Full access to all features
- Manage incoming & outgoing stock
- View all users
- Manage warehouse operations

### Warehouse Staff
- Perform transfers
- Picking and shelving
- Stock counting
- Limited administrative access

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file with your configuration (already created)

3. Start the server:
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "inventory_manager" // or "warehouse_staff"
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Logout
```
POST /api/auth/logout
Authorization: Bearer <token>
```

#### Get Current User
```
GET /api/auth/me
Authorization: Bearer <token>
```

#### Update Profile
```
PUT /api/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Updated",
  "preferredWarehouseId": "warehouse-123"
}
```

#### Update Password
```
PUT /api/auth/password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

#### Get All Users (Inventory Manager only)
```
GET /api/auth/users
Authorization: Bearer <token>
```

## Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: 'inventory_manager' | 'warehouse_staff',
  preferredWarehouseId: String,
  avatar: String,
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": []
}
```

## Security Features

- Password hashing with bcrypt (12 rounds)
- JWT token authentication
- HTTP-only cookies for token storage
- CORS protection
- Helmet.js security headers
- Input validation and sanitization
- Role-based access control

## Environment Variables

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7
FRONTEND_URL=http://localhost:5173
```

## Testing

Use tools like Postman or Thunder Client to test the API endpoints.

### Example: Register and Login Flow

1. Register a new user
2. Receive JWT token in response
3. Use token in Authorization header for protected routes
4. Token is also set in HTTP-only cookie

## Next Steps

- Implement warehouse management endpoints
- Add product management endpoints
- Create stock movement tracking
- Add reporting and analytics
- Implement file upload for avatars
