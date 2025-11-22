# Products API Backend Documentation

## Overview

Complete backend implementation for Products management with MongoDB integration. The frontend now fetches real data from the database instead of using mock data.

## Backend Files Created

### 1. `Backend/models/Product.model.js`
**Mongoose Schema for Products**

**Fields:**
- `name` (String, required, max 200 chars)
- `sku` (String, required, unique, uppercase, max 50 chars)
- `category` (String, required)
- `unitOfMeasure` (String, default: "Unit")
- `description` (String, optional, max 1000 chars)
- `reorderLevel` (Number, min 0, default 0)
- `stockByLocation` (Array of stock locations)
  - `warehouseId` (ObjectId, ref: Warehouse)
  - `warehouseName` (String)
  - `locationId` (String)
  - `locationName` (String)
  - `quantity` (Number, min 0)
- `isActive` (Boolean, default true)
- `createdAt` (Timestamp)
- `updatedAt` (Timestamp)

**Virtual Fields:**
- `totalStock` - Calculated from sum of all stockByLocation quantities

**Indexes:**
- Text search on: name, sku, category
- Index on: category, sku

### 2. `Backend/controllers/product.controller.js`
**API Controllers**

| Function | Description |
|----------|-------------|
| `getProducts` | Get all products with filters (search, category, warehouse) and pagination |
| `getProduct` | Get single product by ID |
| `createProduct` | Create new product (Admin/Manager only) |
| `updateProduct` | Update product details (Admin/Manager only) |
| `deleteProduct` | Soft delete product (Admin only) |
| `getCategories` | Get list of all unique categories |
| `updateStock` | Update stock quantity for a specific warehouse/location |

### 3. `Backend/routes/product.routes.js`
**API Routes**

All routes require authentication (`protect` middleware).

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/products` | All authenticated users | Get all products |
| POST | `/api/products` | inventory_manager | Create product |
| GET | `/api/products/categories/list` | All authenticated users | Get categories |
| GET | `/api/products/:id` | All authenticated users | Get product by ID |
| PUT | `/api/products/:id` | inventory_manager | Update product |
| DELETE | `/api/products/:id` | inventory_manager | Delete product |
| PUT | `/api/products/:id/stock` | inventory_manager | Update stock |

### 4. `Backend/validators/product.validator.js`
**Input Validation**

**validateProduct:**
- name: required, max 200 chars
- sku: required, max 50 chars, alphanumeric + hyphens
- category: required
- unitOfMeasure: optional
- description: optional, max 1000 chars
- reorderLevel: optional, positive integer

**validateStockUpdate:**
- warehouseId: required, valid MongoDB ObjectId
- warehouseName: required
- locationId: required
- locationName: required
- quantity: required, positive integer

### 5. `Backend/server.js`
**Updated to include product routes:**
```javascript
import productRoutes from './routes/product.routes.js';
app.use('/api/products', productRoutes);
```

## Frontend Updates

### `Frontend/src/api/products.ts`
Replaced mock implementation with real API calls using `fetch`:

**Methods:**
- `getProducts(filters?)` - Fetch products with optional filters
- `getProduct(id)` - Fetch single product
- `createProduct(data)` - Create new product
- `updateProduct(id, data)` - Update product
- `deleteProduct(id)` - Delete product
- `getCategories()` - Get all categories
- `updateStock(productId, stockData)` - Update stock for location

**Features:**
- JWT token authentication
- Error handling
- Query parameter support for filtering
- TypeScript type safety

## API Endpoints

### 1. Get All Products
```http
GET /api/products?search=&category=&warehouseId=&page=1&limit=50
Authorization: Bearer {token}
```

**Query Parameters:**
- `search` (optional) - Search by name or SKU
- `category` (optional) - Filter by category
- `warehouseId` (optional) - Filter by warehouse
- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 50) - Items per page

**Response:**
```json
{
  "success": true,
  "count": 25,
  "total": 100,
  "page": 1,
  "pages": 2,
  "products": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "Product Name",
      "sku": "PROD-001",
      "category": "Electronics",
      "unitOfMeasure": "Unit",
      "description": "Product description",
      "reorderLevel": 10,
      "totalStock": 150,
      "stockByLocation": [
        {
          "warehouseId": "507f1f77bcf86cd799439012",
          "warehouseName": "Main Warehouse",
          "locationId": "loc-001",
          "locationName": "A-01-01",
          "quantity": 100
        }
      ],
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### 2. Get Single Product
```http
GET /api/products/:id
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "product": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Product Name",
    "sku": "PROD-001",
    ...
  }
}
```

### 3. Create Product
```http
POST /api/products
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "New Product",
  "sku": "PROD-002",
  "category": "Electronics",
  "unitOfMeasure": "Unit",
  "description": "Product description",
  "reorderLevel": 10
}
```

**Response:**
```json
{
  "success": true,
  "message": "Product created successfully",
  "product": { ... }
}
```

### 4. Update Product
```http
PUT /api/products/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Updated Product Name",
  "reorderLevel": 15
}
```

**Response:**
```json
{
  "success": true,
  "message": "Product updated successfully",
  "product": { ... }
}
```

### 5. Delete Product
```http
DELETE /api/products/:id
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

**Note:** Cannot delete products with stock > 0. Performs soft delete (sets isActive = false).

### 6. Get Categories
```http
GET /api/products/categories/list
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "count": 5,
  "categories": [
    "Electronics",
    "Furniture",
    "Office Supplies",
    "Tools",
    "Hardware"
  ]
}
```

### 7. Update Stock
```http
PUT /api/products/:id/stock
Authorization: Bearer {token}
Content-Type: application/json

