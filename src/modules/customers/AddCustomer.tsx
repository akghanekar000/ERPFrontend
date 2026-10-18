
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addCustomer } from '../../services/customers.service';

export default function AddCustomer() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [gstin, setGstin] = useState('');
  const [address, setAddress] = useState('');
  const [state, setState] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter the customer name.');
      return;
    }

    const cleanGstin = gstin.trim().toUpperCase();

    if (
      cleanGstin &&
      !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(cleanGstin)
    ) {
      setError('Please check the GSTIN. Its format appears invalid.');
      return;
    }

    setSaving(true);

    try {
      await addCustomer({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        gst: cleanGstin,
        gstin: cleanGstin,
        address: address.trim(),
        state: state.trim(),
        stateCode: cleanGstin ? cleanGstin.substring(0, 2) : '',
      });

      navigate('/customers');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not save the customer. Please try again.'
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
          onClick={() => navigate('/customers')}
          className="mb-3 text-sm font-medium text-blue-700 hover:underline"
        >
          ← Back to Customers
        </button>

        <p className="text-sm font-medium text-blue-700">CUSTOMER MANAGEMENT</p>
        <h1 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">
          Add Customer
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Save customer contact, address and GST information for future invoices.
        </p>
      </div>

      <form
        onSubmit={submit}
        className="space-y-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7"
      >
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Contact details
          </h2>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Customer name *
            </label>
            <input
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter customer or company name"
              required
              maxLength={150}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Phone number
              </label>
              <input
                className={inputClass}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Customer phone"
                type="tel"
                maxLength={20}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                className={inputClass}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                type="email"
                maxLength={254}
              />
            </div>
          </div>
        </section>

        <div className="border-t border-gray-100" />

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            GST and address
          </h2>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              GSTIN
            </label>
            <input
              className={inputClass}
              value={gstin}
              onChange={(e) => setGstin(e.target.value.toUpperCase())}
              placeholder="15-character GSTIN (optional)"
              maxLength={15}
              autoCapitalize="characters"
            />
            <p className="mt-1 text-xs text-gray-500">
              The first two GSTIN digits are used as the state code when available.
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              State *
            </label>
            <input
              className={inputClass}
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="For example, Maharashtra"
              required
              maxLength={100}
            />
            <p className="mt-1 text-xs text-gray-500">
              Enter the customer's state so the invoice can determine the appropriate GST type.
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Billing address
            </label>
            <textarea
              className={inputClass}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Building, street, city and PIN code"
              rows={3}
              maxLength={1000}
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
            onClick={() => navigate('/customers')}
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
            {saving ? 'Saving customer...' : 'Save Customer'}
          </button>
        </div>
      </form>
    </div>
  );
}
