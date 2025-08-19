// src/pages/ReportsPage.tsx
import React, { useEffect, useState } from 'react';
import { getSalesSummary, SalesSummary } from '../services/reports.service';

export default function ReportsPage() {
  const [data, setData] = useState<SalesSummary | null>(null);
  useEffect(() => {
    getSalesSummary().then(setData);
  }, []);
  if (!data) return <div>Loading...</div>;
  return (
    <div>
      Total sales: {data.totalSales} | Invoices: {data.count}
    </div>
  );
}
