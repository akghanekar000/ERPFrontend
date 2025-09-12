// src/routes.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Login from '@modules/auth/Login';
import CustomerList from './modules/customers/CustomerList';
import AddCustomer from './modules/customers/AddCustomer';
import ProductList from './modules/products/ProductList';
import AddProduct from './modules/products/AddProduct';
import CreateInvoice from './modules/invoices/CreateInvoice';
import InvoiceList from './modules/invoices/InvoiceList';
import SalesReport from '@modules/reports/SalesReport';
import BusinessInfo from '@modules/settings/BusinessInfo';

// pages (public / standalone pages)
import RegisterPage from './pages/RegisterPage';
import VerifyEmailPage from './pages/VerifyEmailPage';

const Private: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('auth_token');
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />

      {/* Private (authenticated) routes */}
      <Route
        path="/"
        element={
          <Private>
            <InvoiceList />
          </Private>
        }
      />
      <Route
        path="/customers"
        element={
          <Private>
            <CustomerList />
          </Private>
        }
      />
      <Route
        path="/customers/new"
        element={
          <Private>
            <AddCustomer />
          </Private>
        }
      />
      <Route
        path="/products"
        element={
          <Private>
            <ProductList />
          </Private>
        }
      />
      <Route
        path="/products/new"
        element={
          <Private>
            <AddProduct />
          </Private>
        }
      />
      <Route
        path="/invoices/new"
        element={
          <Private>
            <CreateInvoice />
          </Private>
        }
      />
      <Route
        path="/invoices"
        element={
          <Private>
            <InvoiceList />
          </Private>
        }
      />
      <Route
        path="/reports/sales"
        element={
          <Private>
            <SalesReport />
          </Private>
        }
      />
      <Route
        path="/settings"
        element={
          <Private>
            <BusinessInfo />
          </Private>
        }
      />

      {/* 404 fallback: redirect unknown routes to home (or change to a NotFound page) */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
