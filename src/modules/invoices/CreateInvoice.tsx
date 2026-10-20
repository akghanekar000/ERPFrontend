
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuid } from 'uuid';
import { listCustomers } from '../../services/customers.service';
import { listProducts } from '../../services/products.service';
import { createInvoice } from '../../services/invoices.service';
import { getCompany } from '../../services/company.service';
import type { Company } from '../../services/company.service';
import InvoicePreview from './InvoicePreview';
import type {
  PreviewCompany,
  PreviewCustomer,
  PreviewItem,
} from './InvoicePreview';
import type { Product } from '../../services/products.service';
import type { Customer } from '../../services/customers.service';

type PriceMode = 'inclusive' | 'exclusive';

type InvoiceLine = {
  id: string;
  productId: string;
  qty: number;
  gstRate: number;
  priceMode: PriceMode;
};

type CalculatedLine = InvoiceLine & {
  product?: Product;
  price: number;
  enteredAmount: number;
  taxableAmount: number;
  taxAmount: number;
  total: number;
};

const money = (amount: number) =>
  `₹${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const roundMoney = (amount: number) =>
  Math.round((amount + Number.EPSILON) * 100) / 100;

const productIdOf = (product: Product) =>
  product.id || product._id || '';

const customerIdOf = (customer: Customer) =>
  customer.id || customer._id || '';

export default function CreateInvoice() {
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [company, setCompany] = useState<Company | null>(null);
  const [customerId, setCustomerId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [jurisdiction, setJurisdiction] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(() => {
    const now = new Date();

    return [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0'),
    ].join('-');
  });
  const [showPreview, setShowPreview] = useState(false);
  const [notes, setNotes] = useState('');
  const [freightCharges, setFreightCharges] = useState(0);
  const [packingCharges, setPackingCharges] = useState(0);
  const [items, setItems] = useState<InvoiceLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    Promise.all([listCustomers(), listProducts(), getCompany()])
      .then(([customerData, productData, companyData]) => {
  if (!active) return;

  setCustomers(customerData);
  setProducts(productData);
  setCompany(companyData);

      })
      .catch((err: unknown) => {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'Could not load customers and products.',
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

  const lines = useMemo<CalculatedLine[]>(() => {
    return items.map((item) => {
      const product = products.find(
        (candidate) => productIdOf(candidate) === item.productId,
      );

      const price = Number(product?.price ?? 0);
      const enteredAmount = roundMoney(price * item.qty);

      const taxableAmount = roundMoney(
        item.priceMode === 'inclusive'
          ? enteredAmount / (1 + item.gstRate / 100)
          : enteredAmount,
      );

      const taxAmount = roundMoney(
        item.priceMode === 'inclusive'
          ? enteredAmount - taxableAmount
          : taxableAmount * item.gstRate / 100,
      );

      return {
        ...item,
        product,
        price,
        enteredAmount,
        taxableAmount,
        taxAmount,
        total: roundMoney(taxableAmount + taxAmount),
      };
    });
  }, [items, products]);

  const taxableTotal = roundMoney(
    lines.reduce((sum, item) => sum + item.taxableAmount, 0),
  );

  const taxTotal = roundMoney(
    lines.reduce((sum, item) => sum + item.taxAmount, 0),
  );

  const combinedCharges = roundMoney(
    freightCharges + packingCharges,
  );

  const chargeTax = taxableTotal > 0
    ? roundMoney(
        lines.reduce(
          (sum, item) =>
            sum +
            (combinedCharges *
              item.taxableAmount /
              taxableTotal) *
              item.gstRate /
              100,
          0,
        ),
      )
    : 0;

  const finalTaxableTotal = roundMoney(
    taxableTotal + combinedCharges,
  );

  const finalTaxTotal = roundMoney(
    taxTotal + chargeTax,
  );

  const rawGrandTotal = roundMoney(
    finalTaxableTotal + finalTaxTotal,
  );

  const roundOff = roundMoney(
    Math.round(rawGrandTotal) - rawGrandTotal,
  );

  const grandTotal = Math.round(rawGrandTotal);
    const enteredTotal = roundMoney(
      lines.reduce((sum, item) => sum + item.enteredAmount, 0),
    );

  const addItem = () => {
    if (!products.length) {
      setError('Add a product before creating an invoice.');
      return;
    }

    setError('');

    const firstProduct = products[0];

    setItems((current) => [
      ...current,
      {
        id: uuid(),
        productId: productIdOf(firstProduct),
        qty: 1,
        gstRate: Number(firstProduct.gstRate ?? 0),
        priceMode: 'exclusive',
      },
    ]);
  };

  const updateItem = (
    id: string,
    changes: Partial<InvoiceLine>,
  ) => {
    setItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, ...changes } : item,
      ),
    );
  };

  const updateProduct = (id: string, nextProductId: string) => {
    const product = products.find(
      (candidate) => productIdOf(candidate) === nextProductId,
    );

    updateItem(id, {
      productId: nextProductId,
      gstRate: Number(product?.gstRate ?? 0),
    });
  };

  const removeItem = (id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  };

  const saveInvoice = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
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

    if (
      lines.some(
        (item) =>
          !Number.isFinite(item.qty) ||
          item.qty <= 0 ||
          !Number.isFinite(item.price) ||
          item.price < 0 ||
          !Number.isFinite(item.gstRate) ||
          item.gstRate < 0 ||
          item.gstRate > 100,
      )
    ) {
      setError('Check the quantity, price and GST rate for each item.');
      return;
    }

    setSaving(true);

    try {
      await createInvoice({
        customer: customerId,
        invoiceNumber: invoiceNumber.trim() || undefined,
        invoiceDate,
        freightCharges,
        packingCharges,
        items: lines.map((item) => ({
        product: item.productId,
        qty: item.qty,
        price: item.price,
        priceMode: item.priceMode,
        gstRate: item.gstRate,
        })),
      notes: notes.trim(),
     });

      navigate('/invoices');
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not save the invoice.',
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-5xl p-4 sm:p-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600">
          Loading your customers and products…
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-4 pb-10 sm:p-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            A K TRADERS
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
            Create invoice
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Choose the customer, add products and review the GST calculation.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/invoices')}
          className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700"
        >
          Back to invoices
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

      <form onSubmit={saveInvoice} className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
  <h2 className="text-lg font-bold text-slate-900">
    Invoice details
  </h2>

  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
    <div>
      <label
        htmlFor="invoiceNumber"
        className="block text-sm font-semibold text-slate-700"
      >
        Invoice number
      </label>

      <input
        id="invoiceNumber"
        type="text"
        value={invoiceNumber}
        onChange={(event) => setInvoiceNumber(event.target.value)}
        placeholder="Leave blank for automatic numbering"
        maxLength={50}
        className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-3"
      />

      <p className="mt-1 text-xs text-slate-500">
        Leave blank to use the next automatic invoice number.
      </p>
    </div>

    <div>
      <label
        htmlFor="invoiceDate"
        className="block text-sm font-semibold text-slate-700"
      >
        Invoice date *
      </label>

      <input
        id="invoiceDate"
        type="date"
        required
        value={invoiceDate}
        onChange={(event) => setInvoiceDate(event.target.value)}
        className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-3"
      />
    </div>
    <div className="mt-4">
  <label
    htmlFor="jurisdiction"
    className="block text-sm font-semibold text-slate-700"
  >
    Subject to Jurisdiction
  </label>

  <input
    id="jurisdiction"
    type="text"
    value={jurisdiction}
    onChange={(event) => setJurisdiction(event.target.value)}
    placeholder="Enter jurisdiction, e.g. Mumbai, Maharashtra"
    maxLength={150}
    className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-3"
  />
</div>
  </div>
</section>
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <h2 className="text-lg font-bold text-slate-900">
            Customer details
          </h2>

          <label
            htmlFor="customer"
            className="mt-4 block text-sm font-semibold text-slate-700"
          >
            Select customer *
          </label>

          <select
            id="customer"
            required
            value={customerId}
            onChange={(event) => setCustomerId(event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm"
          >
            <option value="">Choose a customer</option>
            {customers.map((customer) => (
              <option
                key={customerIdOf(customer)}
                value={customerIdOf(customer)}
              >
                {customer.name}
                {customer.state ? ` — ${customer.state}` : ''}
              </option>
            ))}
          </select>

          {!customers.length && (
            <p className="mt-2 text-sm text-amber-700">
              No customers found. Add a customer before creating an invoice.
            </p>
          )}

          <p className="mt-3 text-xs text-slate-500">
            The backend determines whether to use CGST + SGST or IGST from
            your company and customer state details. Make sure both are correct.
          </p>
        </section>
        
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <h2 className="text-lg font-bold text-slate-900">
            Freight and packing charges
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            These charges are added to the taxable value. GST is calculated
            using the rates of the invoice items.
          </p>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
          <label
            htmlFor="freightCharges"
            className="block text-sm font-semibold text-slate-700"
          >
            Freight charges (₹)
          </label>
        <input
          id="freightCharges"
          type="number"
          min="0"
          step="0.01"
          value={freightCharges}
          onChange={(event) =>
            setFreightCharges(Math.max(0, Number(event.target.value) || 0))
          }
          className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-3"
        />
      </div>

      <div>
      <label
          htmlFor="packingCharges"
          className="block text-sm font-semibold text-slate-700"
       >
        Packing charges (₹)
       </label>
           <input
             id="packingCharges"
             type="number"
             min="0"
             step="0.01"
             value={packingCharges}
             onChange={(event) =>
               setPackingCharges(Math.max(0, Number(event.target.value) || 0))
             }
             className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-3"
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
                {items.length} {items.length === 1 ? 'item' : 'items'}
              </p>
            </div>

            <button
              type="button"
              onClick={addItem}
              disabled={!products.length}
              className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              + Add product
            </button>
          </div>

          {!items.length ? (
            <div className="p-8 text-center">
              <p className="font-semibold text-slate-900">
                No products added
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Tap “Add product” to begin.
              </p>
            </div>
          ) : (
            <div className="space-y-4 p-4 sm:p-6">
              {lines.map((item, index) => (
                <article
                  key={item.id}
                  className="space-y-4 rounded-xl border border-slate-200 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-semibold text-slate-900">
                      Item {index + 1}
                    </h3>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="rounded-lg px-3 py-2 text-sm font-semibold text-red-600"
                    >
                      Remove
                    </button>
                  </div>

                  <div>
                    <label
                      htmlFor={`product-${item.id}`}
                      className="block text-sm font-semibold text-slate-700"
                    >
                      Product
                    </label>
                    <select
                      id={`product-${item.id}`}
                      value={item.productId}
                      onChange={(event) =>
                        updateProduct(item.id, event.target.value)
                      }
                      className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm"
                    >
                      {products.map((product) => (
                        <option
                          key={productIdOf(product)}
                          value={productIdOf(product)}
                        >
                          {product.name} — {money(Number(product.price))}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor={`qty-${item.id}`}
                        className="block text-sm font-semibold text-slate-700"
                      >
                        Quantity
                      </label>
                      <input
                        id={`qty-${item.id}`}
                        type="number"
                        min="0.001"
                        step="0.001"
                        required
                        value={item.qty}
                        onChange={(event) =>
                          updateItem(item.id, {
                            qty: Math.max(0.001, Number(event.target.value) || 0.001),
                          })
                        }
                        className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-3"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor={`gst-${item.id}`}
                        className="block text-sm font-semibold text-slate-700"
                      >
                        GST rate (%)
                      </label>
                      <input
                        id={`gst-${item.id}`}
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        required
                        value={item.gstRate}
                        onChange={(event) =>
                          updateItem(item.id, {
                            gstRate: Number(event.target.value),
                          })
                        }
                        className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-3"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor={`price-mode-${item.id}`}
                      className="block text-sm font-semibold text-slate-700"
                    >
                      Product price type
                    </label>
                    <select
                      id={`price-mode-${item.id}`}
                      value={item.priceMode}
                      onChange={(event) =>
                        updateItem(item.id, {
                          priceMode: event.target.value as PriceMode,
                        })
                      }
                      className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm"
                    >
                      <option value="exclusive">
                        GST-exclusive — add GST to the price
                      </option>
                      <option value="inclusive">
                        GST-inclusive — GST is already in the price
                      </option>
                    </select>
                  </div>

                  <div className="space-y-2 border-t border-slate-100 pt-4 text-sm">
                    <div className="flex justify-between gap-3">
                      <span className="text-slate-500">Unit price</span>
                      <span className="font-medium text-slate-900">
                        {money(item.price)}
                      </span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-slate-500">Entered amount</span>
                      <span className="text-slate-900">
                        {money(item.enteredAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-slate-500">Taxable amount</span>
                      <span className="text-slate-900">
                        {money(item.taxableAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-slate-500">
                        GST ({item.gstRate}%)
                      </span>
                      <span className="text-slate-900">
                        {money(item.taxAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between gap-3 border-t border-slate-100 pt-3 font-bold">
                      <span className="text-slate-900">Item total</span>
                      <span className="text-slate-900">
                        {money(item.total)}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <label
            htmlFor="notes"
            className="block text-sm font-semibold text-slate-700"
          >
            Notes and payment terms (optional)
          </label>
          <textarea
            id="notes"
            rows={3}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Enter payment terms, delivery details or other notes"
            className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-3 text-sm"
          />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <h2 className="text-lg font-bold text-slate-900">
            Invoice summary
          </h2>

          <div className="mt-4 space-y-3">
            <div className="flex justify-between gap-4 text-sm">
              <span className="text-slate-600">Entered item amounts</span>
              <span className="text-slate-900">{money(enteredTotal)}</span>
            </div>

            <div className="flex justify-between gap-4 text-sm">
              <span className="text-slate-600">Total taxable amount</span>
              <span className="text-slate-900">{money(finalTaxableTotal)}</span>
            </div>

            <div className="flex justify-between gap-4 text-sm">
              <span className="text-slate-600">Total GST</span>
              <span className="text-slate-900">{money(finalTaxTotal)}</span>
            </div>

            <div className="flex justify-between gap-4 border-t border-slate-200 pt-4">
              <span className="font-bold text-slate-900">Total payable</span>
              <span className="text-xl font-bold text-blue-700">
                {money(grandTotal)}
              </span>
            </div>
          </div>
          
          <button
    type="button"
    onClick={() => {
      if (!customerId) {
        setError('Please select a customer before previewing.');
        return;
      }

      if (!items.length || lines.some((item) => !item.product)) {
        setError('Please add at least one valid product before previewing.');
        return;
      }

      setError('');
      setShowPreview(true);
    }}
      disabled={!customers.length || !products.length}
      className="mt-6 mr-3 w-full rounded-xl border border-blue-600 bg-white px-5 py-3.5 font-semibold text-blue-700 hover:bg-blue-50 disabled:opacity-50 sm:w-auto"
  >
    Preview Invoice
  </button>
          <button
            type="submit"
            disabled={saving || !customers.length || !products.length || !items.length}
            className="mt-6 w-full rounded-xl bg-blue-600 px-5 py-3.5 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {saving ? 'Saving invoice…' : 'Save invoice'}
          </button>

          <p className="mt-3 text-xs text-slate-500">
            The backend recalculates GST and stores the invoice. Check your
            company and customer state details before saving.
          </p>
        </section>
      </form>
      
      {showPreview && (
  <InvoicePreview
    company={company}
    jurisdiction={jurisdiction}
    customer={
      customers.find((customer) => customerIdOf(customer) === customerId) ?? null
    }
    invoiceNumber={invoiceNumber.trim() || undefined}
    date={invoiceDate}
    items={lines.map((item) => ({
      name: item.product?.name || 'Product',
      qty: item.qty,
      price: item.price,
      gstRate: item.gstRate,
      taxableAmount: item.taxableAmount,
      taxAmount: item.taxAmount,
      total: item.total,
    }))}
    taxableTotal={finalTaxableTotal}
    taxTotal={finalTaxTotal}
    grandTotal={grandTotal}
    freightCharges={freightCharges}
    packingCharges={packingCharges}
    roundOff={roundOff}
    notes={notes}
    onClose={() => setShowPreview(false)}
  />
)}
    </main>
  );
}

    
    