{
  "warehouseId": "507f1f77bcf86cd799439012",
  "warehouseName": "Main Warehouse",
  "locationId": "loc-001",
  "locationName": "A-01-01",
  "quantity": 150
}
```

**Response:**
```json
{
  "success": true,
  "message": "Stock updated successfully",
  "product": { ... }
}
```

## Testing

### Using PowerShell

**1. Get All Products:**
```powershell
$token = "your-jwt-token"
Invoke-RestMethod -Uri "http://localhost:5000/api/products" `
  -Method GET `
  -Headers @{
    "Authorization" = "Bearer $token"
  }
```

**2. Search Products:**
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/products?search=laptop" `
  -Method GET `
  -Headers @{
    "Authorization" = "Bearer $token"
  }
```

**3. Create Product:**
```powershell
$productData = @{
  name = "Laptop"
  sku = "LAP-001"
  category = "Electronics"
  unitOfMeasure = "Unit"
  description = "15-inch laptop"
  reorderLevel = 5
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/products" `
  -Method POST `
  -Headers @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
  } `
  -Body $productData
```

**4. Get Categories:**
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/products/categories/list" `
  -Method GET `
  -Headers @{
    "Authorization" = "Bearer $token"
  }
```

## Features

### ✅ Implemented
- Complete CRUD operations for products
- Search functionality (name, SKU)
- Category filtering
- Warehouse filtering
- Pagination support
- Stock management by warehouse/location
- Soft delete (preserves data)
- Input validation
- SKU uniqueness check
- Role-based access control
- JWT authentication
- Error handling

### 🔒 Security
- All routes require authentication
- Create/Update/Delete restricted to inventory_manager role
- Input validation with express-validator
- SQL injection protection (MongoDB)
- XSS protection

### 📊 Data Integrity
- SKU uniqueness enforced
- Cannot delete products with existing stock
- Automatic uppercase conversion for SKU
- Stock quantity validation (min: 0)
- Timestamp tracking (createdAt, updatedAt)

## Database Schema

**Collection:** `products`

**Sample Document:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Wireless Mouse",
  "sku": "MOUSE-001",
  "category": "Electronics",
  "unitOfMeasure": "Unit",
  "description": "Ergonomic wireless mouse",
  "reorderLevel": 10,
  "stockByLocation": [
    {
      "warehouseId": "507f1f77bcf86cd799439012",
      "warehouseName": "Main Warehouse",
      "locationId": "A-01-01",
      "locationName": "Shelf A, Row 1, Position 1",
      "quantity": 50
    },
    {
      "warehouseId": "507f1f77bcf86cd799439013",
      "warehouseName": "Secondary Warehouse",
      "locationId": "B-02-05",
      "locationName": "Shelf B, Row 2, Position 5",
      "quantity": 30
    }
  ],
  "isActive": true,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-20T14:45:00.000Z"
}
```

## Error Handling

**Common Errors:**

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Validation Error | Invalid input data |
| 400 | SKU Exists | SKU already in use |
| 400 | Has Stock | Cannot delete product with stock |
| 401 | Unauthorized | No token or invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Product not found |
| 500 | Server Error | Internal server error |

**Error Response Format:**
```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "field": "sku",
      "message": "SKU already exists"
    }
  ]
}
```

## Next Steps

To use the products API:

1. **Start Backend:**
   ```powershell
   cd Backend
   npm run dev
   ```

2. **Start Frontend:**
   ```powershell
   cd Frontend
   npm run dev
   ```

3. **Create Sample Products:**
   - Login to get JWT token
   - Use the token to create products via API or UI

4. **Test in UI:**
   - Navigate to Products page
   - Products will load from MongoDB
   - Create, edit, delete products
   - Search and filter functionality

## Migration from Mock Data

The frontend now uses real backend data. To populate initial products:

1. **Option 1:** Use the UI to create products manually
2. **Option 2:** Use the API to bulk import products
3. **Option 3:** Create a seed script (recommended for development)

---

**Status:** ✅ **PRODUCTS BACKEND COMPLETE**  
**Database:** MongoDB Atlas - stockmaster_db  
**Collection:** products  
**Frontend Integration:** Complete - Mock data removed  

Ready to manage real product inventory! 🚀
