import React, { useEffect, useState } from 'react';
import { listOrders } from '../../services/orders.service';
import { listCustomers } from '../../services/customers.service';
import { listProducts } from '../../services/products.service';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function OrderList() {
  const [orderSummary, setOrderSummary] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [searchCustomer, setSearchCustomer] = useState('');
  const [searchProduct, setSearchProduct] = useState('');
  const [sortField, setSortField] = useState<'customer' | 'product' | 'date'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [activityTimeline, setActivityTimeline] = useState<any[]>([]);
  const [aiInsights, setAiInsights] = useState<string[]>([]);

  useEffect(() => {
    listOrders().then(setOrders);
    listCustomers().then(setCustomers);
    listProducts().then(setProducts);
    // Demo summary: total orders, total qty
    setOrderSummary(null);
  }, []);

  useEffect(() => {
    if (orders.length > 0 && orderSummary) {
      const insights: string[] = [];
      if (orders.length > 100) {
        insights.push('High order volume detected. Consider automating order processing.');
      }
      if (orders.some(o => o.items.length > 10)) {
        insights.push('Bulk orders found. Review for special fulfillment or discounts.');
      }
      setAiInsights(insights);
    }
  }, [orders, orderSummary]);

  function exportOrdersCSV() {
    try {
      const csv = [
        'Date,Customer,Products,TotalQty',
        ...orders.map(order => {
          const customer = customers.find(c => c.id === order.customerId);
          const productsStr = order.items.map((item: any) => {
            const prod = products.find(p => p.id === item.productId);
            return prod?.name || '-';
          }).join('|');
          const totalQty = order.items.reduce((sum: number, item: any) => sum + item.qty, 0);
          return `${order.createdAt ? new Date(order.createdAt).toLocaleString() : '-'},${customer?.name || '-'},${productsStr},${totalQty}`;
        })
      ].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'orders.csv';
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Exported orders to CSV');
    } catch (e) {
      toast.error('CSV export failed');
    }
  }

  let filteredOrders = orders.filter(order => {
    const customer = customers.find(c => c.id === order.customerId);
    const matchesCustomer = customer?.name?.toLowerCase().includes(searchCustomer.toLowerCase()) ?? false;
    const matchesProduct = searchProduct
      ? order.items.some((item: any) => {
          const prod = products.find(p => p.id === item.productId);
          return prod && prod.name.toLowerCase().includes(searchProduct.toLowerCase());
        })
      : true;
    return matchesCustomer && matchesProduct;
  });

  filteredOrders = [...filteredOrders].sort((a, b) => {
    let valA = '';
    let valB = '';
    if (sortField === 'customer') {
      const custA = customers.find(c => c.id === a.customerId)?.name?.toLowerCase() || '';
      const custB = customers.find(c => c.id === b.customerId)?.name?.toLowerCase() || '';
      valA = custA;
      valB = custB;
    } else if (sortField === 'product') {
      const prodA = products.find(p => p.id === a.items[0]?.productId)?.name?.toLowerCase() || '';
      const prodB = products.find(p => p.id === b.items[0]?.productId)?.name?.toLowerCase() || '';
      valA = prodA;
      valB = prodB;
    } else if (sortField === 'date') {
      valA = a.createdAt || '';
      valB = b.createdAt || '';
    }
    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div className="max-w-4xl mx-auto p-4">
      <ToastContainer position="top-right" autoClose={3000} />
      <h2 className="text-xl font-semibold mb-4">Orders</h2>
      <div className="flex flex-col md:flex-row gap-2 mb-4">
        <input
          className="border rounded p-2"
          placeholder="Search by customer"
          value={searchCustomer}
          onChange={e => setSearchCustomer(e.target.value)}
        />
        <input
          className="border rounded p-2"
          placeholder="Search by product"
          value={searchProduct}
          onChange={e => setSearchProduct(e.target.value)}
        />
        <select
          className="border rounded p-2"
          value={sortField}
          onChange={e => setSortField(e.target.value as 'customer' | 'product' | 'date')}
        >
          <option value="date">Sort by Date</option>
          <option value="customer">Sort by Customer</option>
          <option value="product">Sort by Product</option>
        </select>
        <select
          className="border rounded p-2"
          value={sortOrder}
          onChange={e => setSortOrder(e.target.value as 'asc' | 'desc')}
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
        <button className="px-3 py-2 border rounded" onClick={exportOrdersCSV}>Export CSV</button>
      </div>
      <table className="w-full border rounded">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Date</th>
            <th className="p-2 border">Customer</th>
            <th className="p-2 border">Products</th>
            <th className="p-2 border">Total Qty</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map(order => {
            const customer = customers.find(c => c.id === order.customerId);
            return (
              <tr key={order.id}>
                <td className="p-2 border">{order.createdAt ? new Date(order.createdAt).toLocaleString() : '-'}</td>
                <td className="p-2 border">{customer?.name || '-'}</td>
                <td className="p-2 border">{order.items.map((item: any) => {
                  const prod = products.find(p => p.id === item.productId);
                  return prod?.name || '-';
                }).join(', ')}</td>
                <td className="p-2 border">{order.items.reduce((sum: number, item: any) => sum + item.qty, 0)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="mt-8 border rounded p-4 bg-gray-50">
        <h4 className="font-semibold mb-2">Order Summary</h4>
        {orders.length > 0 ? (
          <ul>
            <li><span className="font-medium">Total Orders:</span> {orders.length}</li>
            <li><span className="font-medium">Total Quantity:</span> {orders.reduce((sum: number, o: any) => sum + o.items.reduce((s: number, i: any) => s + i.qty, 0), 0)}</li>
          </ul>
        ) : <span>No data</span>}
      </div>
      {/* Activity Timeline */}
      <div className="mt-8 border rounded p-4 bg-blue-50">
        <h4 className="font-semibold mb-2">Activity Timeline</h4>
        {activityTimeline.length > 0 ? (
          <ul>
            {activityTimeline.map((act, idx) => (
              <li key={idx}>
                <span className="font-medium">[{new Date(act.timestamp).toLocaleString()}]</span> {act.type === 'add' ? `Created order for customer: ${act.customer}, product: ${act.product}, qty: ${act.qty}` : `Deleted order ID: ${act.id}`}
              </li>
            ))}
          </ul>
        ) : <span>No recent activity</span>}
      </div>
      {/* AI Insights */}
      <div className="mt-8 border rounded p-4 bg-yellow-50">
        <h4 className="font-semibold mb-2">AI-Powered Insights & Recommendations</h4>
        {aiInsights.length > 0 ? (
          <ul>
            {aiInsights.map((insight, idx) => (
              <li key={idx}>{insight}</li>
            ))}
          </ul>
        ) : <span>No insights available yet.</span>}
      </div>
    </div>
  );
}
