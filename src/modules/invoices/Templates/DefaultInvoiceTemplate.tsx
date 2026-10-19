
import React from 'react';
import type {
  PreviewCompany,
  PreviewCustomer,
  PreviewItem,
} from '../InvoicePreview';

export type InvoiceTemplateData = {
  company: PreviewCompany | null;
  customer: PreviewCustomer | null;
  invoiceNumber?: string;
  date?: string;
  items: PreviewItem[];
  taxableTotal: number;
  taxTotal: number;
  grandTotal: number;
  notes?: string;
};

type Props = {
  data: InvoiceTemplateData;
};

const money = (value: number) =>
  `₹${Number(value || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const rounded = (value: number) => Math.round(Number(value || 0));

const roundOff = (value: number) =>
  Number((rounded(value) - Number(value || 0)).toFixed(2));

const dateText = (value?: string) => {
  if (!value) return new Date().toLocaleDateString('en-IN');

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString('en-IN');
};

export default function DefaultInvoiceTemplate({ data }: Props) {
  const { company, customer, items } = data;

  const gstSummary = items.reduce<
    { rate: number; taxable: number; tax: number }[]
  >((summary, item) => {
    const existing = summary.find(
      (entry) => entry.rate === Number(item.gstRate || 0),
    );

    if (existing) {
      existing.taxable += Number(item.taxableAmount || 0);
      existing.tax += Number(item.taxAmount || 0);
    } else {
      summary.push({
        rate: Number(item.gstRate || 0),
        taxable: Number(item.taxableAmount || 0),
        tax: Number(item.taxAmount || 0),
      });
    }

    return summary;
  }, []);

  return (
    <div className="invoice-default-template text-black">
      <header className="grid grid-cols-1 gap-4 border-b-2 border-black pb-4 sm:grid-cols-2">
        <div className="text-right text-xs font-bold uppercase leading-6">
          <p>Original for Buyer</p>
           <p>Duplicate for Transporter</p>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-widest">
            Seller / Supplier
          </p>

          <h1 className="mt-2 text-2xl font-extrabold uppercase">
            {company?.companyName || 'Company name'}
          </h1>

          <p className="mt-2 whitespace-pre-line text-sm">
            {company?.address || 'Company address'}
            {company?.state ? `\nState: ${company.state}` : ''}
            {company?.pinCode ? `\nPIN: ${company.pinCode}` : ''}
          </p>

          {company?.gstin && (
            <p className="mt-1 text-sm">
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

        <div className="sm:text-right">
          <h2 className="text-3xl font-black">TAX INVOICE</h2>

          <p className="mt-3 text-sm">
            <strong>Invoice No.:</strong>{' '}
            {data.invoiceNumber || 'Pending'}
          </p>

          <p className="mt-1 text-sm">
            <strong>Date:</strong> {dateText(data.date)}
          </p>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-4 border-b border-black py-4 sm:grid-cols-2">
        <div className="border border-black p-3">
          <h3 className="mb-2 text-sm font-bold uppercase">
            Bill To
          </h3>

          <p className="font-bold">
            {customer?.name || 'Customer name'}
          </p>

          {customer?.address && (
            <p className="mt-1 whitespace-pre-line text-sm">
              {customer.address}
            </p>
          )}

          {customer?.state && (
            <p className="text-sm">State: {customer.state}</p>
          )}

          {(customer?.gstin || customer?.gst) && (
            <p className="mt-1 break-all text-sm">
              <strong>GSTIN:</strong> {customer.gstin || customer.gst}
            </p>
          )}

          {customer?.phone && (
            <p className="text-sm">Phone: {customer.phone}</p>
          )}
        </div>

        <div className="border border-black p-3">
          <h3 className="mb-2 text-sm font-bold uppercase">
            Bank Details
          </h3>

          {company?.bankName ||
          company?.accountHolder ||
          company?.accountNumber ||
          company?.ifscCode ||
          company?.branch ? (
            <div className="space-y-2 text-sm">
              {company?.bankName && (
                <div>
                  <strong>Bank:</strong> {company.bankName}
                </div>
              )}

              {company?.accountHolder && (
                <div>
                  <strong>Account Holder:</strong>{' '}
                  {company.accountHolder}
                </div>
              )}

              {company?.accountNumber && (
                <div className="break-all">
                  <strong>Account No.:</strong>{' '}
                  {company.accountNumber}
                </div>
              )}

              {company?.ifscCode && (
                <div>
                  <strong>IFSC:</strong> {company.ifscCode}
                </div>
              )}

              {company?.branch && (
                <div>
                  <strong>Branch:</strong> {company.branch}
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-slate-600">
              Add your bank details in Company Settings.
            </p>
          )}
        </div>
      </section>

      <section className="py-4">
        <h3 className="mb-3 text-sm font-bold uppercase">
          Description of Goods / Services
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] border-collapse text-xs sm:text-sm">
            <thead>
              <tr>
                {[
                  'Sr.',
                  'Description',
                  'Qty',
                  'Rate',
                  'GST %',
                  'Taxable Value',
                  'Amount',
                ].map((heading) => (
                  <th
                    key={heading}
                    className="border border-black p-2 text-left"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="border border-black p-4 text-center"
                  >
                    No items
                  </td>
                </tr>
              ) : (
                items.map((item, index) => (
                  <tr key={`${item.name}-${index}`}>
                    <td className="border border-black p-2">
                      {index + 1}
                    </td>

                    <td className="border border-black p-2">
                      {item.name}
                    </td>

                    <td className="border border-black p-2 text-right">
                      {item.qty}
                    </td>

                    <td className="border border-black p-2 text-right">
                      {money(item.price)}
                    </td>

                    <td className="border border-black p-2 text-right">
                      {item.gstRate}%
                    </td>

                    <td className="border border-black p-2 text-right">
                      {money(item.taxableAmount)}
                    </td>

                    <td className="border border-black p-2 text-right">
                      {money(item.total)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 border-t border-black pt-4 sm:grid-cols-2">
        <div>
          <h3 className="mb-2 text-sm font-bold uppercase">
            GST Summary
          </h3>

          <table className="w-full border-collapse text-xs sm:text-sm">
            <thead>
              <tr>
                <th className="border border-black p-2 text-left">
                  GST Rate
                </th>

                <th className="border border-black p-2 text-right">
                  Taxable
                </th>

                <th className="border border-black p-2 text-right">
                  GST Amount
                </th>
              </tr>
            </thead>

            <tbody>
              {gstSummary.map((entry) => (
                <tr key={entry.rate}>
                  <td className="border border-black p-2">
                    {entry.rate}%
                  </td>

                  <td className="border border-black p-2 text-right">
                    {money(entry.taxable)}
                  </td>

                  <td className="border border-black p-2 text-right">
                    {money(entry.tax)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <div className="flex justify-between gap-3 py-1 text-sm">
            <span>Taxable Amount</span>
            <span>{money(data.taxableTotal)}</span>
          </div>

          <div className="flex justify-between gap-3 py-1 text-sm">
            <span>Total GST</span>
            <span>{money(data.taxTotal)}</span>
          </div>

          <div className="flex justify-between gap-3 py-1 text-sm">
            <span>Round Off</span>
            <span>
              {roundOff(data.grandTotal) >= 0 ? '+' : '−'}
              {money(Math.abs(roundOff(data.grandTotal)))}
            </span>
          </div>

          <div className="mt-2 flex justify-between gap-3 border-t-2 border-black pt-3 font-extrabold">
            <span>Total Payable</span>
            <span>{money(rounded(data.grandTotal))}</span>
          </div>
        </div>
      </section>

      <section className="mt-5 border-t border-black pt-3 text-sm">
        <h3 className="font-bold uppercase">
          Declaration / Terms
        </h3>

        <p className="mt-2 whitespace-pre-line">
          {data.notes?.trim() || 'No additional terms provided.'}
        </p>
      </section>

      <footer className="mt-10 grid grid-cols-1 gap-8 text-sm sm:grid-cols-2">
        <div>
          <p className="font-bold">
            For {company?.companyName || 'Seller'}
          </p>

          <p className="mt-12 border-t border-black pt-2">
            Authorised Signatory
          </p>
        </div>

        <div className="sm:text-right">
          <p>Computer-generated invoice</p>
          <p className="mt-1">
            Please verify all invoice details.
          </p>
        </div>
      </footer>
    </div>
  );
}

