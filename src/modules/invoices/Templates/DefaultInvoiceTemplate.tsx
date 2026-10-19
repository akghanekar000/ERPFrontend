
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

const dateText = (value?: string) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString('en-IN');
};

const cell = 'border border-black px-1.5 py-1 align-top';
const heading = 'border border-black bg-gray-100 px-1.5 py-1 text-left font-bold';

export default function DefaultInvoiceTemplate({ data }: Props) {
  const { company, customer, items } = data;

  const gstSummary = items.reduce<
    { rate: number; taxable: number; tax: number }[]
  >((summary, item) => {
    const rate = Number(item.gstRate || 0);
    const existing = summary.find((entry) => entry.rate === rate);

    if (existing) {
      existing.taxable += Number(item.taxableAmount || 0);
      existing.tax += Number(item.taxAmount || 0);
    } else {
      summary.push({
        rate,
        taxable: Number(item.taxableAmount || 0),
        tax: Number(item.taxAmount || 0),
      });
    }
    return summary;
  }, []);

  const rawTotal = Number(data.grandTotal || 0);

  const roundedTotal = Math.round(rawTotal);

  const roundOff = Number(
  (roundedTotal - rawTotal).toFixed(2),
  );

  const bankDetails = [
    ['Bank Name', company?.bankName],
    ['Account Holder', company?.accountHolder],
    ['A/c Number', company?.accountNumber],
    ['IFSC', company?.ifscCode],
    ['Branch', company?.branch],
  ].filter((entry) => entry[1]);

  return (
    <div className="invoice-default-template mx-auto w-full bg-white text-[9px] leading-[1.35] text-black">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="text-[8px] leading-4">
          <p>Original for Buyer</p>
          <p>Duplicate for Transporter</p>
        </div>
        <div className="text-center">
          <h1 className="text-base font-bold uppercase tracking-wide">
            Tax Invoice
          </h1>
          <p className="text-[8px]">Invoice</p>
        </div>
        <div className="min-w-[90px] text-right">
          <p className="font-bold">Invoice No.</p>
          <p>{data.invoiceNumber || '—'}</p>
          <p className="mt-1 font-bold">Date</p>
          <p>{dateText(data.date)}</p>
        </div>
      </div>

      <table className="mb-2 w-full border-collapse">
        <tbody>
          <tr>
            <td className={`${cell} w-1/2`}>
              <p className="mb-1 font-bold uppercase">
                Seller / Supplier
              </p>
              <p className="text-[12px] font-bold">
                {company?.companyName || 'Company name'}
              </p>
              <p className="whitespace-pre-line">
                {company?.address || 'Company address'}
              </p>
              {company?.state && <p>State: {company.state}</p>}
              {company?.pinCode && <p>PIN: {company.pinCode}</p>}
              {company?.gstin && <p>GSTIN: {company.gstin}</p>}
              {company?.phone && <p>Phone: {company.phone}</p>}
              {company?.email && <p>Email: {company.email}</p>}
            </td>
            <td className={cell}>
              <p className="mb-1 font-bold uppercase">
                Invoice Details
              </p>
              <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                <span className="font-bold">Invoice No.</span>
                <span>{data.invoiceNumber || '—'}</span>
                <span className="font-bold">Invoice Date</span>
                <span>{dateText(data.date)}</span>
                <span className="font-bold">Payment Terms</span>
                <span>As agreed</span>
                <span className="font-bold">IRN / E-way Bill</span>
                <span>—</span>
                <span className="font-bold">Transporter</span>
                <span>—</span>
              </div>
            </td>
          </tr>
          <tr>
            <td className={cell}>
              <p className="mb-1 font-bold uppercase">
                Consignee / Ship To
              </p>
              <p className="font-bold">
                {customer?.name || 'Customer name'}
              </p>
              <p className="whitespace-pre-line">
                {customer?.address || 'Address not provided'}
              </p>
              {customer?.state && <p>State: {customer.state}</p>}
              {(customer?.gstin || customer?.gst) && (
                <p>GSTIN: {customer.gstin || customer.gst}</p>
              )}
              {customer?.phone && <p>Phone: {customer.phone}</p>}
            </td>
            <td className={cell}>
              <p className="mb-1 font-bold uppercase">
                Buyer / Bill To
              </p>
              <p className="font-bold">
                {customer?.name || 'Customer name'}
              </p>
              <p className="whitespace-pre-line">
                {customer?.address || 'Address not provided'}
              </p>
              {customer?.state && <p>State: {customer.state}</p>}
              {(customer?.gstin || customer?.gst) && (
                <p>GSTIN: {customer.gstin || customer.gst}</p>
              )}
              {customer?.phone && <p>Phone: {customer.phone}</p>}
            </td>
          </tr>
        </tbody>
      </table>

      <table className="mb-2 w-full table-fixed border-collapse">
        <thead>
          <tr>
            <th className={`${heading} w-[6%]`}>Sr.</th>
            <th className={`${heading} w-[34%]`}>Description of Goods</th>
            <th className={`${heading} w-[10%]`}>HSN/SAC</th>
            <th className={`${heading} w-[10%] text-right`}>Qty</th>
            <th className={`${heading} w-[12%] text-right`}>Rate</th>
            <th className={`${heading} w-[8%] text-right`}>GST%</th>
            <th className={`${heading} w-[20%] text-right`}>Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={7} className={`${cell} text-center`}>
                No items added
              </td>
            </tr>
          ) : (
            items.map((item, index) => (
              <tr key={`${item.name}-${index}`}>
                <td className={cell}>{index + 1}</td>
                <td className={cell}>{item.name}</td>
                <td className={cell}>—</td>
                <td className={`${cell} text-right`}>{item.qty}</td>
                <td className={`${cell} text-right`}>
                  {money(item.price)}
                </td>
                <td className={`${cell} text-right`}>
                  {item.gstRate}%
                </td>
                <td className={`${cell} text-right`}>
                  {money(item.total)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="mb-2 grid grid-cols-2 gap-2">
        <div className="border border-black p-2">
          <p className="mb-1 font-bold uppercase">GST Summary</p>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className={heading}>Rate</th>
                <th className={`${heading} text-right`}>Taxable Value</th>
                <th className={`${heading} text-right`}>GST Amount</th>
              </tr>
            </thead>
            <tbody>
              {gstSummary.map((entry) => (
                <tr key={entry.rate}>
                  <td className={cell}>{entry.rate}%</td>
                  <td className={`${cell} text-right`}>
                    {money(entry.taxable)}
                  </td>
                  <td className={`${cell} text-right`}>
                    {money(entry.tax)}
                  </td>
                </tr>
              ))}
              <tr>
                <td className={`${cell} font-bold`}>Total</td>
                <td className={`${cell} text-right font-bold`}>
                  {money(data.taxableTotal)}
                </td>
                <td className={`${cell} text-right font-bold`}>
                  {money(data.taxTotal)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="border border-black p-2">
          <p className="mb-2 font-bold uppercase">Invoice Total</p>
          <div className="flex justify-between gap-2 py-1">
            <span>Taxable Amount</span>
            <span>{money(data.taxableTotal)}</span>
          </div>
          <div className="flex justify-between gap-2 py-1">
            <span>Total GST</span>
            <span>{money(data.taxTotal)}</span>
          </div>
          <div className="flex justify-between gap-2 py-1">
            <span>Round Off</span>
            <span>{money(roundOff)}</span>
        </div>
        <div className="mt-1 flex justify-between gap-2 border-t border-black pt-2 text-[11px] font-bold">
          <span>Total Payable</span>
          <span>{money(roundedTotal)}</span>
      </div>

      <div className="mb-2 grid grid-cols-2 gap-2">
        <div className="border border-black p-2">
          <p className="mb-1 font-bold uppercase">Bank Details</p>
          {bankDetails.length ? (
            bankDetails.map(([label, value]) => (
              <p key={label}>
                <span className="font-bold">{label}: </span>{value}
              </p>
            ))
          ) : (
            <p>Add bank details in Company Settings.</p>
          )}
        </div>
        <div className="border border-black p-2">
          <p className="mb-1 font-bold uppercase">Declaration / Terms</p>
          <p className="whitespace-pre-line">
            {data.notes?.trim() || 'No additional terms provided.'}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <p className="font-bold">
            For {company?.companyName || 'Seller'}
          </p>
          <p className="mt-8 border-t border-black pt-1">
            Customer / Receiver Signature
          </p>
        </div>
        <div className="text-right">
          <p className="font-bold">
            For {company?.companyName || 'Seller'}
          </p>
          <p className="mt-8 border-t border-black pt-1">
            Authorised Signatory
          </p>
        </div>
      </div>

      <p className="mt-3 border-t border-black pt-2 text-center text-[8px]">
        This is a computer-generated invoice.
      </p>
    </div>
  );
}
