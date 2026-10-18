
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Papa from 'papaparse';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useAuth } from '../../components/AuthContext';
import {
  listCustomers,
  deleteCustomer,
  type Customer,
} from '../../services/customers.service';
import { addAuditLogEntry } from '../../services/auditlog.service';

export default function CustomerList() {
  const [query, setQuery] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { user } = useAuth();

  const canManage = user?.role === 'admin' || user?.role === 'manager';

  useEffect(() => {
    let active = true;

    async function loadCustomers() {
      setLoading(true);
      try {
        const data = await listCustomers();
        if (active) setCustomers(data ?? []);
      } catch {
        if (active) toast.error('Could not load customers. Please try again.');
      } finally {
        if (active) setLoading(false);
      }
    }

    loadCustomers();
    return () => {
      active = false;
    };
  }, [refresh]);

  const filtered = customers.filter((customer) => {
    const q = query.trim().toLowerCase();
    return (
      (customer.name ?? '').toLowerCase().includes(q) ||
      (customer.phone ?? '').toLowerCase().includes(q) ||
      (customer.gst ?? '').toLowerCase().includes(q) ||
      (customer.address ?? '').toLowerCase().includes(q)
    );
  });

  async function handleDelete(customer: Customer) {
    if (!window.confirm(`Delete customer "${customer.name}"?`)) return;

    setDeletingId(customer.id);
    try {
      await deleteCustomer(customer.id);

      try {
        await addAuditLogEntry({
          user: user?.name || 'Unknown',
          action: 'Delete Customer',
          timestamp: new Date().toISOString(),
          details: `Customer ID: ${customer.id}`,
        });
      } catch {
        toast.warning('Customer deleted, but the audit entry could not be saved.');
      }

      setCustomers((current) =>
        current.filter((item) => item.id !== customer.id)
      );
      toast.success('Customer deleted.');
    } catch {
      toast.error('Could not delete customer.');
    } finally {
      setDeletingId(null);
    }
  }

  function exportCsv() {
    const csv = Papa.unparse(filtered);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'customers.csv';
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Customer CSV downloaded.');
  }

  function handleImport(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: () => {
        toast.info(
          'CSV was read, but importing customer records is not connected to the backend yet.'
        );
      },
      error: () => toast.error('Could not read this CSV file.'),
    });

    event.target.value = '';
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-blue-700">MASTER DATA</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Customers
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your customer details and GST information.
          </p>
        </div>

        {canManage && (
          <Link
            to="/customers/new"
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            + Add Customer
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total customers loaded</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {customers.length}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Matching your search</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {filtered.length}
          </p>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="w-full sm:max-w-md">
            <label htmlFor="customer-search" className="sr-only">
              Search customers
            </label>
            <input
              id="customer-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name, phone, GST or address..."
              className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={exportCsv}
              className="min-h-10 rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Export CSV
            </button>
            <label className="inline-flex min-h-10 cursor-pointer items-center rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50">
              Read CSV
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleImport}
                className="sr-only"
              />
            </label>
            <button
              type="button"
              onClick={() => setRefresh((value) => value + 1)}
              className="min-h-10 rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-gray-500">
            Loading customers...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center">
            <p className="font-semibold text-gray-900">No customers found</p>
            <p className="mt-1 text-sm text-gray-500">
              Try another search or add a customer.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-3 p-3 sm:hidden">
              {filtered.map((customer) => (
                <article
                  key={customer.id}
                  className="rounded-xl border border-gray-200 p-4"
                >
                  <h2 className="font-semibold text-gray-900">
                    {customer.name}
                  </h2>
                  <p className="mt-2 text-sm text-gray-600">
                    {customer.phone || 'No phone added'}
                  </p>
                  <p className="mt-1 break-words text-sm text-gray-500">
                    GST: {customer.gst || '—'}
                  </p>
                  <p className="mt-1 break-words text-sm text-gray-500">
                    {customer.address || 'No address added'}
                  </p>
                  {canManage && (
                    <button
                      type="button"
                      disabled={deletingId === customer.id}
                      onClick={() => handleDelete(customer)}
                      className="mt-3 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                    >
                      {deletingId === customer.id ? 'Deleting...' : 'Delete'}
                    </button>
                  )}
                </article>
              ))}
            </div>

            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Customer</th>
                    <th className="px-5 py-4 font-semibold">Phone</th>
                    <th className="px-5 py-4 font-semibold">GSTIN</th>
                    <th className="px-5 py-4 font-semibold">Address</th>
                    {canManage && (
                      <th className="px-5 py-4 text-right font-semibold">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-5 py-4 font-semibold text-gray-900">
                        {customer.name}
                      </td>
                      <td className="px-5 py-4 text-gray-600">
                        {customer.phone || '—'}
                      </td>
                      <td className="px-5 py-4 text-gray-600">
                        {customer.gst || '—'}
                      </td>
                      <td className="max-w-xs break-words px-5 py-4 text-gray-600">
                        {customer.address || '—'}
                      </td>
                      {canManage && (
                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            disabled={deletingId === customer.id}
                            onClick={() => handleDelete(customer)}
                            className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                          >
                            {deletingId === customer.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

      
      
