// Core entity types for StockMaster IMS

export type DocumentStatus = "draft" | "waiting" | "ready" | "done" | "canceled";

export type MovementType = "receipt" | "delivery" | "transfer" | "adjustment";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "staff";
  preferredWarehouseId?: string;
  avatar?: string;
}

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  address: string;
  contactInfo?: string;
  locations: Location[];
  isActive: boolean;
  createdAt: string;
}

export interface Location {
  id: string;
  name: string;
  warehouseId: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  unitOfMeasure: string;
  description?: string;
  totalStock: number;
  reorderLevel?: number;
  stockByLocation: StockByLocation[];
  createdAt: string;
  updatedAt: string;
}

export interface StockByLocation {
  warehouseId: string;
  warehouseName: string;
  locationId: string;
  locationName: string;
  quantity: number;
}

export interface DocumentLine {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitOfMeasure: string;
  unitPrice?: number;
}

export interface Receipt {
  id: string;
  referenceNo: string;
  supplierName: string;
  warehouseId: string;
  warehouseName: string;
  date: string;
  status: DocumentStatus;
  lines: DocumentLine[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryOrder {
  id: string;
  referenceNo: string;
  customerName: string;
  warehouseId: string;
  warehouseName: string;
  date: string;
  status: DocumentStatus;
  lines: DocumentLine[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InternalTransfer {
  id: string;
  referenceNo: string;
  fromWarehouseId: string;
  fromWarehouseName: string;
  fromLocationId?: string;
  fromLocationName?: string;
  toWarehouseId: string;
  toWarehouseName: string;
  toLocationId?: string;
  toLocationName?: string;
  date: string;
  status: DocumentStatus;
  lines: DocumentLine[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StockAdjustment {
  id: string;
  referenceNo: string;
  productId: string;
  productName: string;
  warehouseId: string;
  warehouseName: string;
  locationId: string;
  locationName: string;
  reason: string;
  systemQuantity: number;
  countedQuantity: number;
  difference: number;
  date: string;
  status: DocumentStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StockMovement {
  id: string;
  timestamp: string;
  productId: string;
  productName: string;
  productSku: string;
  movementType: MovementType;
  fromLocation?: string;
  toLocation?: string;
  quantityChange: number;
  referenceDocumentId: string;
  referenceDocumentType: string;
  warehouseId: string;
  warehouseName: string;
  notes?: string;
}

export interface DashboardKPIs {
  totalProducts: number;
  lowStockItems: number;
  outOfStockItems: number;
  pendingReceipts: number;
  pendingDeliveries: number;
  scheduledTransfers: number;
}
