import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";

// Auth Pages
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";

// Main Pages
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";

// Products Pages
import ProductsList from "./pages/products/ProductsList";
import ProductForm from "./pages/products/ProductForm";
import ProductDetail from "./pages/products/ProductDetail";

// Operations Pages
import ReceiptsList from "./pages/operations/ReceiptsList";
import DeliveriesList from "./pages/operations/DeliveriesList";
import TransfersList from "./pages/operations/TransfersList";
import AdjustmentsList from "./pages/operations/AdjustmentsList";
import MoveHistory from "./pages/operations/MoveHistory";

// Settings Pages
import WarehousesList from "./pages/settings/WarehousesList";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            
            {/* Redirect root to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            
            {/* Products */}
            <Route
              path="/products"
              element={
                <ProtectedRoute>
                  <ProductsList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/products/new"
              element={
                <ProtectedRoute>
                  <ProductForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/products/:id"
              element={
                <ProtectedRoute>
                  <ProductDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/products/:id/edit"
              element={
                <ProtectedRoute>
                  <ProductForm />
                </ProtectedRoute>
              }
            />
            
            {/* Operations */}
            <Route
              path="/operations/receipts"
              element={
                <ProtectedRoute>
                  <ReceiptsList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/operations/deliveries"
              element={
                <ProtectedRoute>
                  <DeliveriesList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/operations/transfers"
              element={
                <ProtectedRoute>
                  <TransfersList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/operations/adjustments"
              element={
                <ProtectedRoute>
                  <AdjustmentsList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/operations/move-history"
              element={
                <ProtectedRoute>
                  <MoveHistory />
                </ProtectedRoute>
              }
            />
            
            {/* Settings */}
            <Route
              path="/settings/warehouses"
              element={
                <ProtectedRoute>
                  <WarehousesList />
                </ProtectedRoute>
              }
            />
            
            {/* Profile */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            
            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
