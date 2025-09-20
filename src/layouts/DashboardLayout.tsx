// src/layouts/DashboardLayout.tsx
import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  // Fallback for missing user
  const userName = user?.name || "Guest";

  return (
    <div className="min-h-screen grid grid-cols-[240px_1fr]">
      <aside className="bg-gray-100 p-4 border-r">
        <div className="font-bold text-lg mb-6">ERP</div>
        <nav className="flex flex-col gap-2">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive
                ? 'font-semibold bg-gray-200 rounded px-2 py-1'
                : 'px-2 py-1 rounded'
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/customers"
            className={({ isActive }) =>
              isActive
                ? 'font-semibold bg-gray-200 rounded px-2 py-1'
                : 'px-2 py-1 rounded'
            }
          >
            Customers
          </NavLink>
          <NavLink
            to="/products"
            className={({ isActive }) =>
              isActive
                ? 'font-semibold bg-gray-200 rounded px-2 py-1'
                : 'px-2 py-1 rounded'
            }
          >
            Products
          </NavLink>
          <NavLink
            to="/invoices"
            className={({ isActive }) =>
              isActive
                ? 'font-semibold bg-gray-200 rounded px-2 py-1'
                : 'px-2 py-1 rounded'
            }
          >
            Invoices
          </NavLink>
          <NavLink
            to="/reports"
            className={({ isActive }) =>
              isActive
                ? 'font-semibold bg-gray-200 rounded px-2 py-1'
                : 'px-2 py-1 rounded'
            }
          >
            Reports
          </NavLink>
        </nav>
      </aside>
      <main className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div />
          <div className="flex items-center gap-3">
            <div className="text-sm">
              {userName}
            </div>
            <button
              className="px-3 py-1 border rounded"
              onClick={() => {
                logout();
                navigate('/login');
              }}
            >
              Logout
            </button>
          </div>
        </div>
        <Outlet />
      </main>
    </div>
  );
}
