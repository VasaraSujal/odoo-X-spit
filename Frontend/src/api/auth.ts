// Real Backend Authentication API
import type { User } from "@/types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
  role?: "inventory_manager" | "warehouse_staff";
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  email: string;
  otp: string;
  newPassword: string;
}

interface BackendUser {
  id: string;
  name: string;
  email: string;
  role: "inventory_manager" | "warehouse_staff";
  preferredWarehouseId?: string | null;
  avatar?: string | null;
  lastLogin?: string;
  createdAt?: string;
}

// Helper function to convert backend user to frontend User type
const mapBackendUserToFrontend = (backendUser: BackendUser): User => ({
  id: backendUser.id,
  name: backendUser.name,
  email: backendUser.email,
  role: backendUser.role === "inventory_manager" ? "admin" : "staff",
  preferredWarehouseId: backendUser.preferredWarehouseId || undefined,
  avatar: backendUser.avatar || undefined,
});

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

export const authApi = {
  // Login
  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    const data = await fetchWithAuth(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    return {
      user: mapBackendUserToFrontend(data.user),
      token: data.token,
    };
  },

  // Signup
  async signup(signupData: SignupData): Promise<{ message: string }> {
    const data = await fetchWithAuth(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      body: JSON.stringify(signupData),
    });

    return {
      message: data.message || "Account created successfully. Please login.",
    };
  },

  // Forgot Password - Send OTP (Not implemented in backend yet)
  async forgotPassword(forgotData: ForgotPasswordData): Promise<{ message: string }> {
    // TODO: Implement in backend
    console.warn("Forgot password not yet implemented in backend");
    return {
      message: "Password reset feature coming soon",
    };
  },

  // Reset Password with OTP (Not implemented in backend yet)
  async resetPassword(resetData: ResetPasswordData): Promise<{ message: string }> {
    // TODO: Implement in backend
    console.warn("Reset password not yet implemented in backend");
    return {
      message: "Password reset feature coming soon",
    };
  },

  // Get current user
  async getCurrentUser(): Promise<User> {
    const data = await fetchWithAuth(`${API_BASE_URL}/auth/me`);
    return mapBackendUserToFrontend(data.user);
  },

  // Update profile
  async updateProfile(updates: { name?: string; preferredWarehouseId?: string; avatar?: string }): Promise<User> {
    const data = await fetchWithAuth(`${API_BASE_URL}/auth/profile`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
    return mapBackendUserToFrontend(data.user);
  },

  // Update password
  async updatePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const data = await fetchWithAuth(`${API_BASE_URL}/auth/password`, {
      method: "PUT",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    return {
      message: data.message || "Password updated successfully",
    };
  },

  // Logout
  async logout(): Promise<void> {
    try {
      await fetchWithAuth(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
  },

  // Get all users (Admin only)
  async getAllUsers(): Promise<User[]> {
    const data = await fetchWithAuth(`${API_BASE_URL}/auth/users`);
    return data.users.map(mapBackendUserToFrontend);
  },
};
