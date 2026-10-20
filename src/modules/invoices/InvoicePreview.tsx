
import React, { useCallback, useRef, useState } from 'react';

import DefaultInvoiceTemplate from './Templates/DefaultInvoiceTemplate';
import CustomInvoiceTemplate from './Templates/CustomInvoiceTemplate';
import type { InvoiceTemplateData } from './Templates/DefaultInvoiceTemplate';

export type PreviewCompany = {
  companyName?: string;
  gstin?: string;
  email?: string;
  phone?: string;
  address?: string;
  state?: string;
  pinCode?: string;
  bankName?: string;
  accountHolder?: string;
  accountNumber?: string;
  ifscCode?: string;
  branch?: string;
  
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

type InvoicePreviewProps = InvoiceTemplateData & {
  isSaved?: boolean;
  onClose: () => void;
};

export default function InvoicePreview({
  isSaved,
  company,
  jurisdiction,
  customer,
  invoiceNumber,
  date,
  items,
  taxableTotal,
  taxTotal,
  grandTotal,
  freightCharges, 
  packingCharges,
  roundOff,
  notes,
  onClose,
}: InvoicePreviewProps) {
  const [customFile, setCustomFile] = useState<File | null>(null);
  const [customMode, setCustomMode] = useState(false);
  const [templateError, setTemplateError] = useState('');

  const fileInput = useRef<HTMLInputElement>(null);

  const data: InvoiceTemplateData = {
    company,
    Jurisdiction,
    customer,
    invoiceNumber,
    date,
    items,
    taxableTotal,
    taxTotal,
    grandTotal,
    freightCharges,
    packingCharges,
    roundOff,
    notes,
  };

  const handleTemplateError = useCallback((message: string) => {
    setTemplateError(message);
  }, []);

  function chooseCustomTemplate(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.xlsx')) {
      setTemplateError(
        'Please upload an Excel .xlsx file. Older .xls files and PDFs are not supported in this version.',
      );
      event.target.value = '';
      return;
    }

    setTemplateError('');
    setCustomFile(file);
    setCustomMode(true);
    event.target.value = '';
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 p-3 sm:p-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">
              {isSaved ? 'Saved invoice preview' : 'Draft invoice preview'}
            </h2>

            <p className="mt-1 text-sm text-slate-200">
              {customMode
                ? 'Previewing your uploaded Excel template.'
                : 'Previewing the default invoice layout.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <input
              ref={fileInput}
              type="file"
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={chooseCustomTemplate}
              className="hidden"
              aria-label="Upload custom Excel invoice template"
            />

            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              className="rounded-lg bg-white px-4 py-2 font-semibold text-slate-900 hover:bg-slate-100"
            >
              Custom template
            </button>

            {customMode && (
              <button
                type="button"
                onClick={() => {
                  setCustomMode(false);
                  setTemplateError('');
                }}
                className="rounded-lg border border-white px-4 py-2 font-semibold text-white hover:bg-white/10"
              >
                Use default
              </button>
            )}

            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-lg border border-white px-4 py-2 font-semibold text-white hover:bg-white/10"
            >
              Print
            </button>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
            >
              Back to editing
            </button>
          </div>
        </header>

        {templateError && (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800"
          >
            {templateError}
          </div>
        )}

        {customMode && customFile ? (
          <CustomInvoiceTemplate
            file={customFile}
            data={data}
            onError={handleTemplateError}
          />
        ) : (
          <article className="invoice-preview-sheet mx-auto max-w-[210mm] bg-white p-5 text-slate-900 shadow-xl sm:p-10">
            <DefaultInvoiceTemplate data={data} />
          </article>
        )}

        <p className="mx-auto mt-4 max-w-5xl text-xs text-slate-200">
          {isSaved
            ? 'This preview uses the saved invoice details currently available to the application.'
            : 'This is a draft preview. Verify the saved invoice and server-calculated totals before issuing the final document.'}
        </p>
      </div>

      <style>{`
        .invoice-preview-sheet {
          width: 100%;
          min-height: 260mm;
        }

        @media print {
          
          .invoice-default-template table {
          width: 100%;
          border-collapse: collapse;
          }

          .invoice-default-template table thead {
          display: table-header-group;
          }

          .invoice-default-template table tr {
          break-inside: avoid;
          page-break-inside: avoid;
          }

          .invoice-default-template table th,
          .invoice-default-template table td {
          border: 1px solid #000;
          }

          .invoice-default-template .product-table {
          break-inside: auto;
          page-break-inside: auto;
          }
          @page {
            size: A4 portrait;
            margin: 10mm;
          }

          body * {
            visibility: hidden !important;
          }

          .invoice-preview-sheet,
          .invoice-preview-sheet * ,
          .custom-excel-sheet,
          .custom-excel-sheet * {
            visibility: visible !important;
          }

          .invoice-preview-sheet,
          .custom-excel-sheet {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            min-height: 0;
            padding: 0;
            box-shadow: none;
            overflow: visible !important;
          }
        }
      `}</style>
    </div>
  );
}

