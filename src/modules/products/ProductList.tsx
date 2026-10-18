
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Papa from 'papaparse';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useAuth } from '../../components/AuthContext';
import {
  listProducts,
  deleteProduct,
  type Product,
} from '../../services/products.service';
import { addAuditLogEntry } from '../../services/auditlog.service';

export default function ProductList() {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { user } = useAuth();

  const canManage = user?.role === 'admin' || user?.role === 'manager';

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      setLoading(true);
      try {
        const data = await listProducts();
        if (active) setProducts(data ?? []);
      } catch {
        if (active) toast.error('Could not load products. Please try again.');
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProducts();
    return () => {
      active = false;
    };
  }, [refresh]);

  const filtered = products.filter((product) => {
    const q = query.trim().toLowerCase();
    return (
      (product.name ?? '').toLowerCase().includes(q) ||
      (product.sku ?? '').toLowerCase().includes(q) ||
      (product.description ?? '').toLowerCase().includes(q)
    );
  });

  async function handleDelete(product: Product) {
    if (!window.confirm(`Delete product "${product.name}"?`)) return;

    setDeletingId(product.id);
    try {
      await deleteProduct(product.id);

      try {
        await addAuditLogEntry({
          user: user?.name || 'Unknown',
          action: 'Delete Product',
          timestamp: new Date().toISOString(),
          details: `Product ID: ${product.id}`,
        });
      } catch {
        toast.warning('Product deleted, but the audit entry could not be saved.');
      }

      setProducts((current) =>
        current.filter((item) => item.id !== product.id)
      );
      toast.success('Product deleted.');
    } catch {
      toast.error('Could not delete product.');
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
    link.download = 'products.csv';
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Product CSV downloaded.');
  }

  function handleImport(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: () => {
        toast.info(
          'CSV was read, but importing products is not connected to the backend yet.'
        );
      },
      error: () => toast.error('Could not read this CSV file.'),
    });

    event.target.value = '';
  }

  const totalStock = products.reduce(
    (sum, product) => sum + (Number(product.stock) || 0),
    0
  );

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-blue-700">INVENTORY</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Products
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your product catalogue, prices and stock.
          </p>
        </div>

        {canManage && (
          <Link
            to="/products/new"
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            + Add Product
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total products</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {products.length}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Matching search</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {filtered.length}
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total stock units</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {totalStock.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="w-full sm:max-w-md">
            <label htmlFor="product-search" className="sr-only">
              Search products
            </label>
            <input
              id="product-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search product, SKU or description..."
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
            Loading products...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center">
            <p className="font-semibold text-gray-900">No products found</p>
            <p className="mt-1 text-sm text-gray-500">
              Try another search or add a product.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-3 p-3 sm:hidden">
              {filtered.map((product) => (
                <article
                  key={product.id}
                  className="rounded-xl border border-gray-200 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="break-words font-semibold text-gray-900">
                        {product.name}
                      </h2>
                      <p className="mt-1 text-sm text-gray-500">
                        SKU: {product.sku || '—'}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-bold text-blue-700">
                      ₹{Number(product.price || 0).toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <p className="text-sm text-gray-600">
                      Stock: {product.stock ?? '—'}
                    </p>
                    {canManage && (
                      <button
                        type="button"
                        disabled={deletingId === product.id}
                        onClick={() => handleDelete(product)}
                        className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                      >
                        {deletingId === product.id ? 'Deleting...' : 'Delete'}
                      </button>
                    )}
                  </div>
                  {product.description && (
                    <p className="mt-2 break-words text-sm text-gray-500">
                      {product.description}
                    </p>
                  )}
                </article>
              ))}
            </div>

            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Product</th>
                    <th className="px-5 py-4 font-semibold">SKU</th>
                    <th className="px-5 py-4 font-semibold">Price</th>
                    <th className="px-5 py-4 font-semibold">Stock</th>
                    {canManage && (
                      <th className="px-5 py-4 text-right font-semibold">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-gray-900">
                          {product.name}
                        </p>
                        {product.description && (
                          <p className="mt-1 max-w-sm text-xs text-gray-500">
                            {product.description}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-4 text-gray-600">
                        {product.sku || '—'}
                      </td>
                      <td className="px-5 py-4 font-semibold text-gray-900">
                        ₹{Number(product.price || 0).toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="px-5 py-4 text-gray-600">
                        {product.stock ?? '—'}
                      </td>
                      {canManage && (
                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            disabled={deletingId === product.id}
                            onClick={() => handleDelete(product)}
                            className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                          >
                            {deletingId === product.id ? 'Deleting...' : 'Delete'}
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

      
