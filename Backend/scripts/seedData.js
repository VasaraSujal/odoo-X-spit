import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from '../config/database.js';
import User from '../models/User.model.js';
import Product from '../models/Product.model.js';
import Receipt from '../models/Receipt.model.js';
import DeliveryOrder from '../models/DeliveryOrder.model.js';
import InternalTransfer from '../models/InternalTransfer.model.js';
import StockAdjustment from '../models/StockAdjustment.model.js';
import StockMovement from '../models/StockMovement.model.js';

dotenv.config();

// Sample data
const users = [
  {
    name: 'Admin User',
    email: 'admin@stockmaster.com',
    password: 'admin123',
    role: 'admin'
  },
  {
    name: 'John Manager',
    email: 'manager@stockmaster.com',
    password: 'manager123',
    role: 'inventory_manager'
  },
  {
    name: 'Jane Staff',
    email: 'staff@stockmaster.com',
    password: 'staff123',
    role: 'staff'
  }
];

const products = [
  {
    name: 'Laptop Dell XPS 15',
    sku: 'LAP-DEL-001',
    description: 'High-performance laptop with 15.6" display, Intel i7, 16GB RAM',
    category: 'Electronics',
    unitOfMeasure: 'Unit',
    unitPrice: 1299.99,
    reorderLevel: 10,
    stockByLocation: [
      { warehouseId: 'WH-001', warehouseName: 'Main Warehouse', locationId: 'A-01', locationName: 'Shelf A-01', quantity: 25 },
      { warehouseId: 'WH-002', warehouseName: 'Secondary Warehouse', locationId: 'B-05', locationName: 'Shelf B-05', quantity: 15 }
    ]
  },
  {
    name: 'Wireless Mouse Logitech MX',
    sku: 'ACC-LOG-002',
    description: 'Ergonomic wireless mouse with precision tracking',
    category: 'Accessories',
    unitOfMeasure: 'Unit',
    unitPrice: 79.99,
    reorderLevel: 50,
    stockByLocation: [
      { warehouseId: 'WH-001', warehouseName: 'Main Warehouse', locationId: 'A-02', locationName: 'Shelf A-02', quantity: 150 },
      { warehouseId: 'WH-003', warehouseName: 'West Coast Warehouse', locationId: 'C-10', locationName: 'Shelf C-10', quantity: 80 }
    ]
  },
  {
    name: 'USB-C Cable 2m',
    sku: 'CAB-USB-003',
    description: 'USB-C to USB-C cable, 2 meters, fast charging',
    category: 'Cables',
    unitOfMeasure: 'Unit',
    unitPrice: 14.99,
    reorderLevel: 100,
    stockByLocation: [
      { warehouseId: 'WH-001', warehouseName: 'Main Warehouse', locationId: 'A-03', locationName: 'Shelf A-03', quantity: 500 }
    ]
  },
  {
    name: '27" Monitor Samsung 4K',
    sku: 'MON-SAM-004',
    description: '27-inch 4K UHD monitor with HDR support',
    category: 'Electronics',
    unitOfMeasure: 'Unit',
    unitPrice: 449.99,
    reorderLevel: 15,
    stockByLocation: [
      { warehouseId: 'WH-002', warehouseName: 'Secondary Warehouse', locationId: 'B-01', locationName: 'Shelf B-01', quantity: 30 }
    ]
  },
  {
    name: 'Mechanical Keyboard RGB',
    sku: 'KEY-MEC-005',
    description: 'Mechanical gaming keyboard with RGB backlighting',
    category: 'Accessories',
    unitOfMeasure: 'Unit',
    unitPrice: 129.99,
    reorderLevel: 20,
    stockByLocation: [
      { warehouseId: 'WH-001', warehouseName: 'Main Warehouse', locationId: 'A-04', locationName: 'Shelf A-04', quantity: 45 },
      { warehouseId: 'WH-003', warehouseName: 'West Coast Warehouse', locationId: 'C-11', locationName: 'Shelf C-11', quantity: 35 }
    ]
  },
  {
    name: 'Webcam HD 1080p',
    sku: 'WEB-HD-006',
    description: 'Full HD webcam with built-in microphone',
    category: 'Electronics',
    unitOfMeasure: 'Unit',
    unitPrice: 89.99,
    reorderLevel: 25,
    stockByLocation: [
      { warehouseId: 'WH-002', warehouseName: 'Secondary Warehouse', locationId: 'B-02', locationName: 'Shelf B-02', quantity: 60 }
    ]
  },
  {
    name: 'External SSD 1TB',
    sku: 'SSD-EXT-007',
    description: 'Portable external SSD, 1TB capacity, USB 3.2',
    category: 'Storage',
    unitOfMeasure: 'Unit',
    unitPrice: 149.99,
    reorderLevel: 30,
    stockByLocation: [
      { warehouseId: 'WH-001', warehouseName: 'Main Warehouse', locationId: 'A-05', locationName: 'Shelf A-05', quantity: 75 }
    ]
  },
  {
    name: 'Headphones Noise Cancelling',
    sku: 'AUD-HEA-008',
    description: 'Over-ear headphones with active noise cancelling',
    category: 'Audio',
    unitOfMeasure: 'Unit',
    unitPrice: 249.99,
    reorderLevel: 20,
    stockByLocation: [
      { warehouseId: 'WH-003', warehouseName: 'West Coast Warehouse', locationId: 'C-12', locationName: 'Shelf C-12', quantity: 40 }
    ]
  },
  {
    name: 'HDMI Cable 4K 3m',
    sku: 'CAB-HDM-009',
    description: 'HDMI 2.1 cable, 3 meters, supports 4K@120Hz',
    category: 'Cables',
    unitOfMeasure: 'Unit',
    unitPrice: 19.99,
    reorderLevel: 150,
    stockByLocation: [
      { warehouseId: 'WH-001', warehouseName: 'Main Warehouse', locationId: 'A-03', locationName: 'Shelf A-03', quantity: 300 }
    ]
  },
  {
    name: 'Laptop Stand Aluminum',
    sku: 'ACC-STD-010',
    description: 'Adjustable aluminum laptop stand, ergonomic design',
    category: 'Accessories',
    unitOfMeasure: 'Unit',
    unitPrice: 39.99,
    reorderLevel: 40,
    stockByLocation: [
      { warehouseId: 'WH-002', warehouseName: 'Secondary Warehouse', locationId: 'B-03', locationName: 'Shelf B-03', quantity: 90 }
    ]
  }
];

