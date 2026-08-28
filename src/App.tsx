import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Layouts
import { CustomerLayout } from './components/layout/CustomerLayout';
import { DeliveryLayout } from './components/layout/DeliveryLayout';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { CustomerRegisterPage } from './pages/auth/CustomerRegisterPage';
import { DeliveryRegisterPage } from './pages/auth/DeliveryRegisterPage';

// Customer Pages
import { CustomerHomePage } from './pages/customer/CustomerHomePage';
import { CustomerProductsPage } from './pages/customer/CustomerProductsPage';
import { ProductDetailPage } from './pages/customer/ProductDetailPage';
import { CustomerCartPage } from './pages/customer/CustomerCartPage';
import { CustomerCheckoutPage } from './pages/customer/CustomerCheckoutPage';
import { CustomerOrdersPage } from './pages/customer/CustomerOrdersPage';
import { OrderTrackingPage } from './pages/customer/OrderTrackingPage';
import { CustomerProfilePage } from './pages/customer/CustomerProfilePage';

// Delivery Partner Pages
import { DeliveryDashboardPage } from './pages/delivery/DeliveryDashboardPage';
import { AvailableDeliveriesPage } from './pages/delivery/AvailableDeliveriesPage';
import { MyDeliveriesPage } from './pages/delivery/MyDeliveriesPage';
import { ActiveDeliveryTripPage } from './pages/delivery/ActiveDeliveryTripPage';
import { DeliveryEarningsPage } from './pages/delivery/DeliveryEarningsPage';
import { DeliveryProfilePage } from './pages/delivery/DeliveryProfilePage';

// Smart Home Redirector based on user role
const RootRedirector: React.FC = () => {
  const { userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8faf8]">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (userProfile?.role === 'delivery_partner') {
    return <Navigate to="/delivery/dashboard" replace />;
  }

  return <Navigate to="/customer/home" replace />;
};

// Protected Delivery Route Guard
const RequireDeliveryRole: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-950">
        <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (userProfile && userProfile.role !== 'delivery_partner') {
    return <Navigate to="/customer/home" replace />;
  }

  return <>{children}</>;
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* Root smart redirect */}
            <Route path="/" element={<RootRedirector />} />

            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register/customer" element={<CustomerRegisterPage />} />
            <Route path="/register/delivery" element={<DeliveryRegisterPage />} />

            {/* Customer Routes (under CustomerLayout) */}
            <Route path="/customer" element={<CustomerLayout />}>
              <Route index element={<Navigate to="/customer/home" replace />} />
              <Route path="home" element={<CustomerHomePage />} />
              <Route path="products" element={<CustomerProductsPage />} />
              <Route path="products/:id" element={<ProductDetailPage />} />
              <Route path="cart" element={<CustomerCartPage />} />
              <Route path="checkout" element={<CustomerCheckoutPage />} />
              <Route path="orders" element={<CustomerOrdersPage />} />
              <Route path="orders/:id" element={<OrderTrackingPage />} />
              <Route path="profile" element={<CustomerProfilePage />} />
            </Route>

            {/* Delivery Partner Routes (under DeliveryLayout) */}
            <Route
              path="/delivery"
              element={
                <RequireDeliveryRole>
                  <DeliveryLayout />
                </RequireDeliveryRole>
              }
            >
              <Route index element={<Navigate to="/delivery/dashboard" replace />} />
              <Route path="dashboard" element={<DeliveryDashboardPage />} />
              <Route path="available" element={<AvailableDeliveriesPage />} />
              <Route path="orders" element={<MyDeliveriesPage />} />
              <Route path="orders/:id" element={<ActiveDeliveryTripPage />} />
              <Route path="earnings" element={<DeliveryEarningsPage />} />
              <Route path="profile" element={<DeliveryProfilePage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
