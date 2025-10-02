import React, { useEffect, useState } from 'react';
import { listInvoices } from '../services/invoices.service';
import { listProducts } from '../services/products.service';
import { listCustomers } from '../services/customers.service';

export default function DashboardStats() {
  const [stats, setStats] = useState({ sales: 0, invoices: 0, products: 0, customers: 0 });
  useEffect(() => {
    Promise.all([
      listInvoices(),
      listProducts(),
      listCustomers()
    ]).then(([inv, prod, cust]) => {
      const sales = inv?.reduce((sum: number, i: any) => sum + (i.total || 0), 0) || 0;
      setStats({
        sales,
        invoices: inv?.length || 0,
        products: prod?.length || 0,
        customers: cust?.length || 0,
      });
    });
  }, []);
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
      <div className="p-4 border rounded bg-blue-50 text-blue-900">
        <div className="text-lg font-bold">₹{stats.sales}</div>
        <div className="text-xs">Total Sales</div>
      </div>
      <div className="p-4 border rounded bg-green-50 text-green-900">
        <div className="text-lg font-bold">{stats.invoices}</div>
        <div className="text-xs">Invoices</div>
      </div>
      <div className="p-4 border rounded bg-yellow-50 text-yellow-900">
        <div className="text-lg font-bold">{stats.products}</div>
        <div className="text-xs">Products</div>
      </div>
      <div className="p-4 border rounded bg-purple-50 text-purple-900">
        <div className="text-lg font-bold">{stats.customers}</div>
        <div className="text-xs">Customers</div>
      </div>
    </div>
  );
}
