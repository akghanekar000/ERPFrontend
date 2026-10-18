
import React from 'react';

export type PreviewCompany = {
  companyName?: string;
  gstin?: string;
  email?: string;
  phone?: string;
  address?: string;
  state?: string;
  pinCode?: string;
};

export type PreviewCustomer = {
  name?: string;
  gst?: string;
  gstin?: string;
  email?: string;
  phone?: string;
  address?: string;
  state?: string;
};

export type PreviewItem = {
  name: string;
  qty: number;
  price: number;
  gstRate: number;
  taxableAmount: number;
  taxAmount: number;
  total: number;
};

type InvoicePreviewProps = {
  isSaved?: boolean;
  company: PreviewCompany | null;
  customer: PreviewCustomer | null;
  invoiceNumber?: string;
  date?: string;
  items: PreviewItem[];
  taxableTotal: number;
  taxTotal: number;
  grandTotal: number;
  notes?: string;
  onClose: () => void;
};

const money = (value: number) =>
  `₹${Number(value || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function InvoicePreview({
  company,
  customer,
  invoiceNumber,
  date,
  items,
  taxableTotal,
  taxTotal,
  grandTotal,
  notes,
  onClose,
}: InvoicePreviewProps) {
  const displayDate = date
    ? new Date(date).toLocaleDateString('en-IN')
    : new Date().toLocaleDateString('en-IN');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 p-3 sm:p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-white">
             {isSaved ? 'Saved invoice preview' : 'Draft invoice preview'}
            </h2>
            <p className="mt-1 text-sm text-slate-200">
              Review the invoice before saving.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-white px-4 py-2 font-semibold text-slate-800"
          >
            Back to editing
          </button>
        </div>

        <article className="invoice-preview-sheet mx-auto bg-white p-5 text-slate-800 shadow-xl sm:p-10">
          <header className="flex flex-col justify-between gap-5 border-b-2 border-slate-800 pb-6 sm:flex-row">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
                Seller
              </p>
              <h1 className="mt-2 text-2xl font-extrabold uppercase text-slate-950 sm:text-3xl">
                {company?.companyName || 'Your company name'}
              </h1>
              <p className="mt-2 max-w-sm whitespace-pre-line text-sm text-slate-600">
                {company?.address || 'Company address'}
                {company?.state ? `\n${company.state}` : ''}
                {company?.pinCode ? ` - ${company.pinCode}` : ''}
              </p>
              {company?.gstin && (
                <p className="mt-2 text-sm">
                  <strong>GSTIN:</strong> {company.gstin}
                </p>
              )}
              {company?.phone && (
                <p className="text-sm">Phone: {company.phone}</p>
              )}
              {company?.email && (
                <p className="text-sm">Email: {company.email}</p>
              )}
            </div>

            <div className="sm:min-w-52 sm:text-right">
              <h2 className="text-3xl font-black tracking-wide text-slate-900">
                TAX INVOICE
              </h2>
              <p className="mt-3 text-sm text-slate-500">
                Invoice number
              </p>
              <p className="break-all text-lg font-bold">
                {invoiceNumber || 'Assigned when saved'}
              </p>
              <p className="mt-2 text-sm text-slate-500">Invoice date</p>
              <p className="font-semibold">{displayDate}</p>
              <p className="mt-3 inline-block rounded-md border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800">
                {isSaved ? 'SAVED INVOICE' : 'DRAFT PREVIEW'}
              </p>
            </div>
          </header>

          <section className="grid grid-cols-1 gap-6 border-b border-slate-200 py-6 sm:grid-cols-2">
            <div>
              <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                Bill to
              </h3>
              <p className="font-bold text-slate-950">
                {customer?.name || 'Select a customer'}
              </p>
              {customer?.address && (
                <p className="mt-1 whitespace-pre-line text-sm text-slate-600">
                  {customer.address}
                </p>
              )}
              {customer?.state && (
                <p className="text-sm text-slate-600">
                  State: {customer.state}
                </p>
              )}
              {(customer?.gstin || customer?.gst) && (
                <p className="mt-1 break-all text-sm">
                  <strong>GSTIN:</strong> {customer.gstin || customer.gst}
                </p>
              )}
              {customer?.phone && (
                <p className="text-sm text-slate-600">
                  Phone: {customer.phone}
                </p>
              )}
              {customer?.email && (
                <p className="break-all text-sm text-slate-600">
                  Email: {customer.email}
                </p>
              )}
            </div>

            <div className="rounded-lg bg-slate-50 p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Invoice summary
              </h3>
              <div className="mt-3 flex justify-between gap-3 text-sm">
                <span>Items</span>
                <strong>{items.length}</strong>
              </div>
              <div className="mt-2 flex justify-between gap-3 text-sm">
                <span>Taxable value</span>
                <strong>{money(taxableTotal)}</strong>
              </div>
              <div className="mt-2 flex justify-between gap-3 text-sm">
                <span>Total GST</span>
                <strong>{money(taxTotal)}</strong>
              </div>
              <div className="mt-4 border-t border-slate-300 pt-3">
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Total payable
                </p>
                <p className="mt-1 text-2xl font-extrabold text-blue-800">
                  {money(grandTotal)}
                </p>
              </div>
            </div>
          </section>

          <section className="py-6">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider">
              Products and services
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-slate-900 text-white">
                    <th className="p-3">#</th>
                    <th className="p-3">Description</th>
                    <th className="p-3 text-right">Qty</th>
                    <th className="p-3 text-right">Unit price</th>
                    <th className="p-3 text-right">GST</th>
                    <th className="p-3 text-right">Taxable value</th>
                    <th className="p-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="border-b border-slate-200 p-6 text-center text-slate-500"
                      >
                        Add a product to see it in the preview.
                      </td>
                    </tr>
                  ) : (
                    items.map((item, index) => (
                      <tr
                        key={`${item.name}-${index}`}
                        className="border-b border-slate-200"
                      >
                        <td className="p-3">{index + 1}</td>
                        <td className="p-3 font-semibold">
                          {item.name}
                        </td>
                        <td className="p-3 text-right">{item.qty}</td>
                        <td className="p-3 text-right">
                          {money(item.price)}
                        </td>
                        <td className="p-3 text-right">
                          {item.gstRate}%
                        </td>
                        <td className="p-3 text-right">
                          {money(item.taxableAmount)}
                        </td>
                        <td className="p-3 text-right font-semibold">
                          {money(item.total)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="ml-auto max-w-sm border-t-2 border-slate-800 pt-4">
            <div className="flex justify-between gap-4 py-1 text-sm">
              <span>Taxable amount</span>
              <span>{money(taxableTotal)}</span>
            </div>
            <div className="flex justify-between gap-4 py-1 text-sm">
              <span>Total GST</span>
              <span>{money(taxTotal)}</span>
            </div>
            <div className="mt-3 flex justify-between gap-4 border-t border-slate-300 pt-3 text-lg font-extrabold">
              <span>Total payable</span>
              <span>{money(grandTotal)}</span>
            </div>
          </section>

          <section className="mt-8 border-t border-slate-200 pt-5">
            <h3 className="text-sm font-bold uppercase tracking-wider">
              Notes and payment terms
            </h3>
            <p className="mt-2 min-h-10 whitespace-pre-line text-sm text-slate-600">
              {notes?.trim() || 'No additional notes.'}
            </p>
          </section>

          <footer className="mt-12 flex flex-col justify-between gap-8 border-t border-slate-200 pt-5 sm:flex-row">
            <p className="text-xs text-slate-500">
              Please verify the invoice details before finalising.
            </p>
            <div className="min-w-52 text-center">
              <div className="h-12 border-b border-slate-400" />
              <p className="mt-2 text-sm font-semibold">
                Authorised signature
              </p>
              <p className="text-xs text-slate-500">
                {company?.companyName || 'Seller'}
              </p>
            </div>
          </footer>
        </article>

        <p className="mx-auto mt-4 max-w-5xl text-xs text-slate-200">
          {isSaved
            ? 'Review of the saved invoice. The displayed details come from the invoice data available to the application.'
            : 'This is a draft preview. The final invoice number and server-calculated GST totals must be checked against the saved invoice.'}
        </p>
      </div>

      <style>{`
        .invoice-preview-sheet {
          width: 100%;
          max-width: 210mm;
          min-height: 260mm;
        }

        @media print {
          body * {
            visibility: hidden;
          }

          .invoice-preview-sheet,
          .invoice-preview-sheet * {
            visibility: visible;
          }

          .invoice-preview-sheet {
            position: absolute;
            left: 0;
            top: 0;
            width: 210mm;
            max-width: none;
            min-height: 0;
            padding: 12mm;
            box-shadow: none;
          }
        }
      `}</style>
    </div>
  );
}

