# SPEC: Invoice Generator Tool
**File:** `docs/specs/tools/workplace/INVOICE_GENERATOR.md`
**Status:** Pending
**Slug:** `invoice-generator`
**Category:** workplace
**Subcategory**: business-tools

---

## SEO

- **Title:** `Invoice Generator — Create Professional Invoices | ToolForge`
- **Description:** `Generate professional invoices online for free. Add line items, tax, discounts, and download as PDF. Save business details for quick reuse.`
- **Primary Keyword:** invoice generator
- **Secondary Keywords:** free invoice generator, create invoice online, invoice maker, PDF invoice generator

---

## Functional Requirements

- [ ] Business information form (name, address, email, phone)
- [ ] Client information form (name, address, email)
- [ ] Line items (description, quantity, price)
- [ ] Add/remove line items dynamically
- [ ] Tax percentage input
- [ ] Discount input (amount or percentage)
- [ ] Notes/memo field
- [ ] Live invoice preview
- [ ] Automatic calculations (subtotal, tax, discount, total)
- [ ] Download as PDF using jsPDF + jspdf-autotable
- [ ] Save business details to localStorage
- [ ] Load saved business details on return
- [ ] Clear/reset button
- [ ] Invoice number and date fields

---

## Library

- jsPDF (for PDF generation)
- jspdf-autotable (for table formatting in PDF)

Install: `npm install jspdf jspdf-autotable`

---

## UI Layout

```
┌─────────────────────────────────────────┐
│  Invoice Generator                      │
├─────────────────────────────────────────┤
│  [Edit Form]  [Preview]  [Download PDF] │
├─────────────────────────────────────────┤
│  ┌──────────────────────────────────┐  │
│  │ Business Information              │  │
│  │ [Load Saved]  [Save]              │  │
│  │ Company: [Acme Corp]              │  │
│  │ Address: [123 Main St]            │  │
│  │ Email: [billing@acme.com]         │  │
│  │ Phone: [555-1234]                 │  │
│  └──────────────────────────────────┘  │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │ Client Information               │  │
│  │ Name: [John Doe]                 │  │
│  │ Address: [456 Oak Ave]           │  │
│  │ Email: [john@example.com]       │  │
│  └──────────────────────────────────┘  │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │ Invoice Details                  │  │
│  │ Number: [INV-001]                │  │
│  │ Date: [2024-01-15]               │  │
│  │ Due Date: [2024-02-15]           │  │
│  └──────────────────────────────────┘  │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │ Line Items                       │  │
│  │ [+ Add Item]                      │  │
│  │ Desc: [Web Design] Qty: [1]      │  │
│  │ Price: [$500] [Remove]           │  │
│  │ Desc: [Hosting] Qty: [12]         │  │
│  │ Price: [$50] [Remove]            │  │
│  └──────────────────────────────────┘  │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │ Totals                           │  │
│  │ Subtotal: $1,100.00              │  │
│  │ Tax %: [10] Tax: $110.00        │  │
│  │ Discount: [$0]                   │  │
│  │ Total: $1,210.00                 │  │
│  └──────────────────────────────────┘  │
│                                         │
│  Notes: [Payment due within 30 days]  │
│                                         │
│  [Generate Invoice]  [Clear]           │
└─────────────────────────────────────────┘
```

---

## Component State

```typescript
state: {
  businessInfo: {
    name: string;
    address: string;
    email: string;
    phone: string;
  };
  clientInfo: {
    name: string;
    address: string;
    email: string;
  };
  invoiceDetails: {
    number: string;
    date: string;
    dueDate: string;
  };
  lineItems: Array<{
    id: string;
    description: string;
    quantity: number;
    price: number;
  }>;
  taxRate: number;
  discount: number;
  notes: string;
  showPreview: boolean;
}
```

---

## PDF Generation Logic

```typescript
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function generatePDF(invoiceData: InvoiceData): void {
  const doc = new jsPDF();
  
  // Add business info
  doc.setFontSize(20);
  doc.text('INVOICE', 105, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.text(`Invoice #: ${invoiceData.invoiceDetails.number}`, 20, 40);
  doc.text(`Date: ${invoiceData.date}`, 20, 50);
  doc.text(`Due: ${invoiceData.dueDate}`, 20, 60);
  
  // Add from/to
  doc.text('FROM:', 20, 80);
  doc.text(invoiceData.businessInfo.name, 20, 90);
  doc.text(invoiceData.businessInfo.address, 20, 100);
  
  doc.text('TO:', 120, 80);
  doc.text(invoiceData.clientInfo.name, 120, 90);
  doc.text(invoiceData.clientInfo.address, 120, 100);
  
  // Add line items table
  autoTable(doc, {
    startY: 120,
    head: [['Description', 'Quantity', 'Price', 'Total']],
    body: invoiceData.lineItems.map(item => [
      item.description,
      item.quantity.toString(),
      `$${item.price.toFixed(2)}`,
      `$${(item.quantity * item.price).toFixed(2)}`
    ]),
  });
  
  // Add totals
  const finalY = (doc as any).lastAutoTable.finalY + 20;
  doc.text(`Subtotal: $${invoiceData.subtotal.toFixed(2)}`, 140, finalY);
  doc.text(`Tax (${invoiceData.taxRate}%): $${invoiceData.taxAmount.toFixed(2)}`, 140, finalY + 10);
  doc.text(`Discount: $${invoiceData.discount.toFixed(2)}`, 140, finalY + 20);
  doc.setFontSize(14);
  doc.text(`Total: $${invoiceData.total.toFixed(2)}`, 140, finalY + 35);
  
  // Add notes
  if (invoiceData.notes) {
    doc.setFontSize(10);
    doc.text('Notes:', 20, finalY + 60);
    doc.text(invoiceData.notes, 20, finalY + 70);
  }
  
  doc.save(`invoice-${invoiceData.invoiceDetails.number}.pdf`);
}
```

---

## localStorage Logic

```typescript
const BUSINESS_INFO_KEY = 'invoice-generator-business-info';

function saveBusinessInfo(businessInfo: BusinessInfo): void {
  localStorage.setItem(BUSINESS_INFO_KEY, JSON.stringify(businessInfo));
}

function loadBusinessInfo(): BusinessInfo | null {
  const saved = localStorage.getItem(BUSINESS_INFO_KEY);
  return saved ? JSON.parse(saved) : null;
}

function clearBusinessInfo(): void {
  localStorage.removeItem(BUSINESS_INFO_KEY);
}
```

---

## How to Use Content (for SEO section)

1. Enter your business information or load saved details
2. Fill in client information for the invoice
3. Set invoice number, date, and due date
4. Add line items with description, quantity, and price
5. Set tax percentage and any discounts
6. Add notes or payment terms
7. Preview the invoice in real-time
8. Download the invoice as a professional PDF
9. Save your business details for quick reuse on future invoices

---

## About Content (for SEO section)

Our Invoice Generator creates professional invoices instantly in your browser. Add your business and client information, line items with quantities and prices, tax rates, and discounts. The live preview shows exactly how your invoice will look, and one click downloads it as a polished PDF using jsPDF. Your business details are saved to localStorage, so returning users don't need to re-enter information. Perfect for freelancers, small businesses, and anyone who needs to generate invoices quickly without installing software. All invoice generation happens locally in your browser, ensuring your financial data remains private and secure.
