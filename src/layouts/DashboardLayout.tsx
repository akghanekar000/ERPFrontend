// src/layouts/DashboardLayout.tsx

import React, { useState } from 'react';
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { useAuth } from '../components/AuthContext';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `block rounded-lg px-3 py-2 text-sm ${
      isActive
        ? 'bg-blue-600 text-white font-semibold'
        : 'text-gray-700 hover:bg-gray-100'
    }`;

  const closeDrawer = () => setDrawerOpen(false);

  return (
    <div className="min-h-screen bg-gray-50 md:grid md:grid-cols-[250px_minmax(0,1fr)]">
      {/* Mobile drawer backdrop */}
      {drawerOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={closeDrawer}
        />
      )}

      {/* Sidebar / mobile drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r bg-white p-4 transition-transform duration-200 md:static md:z-auto md:w-auto md:translate-x-0 ${
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/"
            onClick={closeDrawer}
            className="text-xl font-bold text-gray-900"
          >
            Billing ERP
          </Link>

          <button
            type="button"
            className="rounded-lg border px-3 py-1 md:hidden"
            onClick={closeDrawer}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        <nav className="flex flex-col gap-2">
          <NavLink
            to="/"
            end
            onClick={closeDrawer}
            className={linkClass}
          >
            Dashboard
          </NavLink>

          <div className="mt-2">
            <details
              open={
                location.pathname === '/settings' ||
                location.pathname.startsWith('/companies')
              }
              className="group"
            >
              <summary className="cursor-pointer rounded-lg px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100">
                Master
                <span className="float-right">⌄</span>
              </summary>

              <div className="mt-2 flex flex-col gap-1 pl-3">
                <NavLink
                  to="/settings"
                  onClick={closeDrawer}
                  className={linkClass}
                >
                  Business Info
                </NavLink>
              </div>
            </details>
          </div>

          <div className="mt-2 border-t pt-3">
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Business
            </p>

            <NavLink
              to="/customers"
              onClick={closeDrawer}
              className={linkClass}
            >
              Customers
            </NavLink>

            <NavLink
              to="/products"
              onClick={closeDrawer}
              className={linkClass}
            >
              Products
            </NavLink>

            <NavLink
              to="/invoices"
              onClick={closeDrawer}
              className={linkClass}
            >
              Invoices
            </NavLink>

            <NavLink
              to="/invoices/new"
              onClick={closeDrawer}
              className={linkClass}
            >
              Create Invoice
            </NavLink>

            <NavLink
              to="/reports/sales"
              onClick={closeDrawer}
              className={linkClass}
            >
              Sales Reports
            </NavLink>
          </div>
        </nav>

        <div className="mt-auto border-t pt-4">
          <p className="mb-3 break-words text-sm text-gray-600">
            {user?.name || user?.email || 'Logged-in user'}
            {user?.role ? ` (${user.role})` : ''}
          </p>

          <button
            type="button"
            className="w-full rounded-lg border px-3 py-2 text-sm hover:bg-gray-100"
            onClick={() => {
              logout();
              closeDrawer();
              navigate('/login');
            }}
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main dashboard area */}
      <div className="min-w-0">
        <header className="flex min-h-16 items-center justify-between gap-3 border-b bg-white px-4 py-3 md:px-6">
          <button
            type="button"
            className="rounded-lg border px-3 py-2 text-sm md:hidden"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open navigation menu"
          >
            ☰ Menu
          </button>

          <div className="hidden text-sm font-medium text-gray-700 md:block">
            Billing ERP
          </div>

          <div className="min-w-0 text-right text-xs text-gray-500">
            Business workspace
          </div>
        </header>

        <main className="min-w-0 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
