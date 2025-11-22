# 📦 StockMaster - Advanced Inventory Management System

<div align="center">

![StockMaster](https://img.shields.io/badge/StockMaster-Inventory%20Management-blue?style=for-the-badge)
![MERN Stack](https://img.shields.io/badge/MERN-Stack-green?style=for-the-badge)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

**A comprehensive, enterprise-grade warehouse and inventory management solution built for modern businesses.**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [API Documentation](#-api-documentation) • [Contributors](#-contributors)

</div>

---

## 🎯 Project Overview

StockMaster is a full-stack inventory management system designed to streamline warehouse operations, track stock movements, and provide real-time insights into inventory levels across multiple locations. Built with the MERN stack and modern web technologies, it offers a robust solution for businesses of all sizes.

### 🏆 Built For Hackathon
This project was developed as a comprehensive solution for inventory management challenges faced by modern warehouses and distribution centers.

---

## ✨ Features

### 🔐 Authentication & Authorization
- **JWT-based Authentication** with secure token management
- **Role-Based Access Control (RBAC)**:
  - `inventory_manager` - Full CRUD access and operation processing
  - `warehouse_staff` - Read-only access to view data
- Password encryption using bcrypt
- Token expiration and refresh mechanism
- Protected routes and middleware

### 📦 Product Management
- Complete CRUD operations for products
- SKU-based product identification
- Multi-location stock tracking
- Product categorization
- Reorder level alerts
- Stock by warehouse and location
- Real-time stock availability

### 📥 Receipt Management (Incoming Goods)
- Create and manage goods receipts
- Auto-generated reference numbers (REC-YYYY-NNNN)
- Multi-line items per receipt
- Supplier information tracking
- Status workflow: Draft → Waiting → Ready → Done
- Process receipts to add stock
- Stock movement audit trail

### 📤 Delivery Management (Outgoing Goods)
- Create and manage delivery orders
- Auto-generated reference numbers (DEL-YYYY-NNNN)
- Customer order tracking
- Stock availability validation before processing
- Multi-line item support
- Status workflow management
- Automatic stock deduction on processing

### 🔄 Internal Transfers
- Transfer stock between warehouses
- Source and destination warehouse tracking
- Stock availability validation
- Auto-generated reference numbers (TRF-YYYY-NNNN)
- Dual stock movement creation (transfer_out & transfer_in)
- Transfer status tracking
- Prevents transfers if insufficient stock

### 📊 Stock Adjustments
- Inventory count corrections
- Adjustment types:
  - Inventory Count
  - Damage
  - Loss
  - Found
  - Correction
  - Other
- Before/after quantity tracking
- Auto-generated reference numbers (ADJ-YYYY-NNNN)
- Reason and notes for adjustments
- Audit trail for all changes

### 📈 Stock Movement History
- Complete ledger of all stock changes
- Movement types tracked:
  - Receipt (incoming goods)
  - Delivery (outgoing goods)
  - Transfer In (received from another warehouse)
  - Transfer Out (sent to another warehouse)
  - Adjustment (inventory corrections)
- Quantity before/after tracking
- User accountability (who made the change)
- Reference to source documents
- Filter by product, warehouse, type, date range
- Complete audit trail for compliance

### 🏢 Multi-Warehouse Support
- Manage multiple warehouse locations
- Track stock by warehouse and specific location
- Inter-warehouse transfers
- Location-based stock visibility

### 📱 Modern UI/UX
- Responsive design for all devices
- Intuitive dashboard with KPIs
- Real-time data updates
- Interactive data tables with sorting and filtering
- Status badges for visual clarity
- Toast notifications for user feedback
- Loading states and error handling

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI library
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **Shadcn/ui** - Beautiful, accessible component library
- **React Router v6** - Client-side routing
- **Lucide Icons** - Modern icon library
- **Sonner** - Toast notifications

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication tokens
- **Bcrypt.js** - Password hashing
- **Express Validator** - Input validation
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Nodemon** - Development auto-reload

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Git** - Version control
- **VS Code** - IDE

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (Local installation or MongoDB Atlas account)
- **Git**

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/VasaraSujal/odoo-X-spit.git
cd odoo-X-spit
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd Backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

**Configure `.env` file:**

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/stockmaster_db
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/stockmaster_db

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from root)
cd Frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

**Configure `.env` file:**

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 4. Seed Sample Data (Optional)

```bash
# From Backend directory
npm run seed
```

This will populate the database with:
- 3 sample users (admin, manager, staff)
- 10 sample products
- Sample receipts, deliveries, transfers, and adjustments
- Stock movement history

### 5. Start the Application

**Terminal 1 - Backend:**
```bash
cd Backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd Frontend
npm run dev
```

### 6. Access the Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000/api
- **Health Check:** http://localhost:5000/api/health

---

## 👥 Default User Accounts

After seeding the database, you can login with:

| Role | Email | Password |
|------|-------|----------|
| Admin/Manager | manager@stockmaster.com | manager123 |
| Manager | admin@stockmaster.com | admin123 |
| Staff | staff@stockmaster.com | staff123 |

---

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "warehouse_staff"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Product Endpoints

#### Get All Products
```http
GET /api/products
Authorization: Bearer <token>
```

#### Create Product (Manager Only)
```http
POST /api/products
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Product Name",
  "sku": "SKU-001",
  "description": "Product description",
  "category": "Electronics",
  "unitOfMeasure": "Unit",
  "unitPrice": 99.99,
  "reorderLevel": 10,
  "stockByLocation": [
    {
      "warehouseId": "WH-001",
      "warehouseName": "Main Warehouse",
      "locationId": "A-01",
      "locationName": "Shelf A-01",
      "quantity": 100
    }
  ]
}
```

### Receipt Endpoints

#### Get All Receipts
```http
GET /api/receipts?status=draft&warehouseId=WH-001
Authorization: Bearer <token>
```

#### Create Receipt (Manager Only)
```http
POST /api/receipts
Authorization: Bearer <token>
Content-Type: application/json

{
  "supplierName": "Supplier ABC",
  "warehouseId": "WH-001",
  "warehouseName": "Main Warehouse",
  "date": "2024-11-22",
  "status": "draft",
  "lines": [
    {
      "productId": "product_id_here",
      "quantity": 50,
      "unitPrice": 100
    }
  ],
  "notes": "Initial stock"
}
```

#### Process Receipt (Manager Only)
```http
POST /api/receipts/:id/process
Authorization: Bearer <token>
```

### Delivery Endpoints

#### Get All Deliveries
```http
GET /api/deliveries?status=waiting
Authorization: Bearer <token>
```

#### Create Delivery (Manager Only)
```http
POST /api/deliveries
Authorization: Bearer <token>
Content-Type: application/json

{
  "customerName": "Customer XYZ",
  "warehouseId": "WH-001",
  "warehouseName": "Main Warehouse",
  "date": "2024-11-22",
  "status": "draft",
  "lines": [
    {
      "productId": "product_id_here",
      "quantity": 20,
      "unitPrice": 120
    }
  ]
}
```

#### Process Delivery (Manager Only)
```http
POST /api/deliveries/:id/process
Authorization: Bearer <token>
```

### Internal Transfer Endpoints

#### Get All Transfers
```http
GET /api/transfers
Authorization: Bearer <token>
```

#### Create Transfer (Manager Only)
```http
POST /api/transfers
Authorization: Bearer <token>
Content-Type: application/json

{
  "sourceWarehouseId": "WH-001",
  "sourceWarehouseName": "Main Warehouse",
  "destinationWarehouseId": "WH-002",
  "destinationWarehouseName": "Secondary Warehouse",
  "date": "2024-11-22",
  "lines": [
    {
      "productId": "product_id_here",
      "quantity": 30
    }
  ]
}
```

#### Process Transfer (Manager Only)
```http
POST /api/transfers/:id/process
Authorization: Bearer <token>
```

### Stock Adjustment Endpoints

#### Get All Adjustments
```http
GET /api/adjustments?adjustmentType=inventory_count
Authorization: Bearer <token>
```

#### Create Adjustment (Manager Only)
```http
POST /api/adjustments
Authorization: Bearer <token>
Content-Type: application/json

{
  "warehouseId": "WH-001",
  "warehouseName": "Main Warehouse",
  "adjustmentType": "inventory_count",
  "date": "2024-11-22",
  "lines": [
    {
      "productId": "product_id_here",
      "newQuantity": 95,
      "reason": "Physical count correction"
    }
  ]
}
```

#### Process Adjustment (Manager Only)
```http
POST /api/adjustments/:id/process
Authorization: Bearer <token>
```

### Stock Movement Endpoints

#### Get All Stock Movements
```http
GET /api/stock-movements?productId=xxx&movementType=receipt
Authorization: Bearer <token>
```

#### Get Product Movement History
```http
GET /api/stock-movements/product/:productId
Authorization: Bearer <token>
```

---

## 🗂️ Project Structure

```
odoo-X-spit/
├── Backend/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── product.controller.js
│   │   ├── receipt.controller.js
│   │   ├── delivery.controller.js
│   │   ├── transfer.controller.js
│   │   ├── adjustment.controller.js
│   │   └── stockMovement.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js    # JWT verification & authorization
│   │   └── error.middleware.js
│   ├── models/
│   │   ├── User.model.js
│   │   ├── Product.model.js
│   │   ├── Receipt.model.js
│   │   ├── DeliveryOrder.model.js
│   │   ├── InternalTransfer.model.js
│   │   ├── StockAdjustment.model.js
│   │   └── StockMovement.model.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── product.routes.js
│   │   ├── receipt.routes.js
│   │   ├── delivery.routes.js
│   │   ├── transfer.routes.js
│   │   ├── adjustment.routes.js
│   │   └── stockMovement.routes.js
│   ├── validators/
│   │   ├── auth.validator.js
│   │   ├── product.validator.js
│   │   └── operations.validator.js
│   ├── utils/
│   │   ├── appError.js
│   │   └── catchAsync.js
│   ├── scripts/
│   │   └── seedData.js           # Database seeding script
│   ├── .env
│   ├── server.js                 # Express server setup
│   └── package.json
│
├── Frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   │   ├── auth.ts
│   │   │   ├── products.ts
│   │   │   ├── operations.ts
│   │   │   └── dashboard.ts
│   │   ├── components/
│   │   │   ├── ui/               # Shadcn components
│   │   │   ├── AppLayout.tsx
│   │   │   ├── AppSidebar.tsx
│   │   │   ├── TopBar.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   ├── KPICard.tsx
│   │   │   └── StatusBadge.tsx
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   ├── Login.tsx
│   │   │   │   └── Signup.tsx
│   │   │   ├── dashboard/
│   │   │   │   └── Dashboard.tsx
│   │   │   ├── products/
│   │   │   │   ├── ProductsList.tsx
│   │   │   │   ├── ProductDetail.tsx
│   │   │   │   └── ProductForm.tsx
│   │   │   └── operations/
│   │   │       ├── ReceiptsList.tsx
│   │   │       ├── ReceiptDetail.tsx
│   │   │       ├── ReceiptForm.tsx
│   │   │       ├── DeliveriesList.tsx
│   │   │       ├── DeliveryDetail.tsx
│   │   │       ├── DeliveryForm.tsx
│   │   │       ├── TransfersList.tsx
│   │   │       ├── AdjustmentsList.tsx
│   │   │       └── MovementsList.tsx
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── lib/
│   │   │   └── utils.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── .env
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── components.json
│   └── package.json
│
└── README.md
```

---

## 🔒 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based auth
- **HTTP Security Headers**: Helmet.js middleware
- **CORS Protection**: Configured for specific origins
- **Input Validation**: Express-validator on all endpoints
- **MongoDB Injection Prevention**: Mongoose sanitization
- **Rate Limiting**: Protection against brute force
- **Role-Based Access Control**: Fine-grained permissions

---

## 📊 Database Schema

### Users Collection
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: Enum ['inventory_manager', 'warehouse_staff'],
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Products Collection
```javascript
{
  name: String,
  sku: String (unique),
  description: String,
  category: String,
  unitOfMeasure: String,
  unitPrice: Number,
  reorderLevel: Number,
  stockByLocation: [{
    warehouseId: String,
    warehouseName: String,
    locationId: String,
    locationName: String,
    quantity: Number
  }],
  isActive: Boolean
}
```

### Stock Movements Collection
```javascript
{
  productId: ObjectId,
  productName: String,
  productSku: String,
  warehouseId: String,
  warehouseName: String,
  movementType: Enum ['receipt', 'delivery', 'transfer_in', 'transfer_out', 'adjustment'],
  quantity: Number,
  quantityBefore: Number,
  quantityAfter: Number,
  referenceType: String,
  referenceId: ObjectId,
  referenceNo: String,
  userId: ObjectId,
  userName: String,
  timestamp: Date
}
```

---

## 🎨 Key Features Showcase

### Real-Time Stock Tracking
- Live stock updates across all warehouses
- Multi-location visibility
- Reorder level alerts

### Complete Audit Trail
- Every stock movement is logged
- User accountability
- Before/after quantities tracked
- Reference to source documents

### Smart Validations
- Stock availability checks before deliveries/transfers
- Prevents negative stock
- Duplicate SKU prevention
- Source ≠ Destination validation for transfers

### Workflow Management
- Document status progression
- Cannot modify processed documents
- Clear status indicators

### Multi-Warehouse Operations
- Seamless inter-warehouse transfers
- Location-specific stock tracking
- Warehouse-based filtering

---

## 🚧 Future Enhancements

- [ ] Advanced reporting and analytics
- [ ] Excel/CSV import/export
- [ ] Barcode scanning integration
- [ ] Email notifications
- [ ] Mobile application
- [ ] Purchase order management
- [ ] Supplier management
- [ ] Low stock alerts via email
- [ ] Dashboard charts and graphs
- [ ] Advanced search and filters
- [ ] Batch/lot tracking
- [ ] Serial number tracking
- [ ] Multi-language support
- [ ] Dark mode

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 👨‍💻 Contributors

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/VasaraSujal">
        <img src="https://github.com/VasaraSujal.png" width="100px;" alt="Sujal Vasara"/><br />
        <sub><b>Sujal Vasara</b></sub>
      </a><br />
      <sub>Full Stack Developer</sub>
    </td>
    <td align="center">
      <a href="https://github.com/aryapatel23">
        <img src="https://github.com/aryapatel23.png" width="100px;" alt="Arya Patel"/><br />
        <sub><b>Arya Patel</b></sub>
      </a><br />
      <sub>Full Stack Developer</sub>
    </td>
  </tr>
</table>

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Support

For support and queries:
- Create an issue in the repository
- Contact: [GitHub Profile](https://github.com/VasaraSujal)

---

## 🙏 Acknowledgments

- Thanks to all the open-source libraries and tools used in this project
- Shadcn/ui for the beautiful component library
- MongoDB for the flexible database solution
- The React and Node.js communities

---

<div align="center">

**Built with ❤️ for Modern Warehouse Management**

⭐ Star this repository if you find it helpful!

[Back to Top](#-stockmaster---advanced-inventory-management-system)

</div>
