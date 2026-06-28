'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Download, Save, RotateCcw } from 'lucide-react';

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

interface BusinessInfo {
  name: string;
  address: string;
  email: string;
  phone: string;
}

interface ClientInfo {
  name: string;
  address: string;
  email: string;
}

interface InvoiceDetails {
  number: string;
  date: string;
  dueDate: string;
}

const STORAGE_KEY = 'invoice-generator-business-info';

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

export function InvoiceGenerator() {
  const [tab, setTab] = useState<'form' | 'preview'>('form');

  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>({
    name: '',
    address: '',
    email: '',
    phone: '',
  });

  const [clientInfo, setClientInfo] = useState<ClientInfo>({
    name: '',
    address: '',
    email: '',
  });

  const [invoiceDetails, setInvoiceDetails] = useState<InvoiceDetails>({
    number: 'INV-001',
    date: new Date().toISOString().slice(0, 10),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  });

  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: uid(), description: '', quantity: 1, price: 0 },
  ]);

  const [taxRate, setTaxRate] = useState('0');
  const [discount, setDiscount] = useState('0');
  const [notes, setNotes] = useState('');

  // Load saved business info on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setBusinessInfo(JSON.parse(saved));
    } catch {}
  }, []);

  const saveBusinessInfo = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(businessInfo));
  };

  const subtotal = lineItems.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const taxAmount = subtotal * (parseFloat(taxRate) / 100 || 0);
  const discountAmount = parseFloat(discount) || 0;
  const total = subtotal + taxAmount - discountAmount;

  const addLineItem = () => {
    setLineItems((prev) => [...prev, { id: uid(), description: '', quantity: 1, price: 0 }]);
  };

  const removeLineItem = (id: string) => {
    setLineItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    setLineItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleReset = () => {
    setClientInfo({ name: '', address: '', email: '' });
    setInvoiceDetails({
      number: 'INV-001',
      date: new Date().toISOString().slice(0, 10),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    });
    setLineItems([{ id: uid(), description: '', quantity: 1, price: 0 }]);
    setTaxRate('0');
    setDiscount('0');
    setNotes('');
  };

  const handleDownloadPDF = async () => {
    const { default: jsPDF } = await import('jspdf');
    const doc = new jsPDF();

    const margin = 20;
    let y = margin;

    // Title
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', 105, y, { align: 'center' });
    y += 12;

    // Invoice details row
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Invoice #: ${invoiceDetails.number}`, margin, y);
    doc.text(`Date: ${invoiceDetails.date}`, 105, y);
    doc.text(`Due: ${invoiceDetails.dueDate}`, 160, y);
    y += 14;

    // FROM / TO
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('FROM', margin, y);
    doc.text('TO', 110, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const fromLines = [businessInfo.name, businessInfo.address, businessInfo.email, businessInfo.phone].filter(Boolean);
    const toLines = [clientInfo.name, clientInfo.address, clientInfo.email].filter(Boolean);
    const maxLines = Math.max(fromLines.length, toLines.length);
    for (let i = 0; i < maxLines; i++) {
      if (fromLines[i]) doc.text(fromLines[i], margin, y);
      if (toLines[i]) doc.text(toLines[i], 110, y);
      y += 5;
    }
    y += 6;

    // Line items table header
    const colWidths = [90, 20, 30, 30];
    const colX = [margin, margin + 90, margin + 110, margin + 140];
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, y - 4, 170, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Description', colX[0], y);
    doc.text('Qty', colX[1], y);
    doc.text('Unit Price', colX[2], y);
    doc.text('Total', colX[3], y);
    y += 6;

    // Line items rows
    doc.setFont('helvetica', 'normal');
    lineItems.forEach((item, index) => {
      if (index % 2 === 1) {
        doc.setFillColor(250, 250, 250);
        doc.rect(margin, y - 4, 170, 7, 'F');
      }
      doc.text(item.description || '—', colX[0], y, { maxWidth: colWidths[0] - 2 });
      doc.text(String(item.quantity), colX[1], y);
      doc.text(`$${item.price.toFixed(2)}`, colX[2], y);
      doc.text(`$${(item.quantity * item.price).toFixed(2)}`, colX[3], y);
      y += 7;
    });

    y += 4;
    // Horizontal rule
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, 190, y);
    y += 6;

    // Totals (right-aligned block)
    const totalsX = 130;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Subtotal:', totalsX, y);
    doc.text(`$${subtotal.toFixed(2)}`, 185, y, { align: 'right' });
    y += 6;

    if (taxAmount !== 0) {
      doc.text(`Tax (${taxRate}%):`, totalsX, y);
      doc.text(`$${taxAmount.toFixed(2)}`, 185, y, { align: 'right' });
      y += 6;
    }

    if (discountAmount !== 0) {
      doc.text('Discount:', totalsX, y);
      doc.text(`-$${discountAmount.toFixed(2)}`, 185, y, { align: 'right' });
      y += 6;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Total:', totalsX, y);
    doc.text(`$${total.toFixed(2)}`, 185, y, { align: 'right' });
    y += 10;

    // Notes
    if (notes.trim()) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Notes:', margin, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      const noteLines = doc.splitTextToSize(notes, 170);
      doc.text(noteLines, margin, y);
    }

    doc.save(`invoice-${invoiceDetails.number}.pdf`);
  };

  const inputCls = 'w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent';
  const labelCls = 'text-xs font-medium text-foreground';

  return (
    <div className="w-full space-y-4">
      {/* Tab bar */}
      <div className="flex gap-1 border-b border-border">
        {(['form', 'preview'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
              tab === t
                ? 'border-b-2 border-accent text-accent'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t === 'form' ? 'Edit Form' : 'Preview'}
          </button>
        ))}
        <div className="ml-auto flex gap-2 pb-1">
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-accent text-accent-foreground rounded-md hover:bg-accent/90 transition-colors"
          >
            <Download size={13} />
            Download PDF
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
          >
            <RotateCcw size={13} />
            Clear
          </button>
        </div>
      </div>

      {tab === 'form' && (
        <div className="space-y-6">
          {/* Business Info */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Business Information</h3>
              <button
                onClick={saveBusinessInfo}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
              >
                <Save size={12} />
                Save for reuse
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className={labelCls}>Company Name</label>
                <input className={inputCls} value={businessInfo.name} onChange={(e) => setBusinessInfo({ ...businessInfo, name: e.target.value })} placeholder="Acme Corp" />
              </div>
              <div className="space-y-1">
                <label className={labelCls}>Phone</label>
                <input className={inputCls} value={businessInfo.phone} onChange={(e) => setBusinessInfo({ ...businessInfo, phone: e.target.value })} placeholder="555-1234" />
              </div>
              <div className="space-y-1">
                <label className={labelCls}>Address</label>
                <input className={inputCls} value={businessInfo.address} onChange={(e) => setBusinessInfo({ ...businessInfo, address: e.target.value })} placeholder="123 Main St" />
              </div>
              <div className="space-y-1">
                <label className={labelCls}>Email</label>
                <input className={inputCls} type="email" value={businessInfo.email} onChange={(e) => setBusinessInfo({ ...businessInfo, email: e.target.value })} placeholder="billing@acme.com" />
              </div>
            </div>
          </section>

          {/* Client Info */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Client Information</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className={labelCls}>Client Name</label>
                <input className={inputCls} value={clientInfo.name} onChange={(e) => setClientInfo({ ...clientInfo, name: e.target.value })} placeholder="John Doe" />
              </div>
              <div className="space-y-1">
                <label className={labelCls}>Email</label>
                <input className={inputCls} type="email" value={clientInfo.email} onChange={(e) => setClientInfo({ ...clientInfo, email: e.target.value })} placeholder="john@example.com" />
              </div>
              <div className="col-span-2 space-y-1">
                <label className={labelCls}>Address</label>
                <input className={inputCls} value={clientInfo.address} onChange={(e) => setClientInfo({ ...clientInfo, address: e.target.value })} placeholder="456 Oak Ave" />
              </div>
            </div>
          </section>

          {/* Invoice Details */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Invoice Details</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className={labelCls}>Invoice Number</label>
                <input className={inputCls} value={invoiceDetails.number} onChange={(e) => setInvoiceDetails({ ...invoiceDetails, number: e.target.value })} placeholder="INV-001" />
              </div>
              <div className="space-y-1">
                <label className={labelCls}>Date</label>
                <input className={inputCls} type="date" value={invoiceDetails.date} onChange={(e) => setInvoiceDetails({ ...invoiceDetails, date: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className={labelCls}>Due Date</label>
                <input className={inputCls} type="date" value={invoiceDetails.dueDate} onChange={(e) => setInvoiceDetails({ ...invoiceDetails, dueDate: e.target.value })} />
              </div>
            </div>
          </section>

          {/* Line Items */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Line Items</h3>
            <div className="space-y-2">
              <div className="grid grid-cols-[1fr_64px_96px_80px_32px] gap-2 text-xs font-medium text-muted-foreground px-1">
                <span>Description</span>
                <span>Qty</span>
                <span>Unit Price</span>
                <span>Total</span>
                <span />
              </div>
              {lineItems.map((item) => (
                <div key={item.id} className="grid grid-cols-[1fr_64px_96px_80px_32px] gap-2 items-center">
                  <input
                    className={inputCls}
                    value={item.description}
                    onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                    placeholder="Web Design"
                  />
                  <input
                    className={inputCls}
                    type="number"
                    min="0"
                    value={item.quantity}
                    onChange={(e) => updateLineItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                  />
                  <input
                    className={inputCls}
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.price}
                    onChange={(e) => updateLineItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                  />
                  <span className="text-sm text-foreground font-medium px-1">
                    ${(item.quantity * item.price).toFixed(2)}
                  </span>
                  <button
                    onClick={() => removeLineItem(item.id)}
                    disabled={lineItems.length === 1}
                    className="p-1 text-muted-foreground hover:text-destructive disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              <button
                onClick={addLineItem}
                className="flex items-center gap-1.5 text-xs text-accent hover:text-accent/80 font-medium transition-colors"
              >
                <Plus size={13} />
                Add Item
              </button>
            </div>
          </section>

          {/* Totals & Tax */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Totals</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className={labelCls}>Tax Rate (%)</label>
                <input className={inputCls} type="number" min="0" max="100" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} placeholder="0" />
              </div>
              <div className="space-y-1">
                <label className={labelCls}>Discount ($)</label>
                <input className={inputCls} type="number" min="0" step="0.01" value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="0.00" />
              </div>
            </div>
            <div className="p-3 bg-muted/50 rounded-md space-y-1 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {taxAmount !== 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Tax ({taxRate}%)</span>
                  <span>${taxAmount.toFixed(2)}</span>
                </div>
              )}
              {discountAmount !== 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Discount</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-foreground border-t border-border pt-1 mt-1">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </section>

          {/* Notes */}
          <section className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Notes</label>
            <textarea
              className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent resize-none"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Payment due within 30 days. Thank you for your business."
            />
          </section>
        </div>
      )}

      {tab === 'preview' && (
        <div className="border border-border rounded-lg p-6 bg-white text-zinc-900 text-sm space-y-6 font-sans">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-zinc-900">INVOICE</h2>
              <p className="text-xs text-zinc-500 mt-1">#{invoiceDetails.number}</p>
            </div>
            <div className="text-right text-xs text-zinc-600 space-y-0.5">
              <p>Date: {invoiceDetails.date}</p>
              <p>Due: {invoiceDetails.dueDate}</p>
            </div>
          </div>

          {/* From / To */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-bold text-zinc-500 uppercase mb-1">From</p>
              <p className="font-semibold">{businessInfo.name || '—'}</p>
              <p className="text-xs text-zinc-600">{businessInfo.address}</p>
              <p className="text-xs text-zinc-600">{businessInfo.email}</p>
              <p className="text-xs text-zinc-600">{businessInfo.phone}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-500 uppercase mb-1">To</p>
              <p className="font-semibold">{clientInfo.name || '—'}</p>
              <p className="text-xs text-zinc-600">{clientInfo.address}</p>
              <p className="text-xs text-zinc-600">{clientInfo.email}</p>
            </div>
          </div>

          {/* Line Items */}
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-zinc-100">
                <th className="text-left py-2 px-2 font-semibold">Description</th>
                <th className="text-right py-2 px-2 font-semibold">Qty</th>
                <th className="text-right py-2 px-2 font-semibold">Unit Price</th>
                <th className="text-right py-2 px-2 font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item, i) => (
                <tr key={item.id} className={i % 2 === 1 ? 'bg-zinc-50' : ''}>
                  <td className="py-1.5 px-2">{item.description || '—'}</td>
                  <td className="py-1.5 px-2 text-right">{item.quantity}</td>
                  <td className="py-1.5 px-2 text-right">${item.price.toFixed(2)}</td>
                  <td className="py-1.5 px-2 text-right">${(item.quantity * item.price).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-48 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-500">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {taxAmount !== 0 && (
                <div className="flex justify-between">
                  <span className="text-zinc-500">Tax ({taxRate}%)</span>
                  <span>${taxAmount.toFixed(2)}</span>
                </div>
              )}
              {discountAmount !== 0 && (
                <div className="flex justify-between">
                  <span className="text-zinc-500">Discount</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-sm border-t border-zinc-300 pt-1">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {notes && (
            <div className="border-t border-zinc-200 pt-4">
              <p className="text-xs font-semibold text-zinc-500 mb-1">Notes</p>
              <p className="text-xs text-zinc-700">{notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