// Seed function
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Connect to database
    await connectDB();
    
    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Product.deleteMany({});
    await Receipt.deleteMany({});
    await DeliveryOrder.deleteMany({});
    await InternalTransfer.deleteMany({});
    await StockAdjustment.deleteMany({});
    await StockMovement.deleteMany({});
    
    // Create users
    console.log('👥 Creating users...');
    const createdUsers = await User.create(users);
    console.log(`✅ Created ${createdUsers.length} users`);
    
    const adminUser = createdUsers[0];
    const managerUser = createdUsers[1];
    
    // Create products
    console.log('📦 Creating products...');
    const createdProducts = await Product.create(products);
    console.log(`✅ Created ${createdProducts.length} products`);
    
    // Create sample receipts
    console.log('📥 Creating receipts...');
    const receipts = [
      {
        supplierName: 'Tech Distributors Inc',
        warehouseId: 'WH-001',
        warehouseName: 'Main Warehouse',
        date: new Date('2024-11-15'),
        status: 'done',
        lines: [
          {
            productId: createdProducts[0]._id,
            productName: createdProducts[0].name,
            productSku: createdProducts[0].sku,
            quantity: 20,
            unitOfMeasure: 'Unit',
            unitPrice: 1200.00
          },
          {
            productId: createdProducts[1]._id,
            productName: createdProducts[1].name,
            productSku: createdProducts[1].sku,
            quantity: 100,
            unitOfMeasure: 'Unit',
            unitPrice: 75.00
          }
        ],
        notes: 'Initial stock receipt',
        processedBy: adminUser._id,
        processedAt: new Date('2024-11-15')
      },
      {
        supplierName: 'Electronics Wholesale Ltd',
        warehouseId: 'WH-002',
        warehouseName: 'Secondary Warehouse',
        date: new Date('2024-11-18'),
        status: 'ready',
        lines: [
          {
            productId: createdProducts[3]._id,
            productName: createdProducts[3].name,
            productSku: createdProducts[3].sku,
            quantity: 30,
            unitOfMeasure: 'Unit',
            unitPrice: 425.00
          }
        ],
        notes: 'Monitor restock'
      }
    ];
    
    const createdReceipts = await Receipt.create(receipts);
    console.log(`✅ Created ${createdReceipts.length} receipts`);
    
    // Create sample delivery orders
    console.log('📤 Creating delivery orders...');
    const deliveries = [
      {
        customerName: 'ABC Corporation',
        warehouseId: 'WH-001',
        warehouseName: 'Main Warehouse',
        date: new Date('2024-11-20'),
        status: 'done',
        lines: [
          {
            productId: createdProducts[0]._id,
            productName: createdProducts[0].name,
            productSku: createdProducts[0].sku,
            quantity: 5,
            unitOfMeasure: 'Unit',
            unitPrice: 1299.99
          },
          {
            productId: createdProducts[1]._id,
            productName: createdProducts[1].name,
            productSku: createdProducts[1].sku,
            quantity: 20,
            unitOfMeasure: 'Unit',
            unitPrice: 79.99
          }
        ],
        notes: 'Customer order #12345',
        processedBy: managerUser._id,
        processedAt: new Date('2024-11-20')
      },
      {
        customerName: 'XYZ Enterprises',
        warehouseId: 'WH-002',
        warehouseName: 'Secondary Warehouse',
        date: new Date('2024-11-21'),
        status: 'waiting',
        lines: [
          {
            productId: createdProducts[3]._id,
            productName: createdProducts[3].name,
            productSku: createdProducts[3].sku,
            quantity: 10,
            unitOfMeasure: 'Unit',
            unitPrice: 449.99
          }
        ],
        notes: 'Office equipment order'
      }
    ];
    
    const createdDeliveries = await DeliveryOrder.create(deliveries);
    console.log(`✅ Created ${createdDeliveries.length} delivery orders`);
    
    // Create sample internal transfers
    console.log('🔄 Creating internal transfers...');
    const transfers = [
      {
        sourceWarehouseId: 'WH-001',
        sourceWarehouseName: 'Main Warehouse',
        destinationWarehouseId: 'WH-002',
        destinationWarehouseName: 'Secondary Warehouse',
        date: new Date('2024-11-19'),
        status: 'done',
        lines: [
          {
            productId: createdProducts[1]._id,
            productName: createdProducts[1].name,
            productSku: createdProducts[1].sku,
            quantity: 30,
            unitOfMeasure: 'Unit'
          }
        ],
        notes: 'Rebalancing stock between warehouses',
        processedBy: managerUser._id,
        processedAt: new Date('2024-11-19')
      },
      {
        sourceWarehouseId: 'WH-002',
        sourceWarehouseName: 'Secondary Warehouse',
        destinationWarehouseId: 'WH-003',
        destinationWarehouseName: 'West Coast Warehouse',
        date: new Date('2024-11-22'),
        status: 'ready',
        lines: [
          {
            productId: createdProducts[4]._id,
            productName: createdProducts[4].name,
            productSku: createdProducts[4].sku,
            quantity: 15,
            unitOfMeasure: 'Unit'
          }
        ],
        notes: 'Transfer to west coast facility'
      }
    ];
    
    const createdTransfers = await InternalTransfer.create(transfers);
    console.log(`✅ Created ${createdTransfers.length} internal transfers`);
    
    // Create sample stock adjustments
    console.log('📊 Creating stock adjustments...');
    const adjustments = [
      {
        warehouseId: 'WH-001',
        warehouseName: 'Main Warehouse',
        adjustmentType: 'inventory_count',
        date: new Date('2024-11-17'),
        status: 'done',
        lines: [
          {
            productId: createdProducts[2]._id,
            productName: createdProducts[2].name,
            productSku: createdProducts[2].sku,
            currentQuantity: 480,
            newQuantity: 500,
            difference: 20,
            unitOfMeasure: 'Unit',
            reason: 'Physical count correction'
          }
        ],
        notes: 'Monthly inventory count adjustment',
        processedBy: managerUser._id,
        processedAt: new Date('2024-11-17')
      },
      {
        warehouseId: 'WH-002',
        warehouseName: 'Secondary Warehouse',
        adjustmentType: 'damage',
        date: new Date('2024-11-21'),
        status: 'draft',
        lines: [
          {
            productId: createdProducts[3]._id,
            productName: createdProducts[3].name,
            productSku: createdProducts[3].sku,
            currentQuantity: 30,
            newQuantity: 28,
            difference: -2,
            unitOfMeasure: 'Unit',
            reason: 'Damaged during handling'
          }
        ],
        notes: 'Damaged monitors found during inspection'
      }
    ];
    
    const createdAdjustments = await StockAdjustment.create(adjustments);
    console.log(`✅ Created ${createdAdjustments.length} stock adjustments`);
    
    // Create sample stock movements (these would normally be created by processing operations)
    console.log('📝 Creating stock movements...');
    const movements = [
      {
        productId: createdProducts[0]._id,
        productName: createdProducts[0].name,
        productSku: createdProducts[0].sku,
        warehouseId: 'WH-001',
        warehouseName: 'Main Warehouse',
        locationId: 'A-01',
        locationName: 'Shelf A-01',
        movementType: 'receipt',
        quantity: 20,
        quantityBefore: 5,
        quantityAfter: 25,
        referenceType: 'Receipt',
        referenceId: createdReceipts[0]._id,
        referenceNo: createdReceipts[0].referenceNo,
        unitOfMeasure: 'Unit',
        userId: adminUser._id,
        userName: adminUser.name,
        notes: 'Receipt from Tech Distributors Inc',
        timestamp: new Date('2024-11-15')
      },
      {
        productId: createdProducts[0]._id,
        productName: createdProducts[0].name,
        productSku: createdProducts[0].sku,
        warehouseId: 'WH-001',
        warehouseName: 'Main Warehouse',
        locationId: 'A-01',
        locationName: 'Shelf A-01',
        movementType: 'delivery',
        quantity: -5,
        quantityBefore: 25,
        quantityAfter: 20,
        referenceType: 'DeliveryOrder',
        referenceId: createdDeliveries[0]._id,
        referenceNo: createdDeliveries[0].referenceNo,
        unitOfMeasure: 'Unit',
        userId: managerUser._id,
        userName: managerUser.name,
        notes: 'Delivery to ABC Corporation',
        timestamp: new Date('2024-11-20')
      },
      {
        productId: createdProducts[1]._id,
        productName: createdProducts[1].name,
        productSku: createdProducts[1].sku,
        warehouseId: 'WH-001',
        warehouseName: 'Main Warehouse',
        locationId: 'A-02',
        locationName: 'Shelf A-02',
        movementType: 'transfer_out',
        quantity: -30,
        quantityBefore: 180,
        quantityAfter: 150,
        referenceType: 'InternalTransfer',
        referenceId: createdTransfers[0]._id,
        referenceNo: createdTransfers[0].referenceNo,
        unitOfMeasure: 'Unit',
        userId: managerUser._id,
        userName: managerUser.name,
        notes: 'Transfer to Secondary Warehouse',
        timestamp: new Date('2024-11-19')
      },
      {
        productId: createdProducts[2]._id,
        productName: createdProducts[2].name,
        productSku: createdProducts[2].sku,
        warehouseId: 'WH-001',
        warehouseName: 'Main Warehouse',
        locationId: 'A-03',
        locationName: 'Shelf A-03',
        movementType: 'adjustment',
        quantity: 20,
        quantityBefore: 480,
        quantityAfter: 500,
        referenceType: 'StockAdjustment',
        referenceId: createdAdjustments[0]._id,
        referenceNo: createdAdjustments[0].referenceNo,
        unitOfMeasure: 'Unit',
        userId: managerUser._id,
        userName: managerUser.name,
        notes: 'Physical count correction',
        timestamp: new Date('2024-11-17')
      }
    ];
    
    const createdMovements = await StockMovement.create(movements);
    console.log(`✅ Created ${createdMovements.length} stock movements`);
    
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Users: ${createdUsers.length}`);
    console.log(`   Products: ${createdProducts.length}`);
    console.log(`   Receipts: ${createdReceipts.length}`);
    console.log(`   Delivery Orders: ${createdDeliveries.length}`);
    console.log(`   Internal Transfers: ${createdTransfers.length}`);
    console.log(`   Stock Adjustments: ${createdAdjustments.length}`);
    console.log(`   Stock Movements: ${createdMovements.length}`);
    console.log('\n🔐 Test Users:');
    console.log('   Admin: admin@stockmaster.com / admin123');
    console.log('   Manager: manager@stockmaster.com / manager123');
    console.log('   Staff: staff@stockmaster.com / staff123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeder
seedDatabase();
