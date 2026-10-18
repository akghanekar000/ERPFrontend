// src/routes.tsx

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Login from './modules/auth/Login';
import CustomerList from './modules/customers/CustomerList';
import AddCustomer from './modules/customers/AddCustomer';
import ProductList from './modules/products/ProductList';
import AddProduct from './modules/products/AddProduct';
import CreateInvoice from './modules/invoices/CreateInvoice';
import InvoiceList from './modules/invoices/InvoiceList';
import SalesReport from './modules/reports/SalesReport';
import BusinessInfo from './modules/settings/BusinessInfo';
import Home from './pages/Home';
import RegisterPage from './pages/RegisterPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import DashboardLayout from './layouts/DashboardLayout';

const Private: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const token = localStorage.getItem('auth_token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public pages: no dashboard sidebar */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />

      {/* All private pages share the dashboard layout */}
      <Route
        element={
          <Private>
            <DashboardLayout />
          </Private>
        }
      >
        <Route index element={<Home />} />

        <Route path="customers" element={<CustomerList />} />
        <Route path="customers/new" element={<AddCustomer />} />

        <Route path="products" element={<ProductList />} />
        <Route path="products/new" element={<AddProduct />} />

        <Route path="invoices" element={<InvoiceList />} />
        <Route path="invoices/new" element={<CreateInvoice />} />

        <Route path="reports/sales" element={<SalesReport />} />

        <Route path="settings" element={<BusinessInfo />} />
      </Route>

      {/* Unknown URLs return to the dashboard */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

    
        
       
  
