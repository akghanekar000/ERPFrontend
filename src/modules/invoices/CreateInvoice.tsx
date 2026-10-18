
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuid } from 'uuid';
import { listCustomers } from '../../services/customers.service';
import { listProducts } from '../../services/products.service';
import { createInvoice } from '../../services/invoices.service';
import { calculateGST } from '../../utils/calculateGST';
import type { Product } from '../../services/products.service';
import type { Customer } from '../../services/customers.service';

type InvoiceLine = {
  id: string;
  productId: string;
  qty: number;
};

export default function CreateInvoice() {
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerId, setCustomerId] = useState('');
  const [gstRate, setGstRate] = useState('18');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<InvoiceLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    Promise.all([listCustomers(), listProducts()])
      .then(([customerData, productData]) => {
        if (!active) return;
        setCustomers(customerData);
        setProducts(productData);
      })
      .catch((err: unknown) => {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'Could not load customers and products.'
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const lines = useMemo(
    () =>
      items.map((item) => {
        const product = products.find((p) => p.id === item.productId);
        const price = Number(product?.price ?? 0);
        return {
          ...item,
          product,
          price,
          amount: price * item.qty,
        };
      }),
    [items, products]
  );

  const subtotal = lines.reduce((sum, item) => sum + item.amount, 0);
  const tax = Number(calculateGST(subtotal, Number(gstRate) || 0).toFixed(2));
  const total = subtotal + tax;

  const addItem = () => {
    if (!products.length) {
      setError('Add a product before creating an invoice.');
      return;
    }

    setError('');
    setItems((current) => [
      ...current,
      {
        id: uuid(),
        productId: products[0].id,
        qty: 1,
      },
    ]);
  };

  const updateProduct = (id: string, productId: string) => {
    setItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, productId } : item
      )
    );
  };

  const updateQty = (id: string, value: string) => {
    const qty = Math.max(1, Math.floor(Number(value) || 1));
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, qty } : item))
    );
  };

  const removeItem = (id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  };

  const saveInvoice = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!customerId) {
      setError('Please select a customer.');
      return;
    }

    if (!items.length || lines.some((item) => !item.product)) {
      setError('Please add at least one valid product.');
      return;
    }

    if (!Number.isFinite(Number(gstRate)) || Number(gstRate) < 0) {
      setError('Enter a valid GST percentage.');
      return;
    }

    setSaving(true);

    try {
      await createInvoice({
        customer: customerId,
        items: lines.map((item) => ({
          product: item.productId,
          qty: item.qty,
          price: item.price,
        })),
        tax,
        notes: notes.trim() || undefined,
      });

      navigate('/invoices');
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Could not save the invoice.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl p-4 sm:p-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
          Loading your customers and products…
        </div>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-4 pb-10 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            A K TRADERS
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Create invoice
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Select a customer, add products and review the total before saving.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/invoices')}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Back to invoices
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <form onSubmit={saveInvoice} className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <h2 className="text-lg font-bold text-slate-900">
            Customer and tax details
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Customer details are loaded from your backend.
          </p>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="customer"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Customer <span className="text-red-500">*</span>
              </label>
              <select
                id="customer"
                required
                value={customerId}
                onChange={(event) => setCustomerId(event.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Select a customer</option>
                {customers.map((customer) => (
                  <option
                    key={customer.id ?? customer._id}
                    value={customer.id ?? customer._id}
                  >
                    {customer.name}
                  </option>
                ))}
              </select>
              {!customers.length && (
                <p className="mt-2 text-sm text-amber-700">
                  No customers found. Add a customer before creating an invoice.
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="gstRate"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                GST rate (%)
              </label>
              <input
                id="gstRate"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={gstRate}
                onChange={(event) => setGstRate(event.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Invoice items
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {items.length} {items.length === 1 ? 'item' : 'items'} added
              </p>
            </div>
            <button
              type="button"
              onClick={addItem}
              disabled={!products.length}
              className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              + Add product
            </button>
          </div>

          {!items.length ? (
            <div className="p-8 text-center sm:p-12">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-xl text-blue-600">
                +
              </div>
              <h3 className="mt-4 font-semibold text-slate-900">
                No products added yet
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Add a product to start calculating this invoice.
              </p>
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-6 py-4">Product</th>
                      <th className="px-4 py-4">Price</th>
                      <th className="px-4 py-4">Quantity</th>
                      <th className="px-4 py-4">Amount</th>
                      <th className="px-4 py-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {lines.map((item) => (
                      <tr key={item.id}>
                        <td className="min-w-56 px-6 py-4">
                          <select
                            aria-label="Select product"
                            value={item.productId}
                            onChange={(event) =>
                              updateProduct(item.id, event.target.value)
                            }
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
                          >
                            {products.map((product) => (
                              <option
                                key={product.id ?? product._id}
                                value={product.id ?? product._id}
                              >
                                {product.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-4 text-slate-700">
                          ₹{item.price.toFixed(2)}
                        </td>
                        <td className="w-32 px-4 py-4">
                          <input
                            aria-label="Quantity"
                            type="number"
                            min="1"
                            step="1"
                            value={item.qty}
                            onChange={(event) =>
                              updateQty(item.id, event.target.value)
                            }
                            className="w-24 rounded-lg border border-slate-300 px-3 py-2"
                          />
                        </td>
                        <td className="px-4 py-4 font-semibold text-slate-900">
                          ₹{item.amount.toFixed(2)}
                        </td>
                        <td className="px-4 py-4">
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="rounded-lg px-3 py-2 font-semibold text-red-600 hover:bg-red-50"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-4 p-4 md:hidden">
                {lines.map((item, index) => (
                  <div
                    key={item.id}
                    className="space-y-3 rounded-xl border border-slate-200 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-500">
                        Item {index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-sm font-semibold text-red-600"
                      >
                        Remove
                      </button>
                    </div>
                    <label className="block text-sm font-medium text-slate-700">
                      Product
                      <select
                        value={item.productId}
                        onChange={(event) =>
                          updateProduct(item.id, event.target.value)
                        }
                        className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-3"
                      >
                        {products.map((product) => (
                          <option
                            key={product.id ?? product._id}
                            value={product.id ?? product._id}
                          >
                            {product.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-sm text-slate-500">Unit price</p>
                        <p className="mt-1 font-semibold text-slate-900">
                          ₹{item.price.toFixed(2)}
                        </p>
                      </div>
                      <label className="text-sm font-medium text-slate-700">
                        Quantity
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={item.qty}
                          onChange={(event) =>
                            updateQty(item.id, event.target.value)
                          }
                          className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-3"
                        />
                      </label>
                    </div>
                    <div className="flex justify-between border-t border-slate-100 pt-3">
                      <span className="text-sm text-slate-500">Amount</span>
                      <strong className="text-slate-900">
                        ₹{item.amount.toFixed(2)}
                      </strong>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <label
            htmlFor="notes"
            className="block text-sm font-semibold text-slate-700"
          >
            Notes (optional)
          </label>
          <textarea
            id="notes"
            rows={3}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Payment terms, delivery details or other notes"
            className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <h2 className="text-lg font-bold text-slate-900">Invoice summary</h2>
          <div className="mt-4 space-y-3">
            <div className="flex justify-between gap-4 text-sm text-slate-600">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between gap-4 text-sm text-slate-600">
              <span>GST ({gstRate || 0}%)</span>
              <span>₹{tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between gap-4 border-t border-slate-200 pt-4">
              <span className="font-bold text-slate-900">Total payable</span>
              <span className="text-xl font-bold text-blue-700">
                ₹{total.toFixed(2)}
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving || !customers.length || !products.length}
            className="mt-6 w-full rounded-xl bg-blue-600 px-5 py-3.5 font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {saving ? 'Saving invoice…' : 'Save invoice'}
          </button>
          <p className="mt-3 text-xs text-slate-500">
            The server records the invoice date. This form sends customer,
            product, quantity, price and GST data to your existing backend.
          </p>
        </section>
      </form>
    </main>
  );
}

      

 
