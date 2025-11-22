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
import ReceiptDetail from "./pages/operations/ReceiptDetail";
import ReceiptForm from "./pages/operations/ReceiptForm";
import DeliveriesList from "./pages/operations/DeliveriesList";
import DeliveryDetail from "./pages/operations/DeliveryDetail";
import DeliveryForm from "./pages/operations/DeliveryForm";
import TransfersList from "./pages/operations/TransfersList";
import TransferDetail from "./pages/operations/TransferDetail";
import TransferForm from "./pages/operations/TransferForm";
import AdjustmentsList from "./pages/operations/AdjustmentsList";
import AdjustmentDetail from "./pages/operations/AdjustmentDetail";
import AdjustmentForm from "./pages/operations/AdjustmentForm";
import MoveHistory from "./pages/operations/MoveHistory";

// Settings Pages
import WarehousesList from "./pages/settings/WarehousesList";
import WarehouseDetail from "./pages/settings/WarehouseDetail";
import WarehouseForm from "./pages/settings/WarehouseForm";

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
              path="/operations/receipts/new"
              element={
                <ProtectedRoute>
                  <ReceiptForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/operations/receipts/:id"
              element={
                <ProtectedRoute>
                  <ReceiptDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/operations/receipts/:id/edit"
              element={
                <ProtectedRoute>
                  <ReceiptForm />
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
              path="/operations/deliveries/new"
              element={
                <ProtectedRoute>
                  <DeliveryForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/operations/deliveries/:id"
              element={
                <ProtectedRoute>
                  <DeliveryDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/operations/deliveries/:id/edit"
              element={
                <ProtectedRoute>
                  <DeliveryForm />
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
              path="/operations/transfers/new"
              element={
                <ProtectedRoute>
                  <TransferForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/operations/transfers/:id"
              element={
                <ProtectedRoute>
                  <TransferDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/operations/transfers/:id/edit"
              element={
                <ProtectedRoute>
                  <TransferForm />
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
              path="/operations/adjustments/new"
              element={
                <ProtectedRoute>
                  <AdjustmentForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/operations/adjustments/:id"
              element={
                <ProtectedRoute>
                  <AdjustmentDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/operations/adjustments/:id/edit"
              element={
                <ProtectedRoute>
                  <AdjustmentForm />
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
            <Route
              path="/settings/warehouses/new"
              element={
                <ProtectedRoute>
                  <WarehouseForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings/warehouses/:id"
              element={
                <ProtectedRoute>
                  <WarehouseDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings/warehouses/:id/edit"
              element={
                <ProtectedRoute>
                  <WarehouseForm />
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
