// Operations API
import type {
  Receipt,
  DeliveryOrder,
  InternalTransfer,
  StockAdjustment,
  StockMovement,
  DocumentStatus,
} from "@/types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem("authToken");
};

// Helper function to make authenticated requests
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });
  
  if (!response.ok) {
    let error;
    try {
      error = await response.json();
    } catch (e) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    throw new Error(error.message || "API request failed");
  }
  
  return response.json();
};

// RECEIPTS
export const receiptsApi = {
  async getReceipts(filters?: { status?: DocumentStatus; warehouseId?: string }): Promise<Receipt[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.warehouseId) params.append("warehouseId", filters.warehouseId);
    
    const queryString = params.toString();
    const url = `${API_BASE_URL}/receipts${queryString ? `?${queryString}` : ""}`;
    
    const response = await fetchWithAuth(url);
    return response.data;
  },

  async getReceipt(id: string): Promise<Receipt> {
    const response = await fetchWithAuth(`${API_BASE_URL}/receipts/${id}`);
    return response.data;
  },

  async createReceipt(data: Omit<Receipt, "id" | "referenceNo" | "createdAt" | "updatedAt">): Promise<Receipt> {
    const response = await fetchWithAuth(`${API_BASE_URL}/receipts`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.data;
  },

  async updateReceipt(id: string, data: Partial<Receipt>): Promise<Receipt> {
    const response = await fetchWithAuth(`${API_BASE_URL}/receipts/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return response.data;
  },

  async processReceipt(id: string): Promise<Receipt> {
    const response = await fetchWithAuth(`${API_BASE_URL}/receipts/${id}/process`, {
      method: "POST",
    });
    return response.data;
  },

  async deleteReceipt(id: string): Promise<void> {
    await fetchWithAuth(`${API_BASE_URL}/receipts/${id}`, {
      method: "DELETE",
    });
  },
};

// DELIVERY ORDERS
export const deliveryOrdersApi = {
  async getDeliveryOrders(filters?: { status?: DocumentStatus; warehouseId?: string }): Promise<DeliveryOrder[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.warehouseId) params.append("warehouseId", filters.warehouseId);
    
    const queryString = params.toString();
    const url = `${API_BASE_URL}/deliveries${queryString ? `?${queryString}` : ""}`;
    
    const response = await fetchWithAuth(url);
    return response.data;
  },

  async getDeliveryOrder(id: string): Promise<DeliveryOrder> {
    const response = await fetchWithAuth(`${API_BASE_URL}/deliveries/${id}`);
    return response.data;
  },

  async createDeliveryOrder(data: Omit<DeliveryOrder, "id" | "referenceNo" | "createdAt" | "updatedAt">): Promise<DeliveryOrder> {
    const response = await fetchWithAuth(`${API_BASE_URL}/deliveries`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.data;
  },

  async updateDeliveryOrder(id: string, data: Partial<DeliveryOrder>): Promise<DeliveryOrder> {
    const response = await fetchWithAuth(`${API_BASE_URL}/deliveries/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return response.data;
  },

  async processDeliveryOrder(id: string): Promise<DeliveryOrder> {
    const response = await fetchWithAuth(`${API_BASE_URL}/deliveries/${id}/process`, {
      method: "POST",
    });
    return response.data;
  },

  async deleteDeliveryOrder(id: string): Promise<void> {
    await fetchWithAuth(`${API_BASE_URL}/deliveries/${id}`, {
      method: "DELETE",
    });
  },
};

// INTERNAL TRANSFERS
export const internalTransfersApi = {
  async getInternalTransfers(filters?: { status?: DocumentStatus; sourceWarehouseId?: string; destinationWarehouseId?: string }): Promise<InternalTransfer[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.sourceWarehouseId) params.append("sourceWarehouseId", filters.sourceWarehouseId);
    if (filters?.destinationWarehouseId) params.append("destinationWarehouseId", filters.destinationWarehouseId);
    
    const queryString = params.toString();
    const url = `${API_BASE_URL}/transfers${queryString ? `?${queryString}` : ""}`;
    
    const response = await fetchWithAuth(url);
    return response.data;
  },

  async getInternalTransfer(id: string): Promise<InternalTransfer> {
    const response = await fetchWithAuth(`${API_BASE_URL}/transfers/${id}`);
    return response.data;
  },

  async createInternalTransfer(data: Omit<InternalTransfer, "id" | "referenceNo" | "createdAt" | "updatedAt">): Promise<InternalTransfer> {
    const response = await fetchWithAuth(`${API_BASE_URL}/transfers`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.data;
  },

  async updateInternalTransfer(id: string, data: Partial<InternalTransfer>): Promise<InternalTransfer> {
    const response = await fetchWithAuth(`${API_BASE_URL}/transfers/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return response.data;
  },

  async processInternalTransfer(id: string): Promise<InternalTransfer> {
    const response = await fetchWithAuth(`${API_BASE_URL}/transfers/${id}/process`, {
      method: "POST",
    });
    return response.data;
  },

  async deleteInternalTransfer(id: string): Promise<void> {
    await fetchWithAuth(`${API_BASE_URL}/transfers/${id}`, {
      method: "DELETE",
    });
  },
};

// STOCK ADJUSTMENTS
export const stockAdjustmentsApi = {
  async getStockAdjustments(filters?: { status?: DocumentStatus; warehouseId?: string; adjustmentType?: string }): Promise<StockAdjustment[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.warehouseId) params.append("warehouseId", filters.warehouseId);
    if (filters?.adjustmentType) params.append("adjustmentType", filters.adjustmentType);
    
    const queryString = params.toString();
    const url = `${API_BASE_URL}/adjustments${queryString ? `?${queryString}` : ""}`;
    
    const response = await fetchWithAuth(url);
    return response.data;
  },

  async getStockAdjustment(id: string): Promise<StockAdjustment> {
    const response = await fetchWithAuth(`${API_BASE_URL}/adjustments/${id}`);
    return response.data;
  },

  async createStockAdjustment(data: Omit<StockAdjustment, "id" | "referenceNo" | "createdAt" | "updatedAt">): Promise<StockAdjustment> {
    const response = await fetchWithAuth(`${API_BASE_URL}/adjustments`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.data;
  },

  async updateStockAdjustment(id: string, data: Partial<StockAdjustment>): Promise<StockAdjustment> {
    const response = await fetchWithAuth(`${API_BASE_URL}/adjustments/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return response.data;
  },

  async processStockAdjustment(id: string): Promise<StockAdjustment> {
    const response = await fetchWithAuth(`${API_BASE_URL}/adjustments/${id}/process`, {
      method: "POST",
    });
    return response.data;
  },

  async deleteStockAdjustment(id: string): Promise<void> {
    await fetchWithAuth(`${API_BASE_URL}/adjustments/${id}`, {
      method: "DELETE",
    });
  },
};

// STOCK MOVEMENTS (LEDGER)
export const stockMovementsApi = {
  async getStockMovements(filters?: {
    productId?: string;
    warehouseId?: string;
    movementType?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<StockMovement[]> {
    const params = new URLSearchParams();
    if (filters?.productId) params.append("productId", filters.productId);
    if (filters?.warehouseId) params.append("warehouseId", filters.warehouseId);
    if (filters?.movementType) params.append("movementType", filters.movementType);
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);
    
    const queryString = params.toString();
    const url = `${API_BASE_URL}/stock-movements${queryString ? `?${queryString}` : ""}`;
    
    const response = await fetchWithAuth(url);
    return response.data;
  },

  async getProductMovements(productId: string): Promise<StockMovement[]> {
    const response = await fetchWithAuth(`${API_BASE_URL}/stock-movements/product/${productId}`);
    return response.data;
  },
};
