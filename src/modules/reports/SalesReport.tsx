
import React, { useEffect, useMemo, useState } from 'react';
import { listInvoices, type Invoice } from '../../services/invoices.service';

function getInvoiceDate(invoice: Invoice): string {
  const value =
    (invoice as Invoice & { createdAt?: string }).createdAt ??
    invoice.date;

  if (!value) return '';
  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? ''
    : date.toISOString().slice(0, 10);
}

function getCustomerName(invoice: Invoice): string {
  if (typeof invoice.customer === 'string') {
    return invoice.customer;
  }

  return invoice.customer?.name ?? 'Unknown customer';
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function escapeCsv(value: unknown): string {
  const text = String(value ?? '');
  return `"${text.replace(/"/g, '""')}"`;
}

export default function SalesReport() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    listInvoices()
      .then((data) => {
        if (active) setInvoices(data);
      })
      .catch((err: unknown) => {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'Could not load sales records.'
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

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const date = getInvoiceDate(invoice);

      if (from && (!date || date < from)) return false;
      if (to && (!date || date > to)) return false;

      return true;
    });
  }, [invoices, from, to]);

  const totalSales = filteredInvoices.reduce(
    (sum, invoice) => sum + (Number(invoice.total) || 0),
    0
  );

  const totalTax = filteredInvoices.reduce(
    (sum, invoice) => sum + (Number(invoice.tax) || 0),
    0
  );

  const exportCsv = () => {
    const headers = [
      'Invoice ID',
      'Date',
      'Customer',
      'Subtotal (INR)',
      'Tax (INR)',
      'Total (INR)',
    ];

    const rows = filteredInvoices.map((invoice) => [
      invoice.id ?? invoice._id ?? '',
      getInvoiceDate(invoice),
      getCustomerName(invoice),
      Number(invoice.subtotal) || 0,
      Number(invoice.tax) || 0,
      Number(invoice.total) || 0,
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCsv).join(','))
      .join('\r\n');

    const blob = new Blob(['\uFEFF', csv], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `sales-report-${from || 'all'}-to-${to || 'all'}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const resetDates = () => {
    setFrom('');
    setTo('');
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl p-4 sm:p-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
          Loading sales report…
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-4 pb-10 sm:p-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            A K TRADERS
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Sales report
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Review invoice sales for your selected period.
          </p>
        </div>

        <button
          type="button"
          onClick={exportCsv}
          disabled={!filteredInvoices.length}
          className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Download CSV
        </button>
      </header>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <h2 className="font-bold text-slate-900">Filter by invoice date</h2>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:items-end">
          <div>
            <label
              htmlFor="sales-from"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              From
            </label>
            <input
              id="sales-from"
              type="date"
              value={from}
              max={to || undefined}
              onChange={(event) => setFrom(event.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label
              htmlFor="sales-to"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              To
            </label>
            <input
              id="sales-to"
              type="date"
              value={to}
              min={from || undefined}
              onChange={(event) => setTo(event.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <button
            type="button"
            onClick={resetDates}
            className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Clear dates
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total sales</p>
          <p className="mt-2 break-words text-2xl font-bold text-slate-900">
            {formatMoney(totalSales)}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Sum of invoice totals in the selected period
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Invoices</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {filteredInvoices.length}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Matching invoice records
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total tax</p>
          <p className="mt-2 break-words text-2xl font-bold text-slate-900">
            {formatMoney(totalTax)}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Tax recorded on matching invoices
          </p>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-4 sm:p-6">
          <h2 className="font-bold text-slate-900">Invoice details</h2>
          <p className="mt-1 text-sm text-slate-500">
            Showing {filteredInvoices.length} of {invoices.length} invoices
          </p>
        </div>

        {!filteredInvoices.length ? (
          <div className="p-8 text-center">
            <h3 className="font-semibold text-slate-900">
              No invoices found
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Try changing the date range or create an invoice first.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="whitespace-nowrap px-4 py-4">Invoice ID</th>
                  <th className="whitespace-nowrap px-4 py-4">Date</th>
                  <th className="whitespace-nowrap px-4 py-4">Customer</th>
                  <th className="whitespace-nowrap px-4 py-4">Subtotal</th>
                  <th className="whitespace-nowrap px-4 py-4">Tax</th>
                  <th className="whitespace-nowrap px-4 py-4">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id ?? invoice._id}>
                    <td className="whitespace-nowrap px-4 py-4 font-medium text-slate-700">
                      {(invoice.id ?? invoice._id ?? '—').slice(-8)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                      {getInvoiceDate(invoice) || '—'}
                    </td>
                    <td className="px-4 py-4 text-slate-700">
                      {getCustomerName(invoice)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                      {formatMoney(Number(invoice.subtotal) || 0)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                      {formatMoney(Number(invoice.tax) || 0)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 font-semibold text-slate-900">
                      {formatMoney(Number(invoice.total) || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

