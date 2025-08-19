export interface InvoiceItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  customerId: string;
  customerName: string;
  items: InvoiceItem[];
  subtotal: number;
  gstRate: number;
  tax: number;
  total: number;
  status: 'PAID' | 'UNPAID';
}
