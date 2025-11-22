// Real Backend Products API
import type { Product } from "@/types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem("authToken");
};

// Helper function to make authenticated requests
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || data.errors?.[0]?.message || "Request failed");
  }

  return data;
};

export const productsApi = {
  // Get all products
  async getProducts(filters?: {
    search?: string;
    category?: string;
    warehouseId?: string;
    page?: number;
    limit?: number;
  }): Promise<Product[]> {
    const params = new URLSearchParams();
    
    if (filters?.search) params.append("search", filters.search);
    if (filters?.category) params.append("category", filters.category);
    if (filters?.warehouseId) params.append("warehouseId", filters.warehouseId);
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());

    const queryString = params.toString();
    const url = `${API_BASE_URL}/products${queryString ? `?${queryString}` : ""}`;
    
    const data = await fetchWithAuth(url);
    return data.products;
  },

  // Get product by ID
  async getProduct(id: string): Promise<Product> {
    const data = await fetchWithAuth(`${API_BASE_URL}/products/${id}`);
    return data.product;
  },

  // Create product
  async createProduct(productData: Omit<Product, "id" | "createdAt" | "updatedAt" | "totalStock" | "stockByLocation">): Promise<Product> {
    const data = await fetchWithAuth(`${API_BASE_URL}/products`, {
      method: "POST",
      body: JSON.stringify(productData),
    });
    return data.product;
  },

  // Update product
  async updateProduct(id: string, productData: Partial<Product>): Promise<Product> {
    const data = await fetchWithAuth(`${API_BASE_URL}/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(productData),
    });
    return data.product;
  },

  // Delete product
  async deleteProduct(id: string): Promise<void> {
    await fetchWithAuth(`${API_BASE_URL}/products/${id}`, {
      method: "DELETE",
    });
  },

  // Get categories
  async getCategories(): Promise<string[]> {
    const data = await fetchWithAuth(`${API_BASE_URL}/products/categories/list`);
    return data.categories;
  },

  // Update stock for a product location
  async updateStock(
    productId: string,
    stockData: {
      warehouseId: string;
      warehouseName: string;
      locationId: string;
      locationName: string;
      quantity: number;
    }
  ): Promise<Product> {
    const data = await fetchWithAuth(`${API_BASE_URL}/products/${productId}/stock`, {
      method: "PUT",
      body: JSON.stringify(stockData),
    });
    return data.product;
  },
};
