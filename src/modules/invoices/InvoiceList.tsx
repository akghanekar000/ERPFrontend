
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import jsPDF from 'jspdf';
import Papa from 'papaparse';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import InvoicePreview from './InvoicePreview';

import { useAuth } from '../../components/AuthContext';
import {
  listInvoices,
  deleteInvoice,
} from '../../services/invoices.service';
import { addAuditLogEntry } from '../../services/auditlog.service';
import { formatDate } from '../../utils/formatDate';

type InvoiceRow = {
    taxableAmount?: number;
  cgst?: number;
  sgst?: number;
  igst?: number;
  notes?: string;
  sellerSnapshot?: {
    companyName?: string;
    gstin?: string;
    email?: string;
    phone?: string;
    address?: string;
    state?: string;
    pinCode?: string;
  };
  customerSnapshot?: {
    name?: string;
    gst?: string;
    gstin?: string;
    email?: string;
    phone?: string;
    address?: string;
    state?: string;
  };
  items?: Array<{
    qty?: number;
    price?: number;
    gstRate?: number;
    taxableAmount?: number;
    taxAmount?: number;
    lineTotal?: number;
    product?: string | { name?: string };
    name?: string;
  }>;
  id?: string;
  _id?: string;
  invoiceNumber?: string;
  date?: string;
  customerName?: string;
  customer?: string | { name?: string };
  subtotal?: number;
  tax?: number;
  total?: number;
  status?: string;
  
};

function invoiceId(invoice: InvoiceRow) {
  return String(invoice.id ?? invoice._id ?? invoice.invoiceNumber ?? '');
}

function customerName(invoice: InvoiceRow) {
  if (invoice.customerName) return invoice.customerName;
  if (typeof invoice.customer === 'string') return invoice.customer;
  return invoice.customer?.name ?? 'Unknown customer';
}

function invoiceNumber(invoice: InvoiceRow) {
  return invoice.invoiceNumber ?? invoiceId(invoice) ?? '—';
}

