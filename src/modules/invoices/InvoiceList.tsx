import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import Papa from 'papaparse';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Table from '../../components/Table';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { Link } from 'react-router-dom';
import { listInvoices, deleteInvoice } from '../../services/invoices.service';
import { addAuditLogEntry } from '../../services/auditlog.service';
import { formatDate } from '../../utils/formatDate';
import Invoices from './Invoices';
export default function InvoiceList() {
  // ...existing code...
  const handleExport = () => {
    const csv = Papa.unparse(invoices);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'invoices.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Exported to CSV');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      complete: (results: any) => {
        // TODO: send imported data to backend
        toast.success('Imported CSV');
        setTick((x) => x + 1);
      },
      error: () => toast.error('Import failed'),
    });
  };
  function downloadInvoicePDF(invoice: any) {
    const doc = new jsPDF();
    if (logo) {
      doc.addImage(logo, 'PNG', 10, 10, 40, 20);
      doc.setFontSize(18);
      doc.text('Invoice', 10, 40);
    } else {
      doc.setFontSize(22);
      doc.text('Invoice', 10, 20);
    }
    doc.setFontSize(12);
    doc.text(`Invoice No: ${invoice.invoiceNumber}`, 10, 50);
    doc.text(`Date: ${formatDate(invoice.date)}`, 10, 60);
    doc.text(`Customer: ${invoice.customerName}`, 10, 70);
    doc.text(`Subtotal: ₹${(invoice.subtotal ?? 0).toFixed(2)}`, 10, 80);
    doc.text(`Tax: ₹${(invoice.tax ?? 0).toFixed(2)}`, 10, 90);
    doc.text(`Total: ₹${(invoice.total ?? 0).toFixed(2)}`, 10, 100);
    doc.text(`Status: ${invoice.status}`, 10, 110);
    doc.save(`Invoice_${invoice.invoiceNumber}.pdf`);
    // @ts-ignore
    if (typeof window !== 'undefined' && window['toast']) window['toast'].success('Invoice PDF downloaded');
  }

  function handleDelete(id: string) {
    deleteInvoice(id)
      .then(() => {
        setTick((x) => x + 1);
        addAuditLogEntry({
          user: user?.name || 'Unknown',
          action: 'Delete Invoice',
          timestamp: new Date().toISOString(),
          details: `Invoice ID: ${id}`,
        });
        toast.success('Invoice deleted and logged');
      })
      .catch(() => {
        toast.error('Delete failed');
      });
  }
  const [logo, setLogo] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [tick, setTick] = useState(0);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const data = await listInvoices();
      setInvoices(data ?? []);
    }
    load();
  }, [tick]);

  // TODO: Replace with actual user context
  useEffect(() => {
    setUser({ role: 'admin' });
  }, []);

  const filtered = invoices.filter(
    (i) =>
      i.invoiceNumber.toLowerCase().includes(q.toLowerCase()) ||
      i.customerName.toLowerCase().includes(q.toLowerCase())
  );

  const totalSales = invoices.reduce((sum, i) => sum + (i.total ?? 0), 0).toFixed(2);
  const unpaid = invoices
    .filter((i) => i.status === 'UNPAID')
    .reduce((s, i) => s + (i.total ?? 0), 0)
    .toFixed(2);

  return (
    <div>
      <ToastContainer position="top-right" autoClose={3000} />
      <div style={{ marginBottom: 16 }}>
        <label className="btn">
          Upload Letterhead Logo
          <input
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={e => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => setLogo(reader.result as string);
              reader.readAsDataURL(file);
            }}
          />
        </label>
        {logo && <img src={logo} alt="Letterhead Logo" style={{ height: 40, marginLeft: 12 }} />}
      </div>
      <div className="toolbar">
        <h2>Invoices</h2>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Input
            placeholder="Search invoice/customer..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <Link to="/invoices/new" className="btn primary">
            New Invoice
          </Link>
          <Button onClick={handleExport}>Export CSV</Button>
          <label className="btn">
            Import CSV
            <input type="file" accept=".csv" style={{ display: 'none' }} onChange={handleImport} />
          </label>
        </div>
      </div>

      <div className="grid" style={{ marginBottom: 12 }}>
        <div className="stat">
          <div className="label">Total Sales</div>
          <div className="value">₹ {totalSales}</div>
        </div>
        <div className="stat">
          <div className="label">Unpaid</div>
          <div className="value">₹ {unpaid}</div>
        </div>
        <div className="stat">
          <div className="label">Invoices</div>
          <div className="value">{invoices.length}</div>
        </div>
      </div>

      <Table
        headers={[
          'No.',
          'Date',
          'Customer',
          'Subtotal',
          'Tax',
          'Total',
          'Status',
          'Actions',
          ]}
          rows={filtered.map((i) => [
            i.invoiceNumber,
            formatDate(i.date),
            i.customerName,
            (i.subtotal ?? 0).toFixed(2),
            (i.tax ?? 0).toFixed(2),
            (i.total ?? 0).toFixed(2),
            i.status,
            <div key={i.id} className="row">
              <Button
                variant="primary"
                onClick={() => downloadInvoicePDF(i)}
              >
                Download PDF
              </Button>
              {(user?.role === 'admin' || user?.role === 'manager') && (
                <Button
                  variant="danger"
                  onClick={() => handleDelete(i.id)}
                >
                  Delete
                </Button>
              )}
            </div>
          ])}
        />
      </div>
    );
  }
