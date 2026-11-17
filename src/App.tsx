import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { VoiceProvider } from './context/VoiceContext';
import { CartProvider } from './context/CartContext';
import { VoiceCounterAssistantModal } from './components/voice/VoiceCounterAssistantModal';

// Layouts & Guard
import { PublicLayout } from './components/layout/PublicLayout';
import { AdminLayout } from './components/layout/AdminLayout';
import { ProtectedRoute } from './components/shared/ProtectedRoute';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { ServicesPage } from './pages/public/ServicesPage';
import { ServiceDetailPage } from './pages/public/ServiceDetailPage';
import { AndroidRepairPage } from './pages/public/AndroidRepairPage';
import { IPhoneRepairPage } from './pages/public/IPhoneRepairPage';
import { AccessoriesPage } from './pages/public/AccessoriesPage';
import { ShopPage } from './pages/public/ShopPage';
import { AboutPage } from './pages/public/AboutPage';
import { ContactPage } from './pages/public/ContactPage';
import { RepairRequestPage } from './pages/public/RepairRequestPage';
import { RepairStatusPage } from './pages/public/RepairStatusPage';
import { EstimateApprovalPage } from './pages/public/EstimateApprovalPage';
import { PrivacyPolicyPage } from './pages/public/PrivacyPolicyPage';
import { TermsPage } from './pages/public/TermsPage';

// Admin Pages
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { ForgotPasswordPage } from './pages/admin/ForgotPasswordPage';
import { DashboardPage } from './pages/admin/DashboardPage';
import { EnquiriesPage } from './pages/admin/EnquiriesPage';
import { CustomersPage } from './pages/admin/CustomersPage';
import { CustomerDetailPage } from './pages/admin/CustomerDetailPage';
import { RepairsListPage } from './pages/admin/RepairsListPage';
import { RepairIntakePage } from './pages/admin/RepairIntakePage';
import { RepairDetailPage } from './pages/admin/RepairDetailPage';
import { EstimatesPage } from './pages/admin/EstimatesPage';
import { InvoicesPage } from './pages/admin/InvoicesPage';
import { PaymentsPage } from './pages/admin/PaymentsPage';
import { InventoryPage } from './pages/admin/InventoryPage';
import { WarrantiesPage } from './pages/admin/WarrantiesPage';
import { ReportsPage } from './pages/admin/ReportsPage';
import { StaffPage } from './pages/admin/StaffPage';
import { SettingsPage } from './pages/admin/SettingsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SettingsProvider>
          <VoiceProvider>
            <CartProvider>
              <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <VoiceCounterAssistantModal />
                <Routes>
                {/* Public Routes with Public Navbar & Footer */}
                <Route element={<PublicLayout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/shop" element={<ShopPage />} />
                  <Route path="/shop/:category" element={<ShopPage />} />
                  <Route path="/services" element={<ServicesPage />} />
                  <Route path="/services/:slug" element={<ServiceDetailPage />} />
                  <Route path="/android-repair" element={<AndroidRepairPage />} />
                  <Route path="/iphone-repair" element={<IPhoneRepairPage />} />
                  <Route path="/accessories" element={<AccessoriesPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/repair-request" element={<RepairRequestPage />} />
                  <Route path="/repair-status" element={<RepairStatusPage />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                  <Route path="/terms" element={<TermsPage />} />
                </Route>

              {/* Secure Customer Estimate Approval (Standalone Minimal View) */}
              <Route path="/estimate-approval/:token" element={<EstimateApprovalPage />} />

              {/* Admin Auth Pages */}
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/admin/forgot-password" element={<ForgotPasswordPage />} />

              {/* Protected Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<DashboardPage />} />
                <Route path="enquiries" element={<EnquiriesPage />} />
                <Route path="customers" element={<CustomersPage />} />
                <Route path="customers/:customerId" element={<CustomerDetailPage />} />
                <Route path="repairs" element={<RepairsListPage />} />
                <Route path="repairs/new" element={<RepairIntakePage />} />
                <Route path="repairs/:repairId" element={<RepairDetailPage />} />
                <Route path="estimates" element={<EstimatesPage />} />
                <Route path="invoices" element={<InvoicesPage />} />
                <Route path="payments" element={<PaymentsPage />} />
                <Route path="inventory" element={<InventoryPage />} />
                <Route path="warranties" element={<WarrantiesPage />} />
                <Route
                  path="reports"
                  element={
                    <ProtectedRoute allowedRoles={['owner', 'manager']}>
                      <ReportsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="staff"
                  element={
                    <ProtectedRoute allowedRoles={['owner']}>
                      <StaffPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="settings"
                  element={
                    <ProtectedRoute allowedRoles={['owner']}>
                      <SettingsPage />
                    </ProtectedRoute>
                  }
                />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
          </CartProvider>
        </VoiceProvider>
      </SettingsProvider>
    </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