function money(value: unknown) {
  return Number(value ?? 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function InvoiceList() {
  const { user } = useAuth();

  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [logo, setLogo] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] =
  useState<InvoiceRow | null>(null);
 
  const canManage = user?.role === 'admin' || user?.role === 'manager';

  useEffect(() => {
    let active = true;

    async function loadInvoices() {
      setLoading(true);
      try {
        const data = await listInvoices();
        if (active) {
          setInvoices(Array.isArray(data) ? data : []);
        }
      } catch {
        if (active) {
          toast.error('Could not load invoices. Please try again.');
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadInvoices();

    return () => {
      active = false;
    };
  }, [refresh]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return invoices.filter((invoice) => {
      return (
        String(invoice.invoiceNumber ?? '').toLowerCase().includes(q) ||
        customerName(invoice).toLowerCase().includes(q) ||
        String(invoice.status ?? '').toLowerCase().includes(q)
      );
    });
  }, [invoices, query]);

  const totalSales = invoices.reduce(
    (sum, invoice) => sum + Number(invoice.total ?? 0),
    0
  );

  const unpaidTotal = invoices.reduce((sum, invoice) => {
    const status = String(invoice.status ?? 'UNPAID').toUpperCase();
    return status === 'UNPAID' ? sum + Number(invoice.total ?? 0) : sum;
  }, 0);

  function exportCsv() {
    const rows = filtered.map((invoice) => ({
      invoiceNumber: invoiceNumber(invoice),
      date: invoice.date ?? '',
      customer: customerName(invoice),
      subtotal: Number(invoice.subtotal ?? 0),
      tax: Number(invoice.tax ?? 0),
      total: Number(invoice.total ?? 0),
      status: invoice.status ?? 'UNPAID',
    }));

    const csv = Papa.unparse(rows);
    const blob = new Blob(['\uFEFF' + csv], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'invoices.csv';
    link.click();

    URL.revokeObjectURL(url);
    toast.success('Invoice CSV downloaded.');
  }

  function readCsv(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: () => {
        toast.info(
          'CSV read successfully. Saving imported invoices is not connected to the backend yet.'
        );
      },
      error: () => toast.error('Could not read this CSV file.'),
    });

    event.target.value = '';
  }

  function uploadLogo(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file.');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === 'string') setLogo(reader.result);
    };

    reader.onerror = () => toast.error('Could not read the image.');
    reader.readAsDataURL(file);
    event.target.value = '';
  }
 function previewSavedInvoice(invoice: InvoiceRow) {
  setSelectedInvoice(invoice);
 }
  
  function downloadInvoicePDF(invoice: InvoiceRow) {
    try {
      const doc = new jsPDF();
      const left = 14;

      if (logo) {
        try {
          const format = logo.startsWith('data:image/png')
            ? 'PNG'
            : logo.startsWith('data:image/webp')
              ? 'WEBP'
              : 'JPEG';

          doc.addImage(logo, format, left, 12, 32, 18);
        } catch {
          // Continue generating the invoice if the optional logo cannot be embedded.
        }
      }

      doc.setFontSize(20);
      doc.text('INVOICE', left, logo ? 42 : 22);

      let y = logo ? 53 : 33;
      doc.setFontSize(11);
      doc.text(`Invoice No: ${invoiceNumber(invoice)}`, left, y);
      y += 8;
      doc.text(
        `Date: ${invoice.date ? formatDate(invoice.date) : '—'}`,
        left,
        y
      );
      y += 8;
      doc.text(`Customer: ${customerName(invoice)}`, left, y);
      y += 12;

      doc.setFontSize(12);
      doc.text('Summary', left, y);
      y += 8;

      doc.setFontSize(10);
      doc.text(`Subtotal: INR ${money(invoice.subtotal)}`, left, y);
      y += 7;
      doc.text(`Tax: INR ${money(invoice.tax)}`, left, y);
      y += 7;
      doc.setFont('helvetica', 'bold');
      doc.text(`Total: INR ${money(invoice.total)}`, left, y);
      y += 8;
      doc.setFont('helvetica', 'normal');
      doc.text(`Status: ${invoice.status ?? 'UNPAID'}`, left, y);

      const safeName = invoiceNumber(invoice).replace(/[^a-zA-Z0-9_-]/g, '_');
      doc.save(`Invoice_${safeName}.pdf`);
      toast.success('Invoice PDF downloaded.');
    } catch {
      toast.error('Could not generate the invoice PDF.');
    }
  }

  async function handleDelete(invoice: InvoiceRow) {
    const id = invoiceId(invoice);
    if (!id) {
      toast.error('This invoice has no valid ID.');
      return;
    }

    if (
      !window.confirm(
        `Delete invoice "${invoiceNumber(invoice)}"? This cannot be undone.`
      )
    ) {
      return;
    }

    setDeletingId(id);

    try {
      await deleteInvoice(id);
      setInvoices((current) =>
        current.filter((item) => invoiceId(item) !== id)
      );

      try {
        await addAuditLogEntry({
          user: user?.name || 'Unknown',
          action: 'Delete Invoice',
          timestamp: new Date().toISOString(),
          details: `Invoice ID: ${id}`,
        });
      } catch {
        toast.warning('Invoice deleted, but audit logging failed.');
      }

      toast.success('Invoice deleted.');
    } catch {
      toast.error('Could not delete invoice.');
    } finally {
      setDeletingId(null);
    }
  }

  function statusClass(status?: string) {
    const value = String(status ?? 'UNPAID').toUpperCase();

    if (['PAID', 'COMPLETED'].includes(value)) {
      return 'bg-green-50 text-green-700 ring-green-600/20';
    }

    if (['CANCELLED', 'CANCELED', 'VOID'].includes(value)) {
      return 'bg-red-50 text-red-700 ring-red-600/20';
    }

    return 'bg-amber-50 text-amber-700 ring-amber-600/20';
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <ToastContainer position="top-right" autoClose={3000} />

      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-blue-700">SALES MANAGEMENT</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Invoices
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Review invoices, track totals and download invoice documents.
          </p>
        </div>

        <Link
          to="/invoices/new"
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          + New Invoice
        </Link>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total invoice value</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            ₹{money(totalSales)}
          </p>
          <p className="mt-1 text-xs text-gray-500">All loaded invoices</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Unpaid invoice value</p>
          <p className="mt-2 text-2xl font-bold text-amber-700">
            ₹{money(unpaidTotal)}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Based on invoice status
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total invoices</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {invoices.length}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {filtered.length} matching your search
          </p>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-gray-100 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">Invoice register</h2>
              <p className="mt-1 text-sm text-gray-500">
                Search and manage your existing invoices.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setRefresh((value) => value + 1)}
              className="min-h-10 rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Refresh
            </button>
          </div>

          <input
            type="search"
            aria-label="Search invoices"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search invoice number, customer or status..."
            className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={exportCsv}
              className="min-h-10 rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Export CSV
            </button>

            <label className="inline-flex min-h-10 cursor-pointer items-center rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
              Read CSV
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={readCsv}
                className="sr-only"
              />
            </label>

            <label className="inline-flex min-h-10 cursor-pointer items-center rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
              {logo ? 'Change PDF logo' : 'Add PDF logo'}
              <input
                type="file"
                accept="image/*"
                onChange={uploadLogo}
                className="sr-only"
              />
            </label>

            {logo && (
              <button
                type="button"
                onClick={() => setLogo(null)}
                className="min-h-10 rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                Remove logo
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-gray-500">
            Loading invoices...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center">
            <h3 className="font-semibold text-gray-900">No invoices found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try another search or create your first invoice.
            </p>
            <Link
              to="/invoices/new"
              className="mt-4 inline-flex rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Create invoice
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-3 p-3 sm:hidden">
              {filtered.map((invoice) => {
                const id = invoiceId(invoice);

                return (
                  <article
                    key={id}
                    className="space-y-3 rounded-xl border border-gray-200 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="break-words font-semibold text-gray-900">
                          {invoiceNumber(invoice)}
                        </p>
                        <p className="mt-1 break-words text-sm text-gray-600">
                          {customerName(invoice)}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusClass(invoice.status)}`}
                      >
                        {invoice.status ?? 'UNPAID'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 border-t border-gray-100 pt-3">
                      <div>
                        <p className="text-xs text-gray-500">Date</p>
                        <p className="mt-1 text-sm text-gray-800">
                          {invoice.date ? formatDate(invoice.date) : '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Total</p>
                        <p className="mt-1 font-bold text-gray-900">
                          ₹{money(invoice.total)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 border-t border-gray-100 pt-3">
                      <button
                        type="button"
                        onClick={() => previewSavedInvoice(invoice)}
                        className="rounded-lg border border-blue-200 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50"
                      >
                        Preview
                      </button>
                      <button
                        type="button"
                        onClick={() => downloadInvoicePDF(invoice)}
                        className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                      >
                        Download PDF
                      </button>
                      {canManage && (
                        <button
                          type="button"
                          disabled={deletingId === id}
                          onClick={() => handleDelete(invoice)}
                          className="rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                        >
                          {deletingId === id ? 'Deleting...' : 'Delete'}
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Invoice</th>
                    <th className="px-5 py-4 font-semibold">Date</th>
                    <th className="px-5 py-4 font-semibold">Customer</th>
                    <th className="px-5 py-4 text-right font-semibold">Total</th>
                    <th className="px-5 py-4 font-semibold">Status</th>
                    <th className="px-5 py-4 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((invoice) => {
                    const id = invoiceId(invoice);

                    return (
                      <tr key={id} className="hover:bg-gray-50">
                        <td className="px-5 py-4 font-semibold text-gray-900">
                          {invoiceNumber(invoice)}
                        </td>
                        <td className="px-5 py-4 text-gray-600">
                          {invoice.date ? formatDate(invoice.date) : '—'}
                        </td>
                        <td className="px-5 py-4 text-gray-700">
                          {customerName(invoice)}
                        </td>
                        <td className="px-5 py-4 text-right font-semibold text-gray-900">
                          ₹{money(invoice.total)}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusClass(invoice.status)}`}
                          >
                            {invoice.status ?? 'UNPAID'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                           <button
                             type="button"
                             onClick={() => previewSavedInvoice(invoice)}
                             className="rounded-lg border border-blue-200 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50"
                           >
                             Preview
                           </button>
                            <button
                              type="button"
                              onClick={() => downloadInvoicePDF(invoice)}
                              className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                            >
                              PDF
                            </button>
                            {canManage && (
                              <button
                                type="button"
                                disabled={deletingId === id}
                                onClick={() => handleDelete(invoice)}
                                className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                              >
                                {deletingId === id ? 'Deleting...' : 'Delete'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
      {selectedInvoice && (
       <InvoicePreview
         company={selectedInvoice.sellerSnapshot ?? null}
        customer={
         selectedInvoice.customerSnapshot ??
         (typeof selectedInvoice.customer === 'object' &&
         selectedInvoice.customer !== null
           ? selectedInvoice.customer
           : { name: customerName(selectedInvoice) })
       }
       invoiceNumber={invoiceNumber(selectedInvoice)}
       date={selectedInvoice.date}
       items={(selectedInvoice.items ?? []).map((item) => ({
        name:
         item.name ??
         (typeof item.product === 'object'
          ? item.product?.name
          : item.product) ??
         'Product',
        qty: Number(item.qty ?? 0),
        price: Number(item.price ?? 0),
        gstRate: Number(item.gstRate ?? 0),
        taxableAmount: Number(item.taxableAmount ?? 0),
        taxAmount: Number(item.taxAmount ?? 0),
        total: Number(item.lineTotal ?? item.taxableAmount ?? 0) +
        Number(item.taxAmount ?? 0),
     }))}
      taxableTotal={Number(
       selectedInvoice.taxableAmount ?? selectedInvoice.subtotal ?? 0
      )}
      taxTotal={Number(selectedInvoice.tax ?? 0)}
      grandTotal={Number(selectedInvoice.total ?? 0)}
      notes={selectedInvoice.notes}
      isSaved
      onClose={() => setSelectedInvoice(null)}
     />
    )}
    </div>
  );
}

      

  
  
