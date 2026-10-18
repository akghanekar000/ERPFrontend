
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProduct } from '../../services/products.service';

export default function AddProduct() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [gstRate, setGstRate] = useState('0');
  const [stock, setStock] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    const cleanName = name.trim();
    const numericPrice = Number(price);
    const numericGstRate = Number(gstRate);
    const numericStock = stock === '' ? undefined : Number(stock);

    if (!cleanName) {
      setError('Please enter the product name.');
      return;
    }

    if (price.trim() === '' || !Number.isFinite(numericPrice) || numericPrice < 0) {
      setError('Enter a valid price of zero or more.');
      return;
    }

    if (
      gstRate.trim() === '' ||
      !Number.isFinite(numericGstRate) ||
      numericGstRate < 0 ||
      numericGstRate > 100
    ) {
      setError('GST rate must be between 0 and 100.');
      return;
    }

    if (
      numericStock !== undefined &&
      (!Number.isFinite(numericStock) || numericStock < 0)
    ) {
      setError('Stock must be zero or more.');
      return;
    }

    setSaving(true);

    try {
      await createProduct({
        name: cleanName,
        sku: sku.trim(),
        description: description.trim(),
        price: numericPrice,
        gstRate: numericGstRate,
        stock: numericStock,
      });

      navigate('/products');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not save the product. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    'w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100';

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div>
        <button
          type="button"
          onClick={() => navigate('/products')}
          className="mb-3 text-sm font-medium text-blue-700 hover:underline"
        >
          ← Back to Products
        </button>

        <p className="text-sm font-medium text-blue-700">INVENTORY MANAGEMENT</p>
        <h1 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">
          Add Product
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Add a product to your catalogue for use in invoices.
        </p>
      </div>

      <form
        onSubmit={submit}
        className="space-y-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7"
      >
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Product details
          </h2>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Product name *
            </label>
            <input
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="For example, A4 Copier Paper 80 GSM"
              required
              maxLength={200}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              SKU / Product code
            </label>
            <input
              className={inputClass}
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="Your internal product code (optional)"
              maxLength={100}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              className={inputClass}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Specifications, brand, size or other details"
              rows={3}
              maxLength={2000}
            />
          </div>
        </section>

        <div className="border-t border-gray-100" />

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Price, GST and stock
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Selling price (₹) *
              </label>
              <input
                className={inputClass}
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Enter the base price. Choose inclusive or exclusive GST on the invoice.
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                GST rate *
              </label>
              <select
                className={inputClass}
                value={gstRate}
                onChange={(e) => setGstRate(e.target.value)}
                required
              >
                <option value="0">0%</option>
                <option value="0.1">0.1%</option>
                <option value="0.25">0.25%</option>
                <option value="1.5">1.5%</option>
                <option value="3">3%</option>
                <option value="5">5%</option>
                <option value="6">6%</option>
                <option value="12">12%</option>
                <option value="18">18%</option>
                <option value="28">28%</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Available stock
            </label>
            <input
              className={inputClass}
              type="number"
              min="0"
              step="any"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder="Enter quantity in stock (optional)"
            />
          </div>
        </section>

        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => navigate('/products')}
            disabled={saving}
            className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Saving product...' : 'Save Product'}
          </button>
        </div>
      </form>
    </div>
  );
}
