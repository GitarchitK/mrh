import React, { useState, useRef } from 'react';
import { Invoice, BusinessSettings } from '../../types';
import { formatDate, formatDateTime, formatPhoneNumber } from '../../lib/utils';
import { formatPaiseToINR } from '../../lib/money';
import {
  Printer,
  CheckCircle,
  AlertCircle,
  QrCode,
  ShieldCheck,
  Receipt,
  Smartphone,
  Phone,
  MessageSquare,
  Check,
  Copy,
  FileText,
  MapPin,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Button } from '../ui/Button';

interface CounterBillPrintProps {
  invoice: Invoice;
  settings: BusinessSettings;
  onClose?: () => void;
}

export const CounterBillPrint: React.FC<CounterBillPrintProps> = ({ invoice, settings, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [paperFormat, setPaperFormat] = useState<'a5' | 'a4'>('a5');
  const printContainerRef = useRef<HTMLDivElement>(null);

  const isPaidInFull = invoice.balanceDuePaise <= 0;
  const isPartial = invoice.amountPaidPaise > 0 && invoice.balanceDuePaise > 0;

  const shopName = settings.businessName || 'Mobile Repairing House';
  const ownerName = settings.ownerContactName || 'Debasish';
  const shopPhone = settings.phone || '+91 97327 89938';
  const shopAddress =
    settings.fullAddress ||
    'Bhajan Complex, 139, Barrackpore Trunk Road, Dunlop, Saket Nagar, Bonhooghly, Kolkata 700108';

  // Format WhatsApp share message
  const handleWhatsAppShare = () => {
    const rawPhone = (invoice.customerPhone || '').replace(/\D/g, '');
    const phoneWithCountry = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;

    const itemListText = invoice.items
      .map((it, idx) => `  ${idx + 1}. ${it.description} (x${it.quantity}) - ${formatPaiseToINR(it.totalPaise)}`)
      .join('\n');

    const msg = `*${shopName.toUpperCase()} • APPLE & SMARTPHONE CARE*
*Official Customer Bill & Service Receipt*
--------------------------------------------
*Invoice No:* ${invoice.invoiceNumber}
*Date:* ${formatDateTime(invoice.issuedAt)}
*Customer:* ${invoice.customerName}
${invoice.customerPhone ? `*Phone:* ${invoice.customerPhone}\n` : ''}${invoice.jobNumber ? `*Job Reference:* ${invoice.jobNumber}\n` : ''}
*Itemized Summary:*
${itemListText}
--------------------------------------------
*Subtotal:* ${formatPaiseToINR(invoice.subtotalPaise)}
${invoice.discountPaise > 0 ? `*Discount Applied:* -${formatPaiseToINR(invoice.discountPaise)}\n` : ''}${invoice.taxPaise > 0 ? `*GST / Tax:* ${formatPaiseToINR(invoice.taxPaise)}\n` : ''}*TOTAL AMOUNT:* ${formatPaiseToINR(invoice.totalPaise)}
*Amount Paid:* ${formatPaiseToINR(invoice.amountPaidPaise)}
*Balance Due:* ${formatPaiseToINR(invoice.balanceDuePaise)}
*Status:* ${isPaidInFull ? 'PAID IN FULL ✅' : isPartial ? 'PARTIALLY PAID ⚠️' : 'UNPAID ❌'}
--------------------------------------------
*Store Location:* ${shopAddress}
*Helpline / WhatsApp:* ${shopPhone} (${ownerName})
*Thank you for choosing ${shopName}!*`;

    const encodedMsg = encodeURIComponent(msg);
    const waUrl = phoneWithCountry
      ? `https://wa.me/${phoneWithCountry}?text=${encodedMsg}`
      : `https://wa.me/?text=${encodedMsg}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  // UPI Payment Link & QR Code
  const upiPayee = settings?.phone ? `${settings.phone.replace(/\D/g, '')}@upi` : '9732789938@upi';
  const totalRupees = (invoice.totalPaise / 100).toFixed(2);
  const upiUrl = `upi://pay?pa=${upiPayee}&pn=Mobile%20Repairing%20House&am=${totalRupees}&cu=INR&tn=Bill%20${invoice.invoiceNumber}`;
  const qrCodeImgSrc = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(upiUrl)}`;

  // Dedicated High-DPI Isolated Print Engine for Apple-Style Invoice
  const handleExactPrint = () => {
    if (!printContainerRef.current) {
      window.print();
      return;
    }

    const billHtml = printContainerRef.current.innerHTML;

    // Remove any previous print iframe
    const oldIframe = document.getElementById('pos-isolated-print-frame');
    if (oldIframe) oldIframe.remove();

    // Create invisible print iframe
    const iframe = document.createElement('iframe');
    iframe.id = 'pos-isolated-print-frame';
    iframe.style.position = 'fixed';
    iframe.style.top = '-9999px';
    iframe.style.left = '-9999px';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;

    const pageCss =
      paperFormat === 'a4'
        ? `@page { size: A4 portrait; margin: 8mm 10mm; } .apple-bill-container { max-width: 190mm !important; }`
        : `@page { size: A5 portrait; margin: 4mm 6mm; } .apple-bill-container { max-width: 138mm !important; }`;

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Invoice_${invoice.invoiceNumber}_Mobile_Repairing_House</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700;800&display=swap" rel="stylesheet">
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            ${pageCss}
            * {
              box-sizing: border-box;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            html, body {
              margin: 0;
              padding: 0;
              background: #ffffff !important;
              color: #09090b !important;
              font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", "Inter", sans-serif;
              width: 100%;
            }
            .apple-bill-container {
              width: 100%;
              margin: 0 auto;
            }
            .no-print {
              display: none !important;
            }
            tr {
              page-break-inside: avoid;
            }
          </style>
        </head>
        <body class="p-0">
          <div class="apple-bill-container">
            ${billHtml}
          </div>
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.warn('Iframe print error, falling back to window.print:', err);
        window.print();
      }
    }, 450);
  };

  const handleCopyBillNo = () => {
    navigator.clipboard.writeText(invoice.invoiceNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="printable-bill-root text-slate-900 font-sans">
      {/* Top Action Bar (Hidden in Print) */}
      <div className="no-print bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Receipt className="w-4 h-4 text-slate-900" />
              Official Tax Invoice & Payment Receipt
            </h2>
          </div>
          <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
            <span>
              Bill No: <strong className="font-mono text-slate-900 font-bold">{invoice.invoiceNumber}</strong>
            </span>
            <span>&bull;</span>
            <span>{invoice.customerName}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Paper Size Switcher */}
          <div className="flex items-center rounded-xl bg-slate-100 p-0.5 border border-slate-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setPaperFormat('a5')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                paperFormat === 'a5'
                  ? 'bg-white text-slate-950 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              A5 (Counter)
            </button>
            <button
              type="button"
              onClick={() => setPaperFormat('a4')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                paperFormat === 'a4'
                  ? 'bg-white text-slate-950 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              A4 (Standard)
            </button>
          </div>

          {/* Copy Bill Number */}
          <Button
            size="sm"
            variant="outline"
            className="text-xs"
            leftIcon={copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            onClick={handleCopyBillNo}
          >
            {copied ? 'Copied' : 'Copy No'}
          </Button>

          {/* WhatsApp Share */}
          <Button
            size="sm"
            variant="outline"
            className="text-xs bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
            leftIcon={<MessageSquare className="w-3.5 h-3.5 text-emerald-600" />}
            onClick={handleWhatsAppShare}
            title="Send formatted receipt on WhatsApp"
          >
            WhatsApp Bill
          </Button>

          {/* Print Button */}
          <Button
            size="sm"
            variant="primary"
            className="text-xs bg-slate-950 hover:bg-slate-900 text-white font-bold shadow-xs"
            leftIcon={<Printer className="w-3.5 h-3.5" />}
            onClick={handleExactPrint}
          >
            Print {paperFormat.toUpperCase()} Bill
          </Button>

          {onClose && (
            <Button size="sm" variant="outline" onClick={onClose} className="text-xs">
              Close
            </Button>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* APPLE ORIGINAL STYLE PRINTABLE BILL CONTAINER                  */}
      {/* ============================================================== */}
      <div
        ref={printContainerRef}
        className={`apple-bill-container mx-auto transition-all ${
          paperFormat === 'a4' ? 'max-w-[760px]' : 'max-w-[620px]'
        }`}
      >
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-xs text-slate-900 text-xs leading-relaxed font-sans">
          {/* Sleek Top Monochrome Header */}
          <div className="flex justify-between items-start gap-5 border-b border-slate-200 pb-4 mb-4">
            {/* Left: Apple-Style Brand Identity */}
            <div className="flex items-start gap-3.5">
              <img
                src="/images/logo.png"
                alt="Mobile Repairing House"
                className="w-12 h-12 sm:w-14 sm:h-14 object-contain rounded-2xl p-1 bg-white border border-slate-200/90 shadow-2xs shrink-0"
              />
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full bg-slate-900 text-white">
                    Specialist Care
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">&bull;</span>
                  <span className="text-[10px] text-slate-500 font-semibold hidden sm:inline">
                    Dunlop &bull; Kolkata
                  </span>
                </div>
                <h1 className="text-base sm:text-lg font-black text-slate-950 tracking-tight uppercase leading-tight">
                  {shopName}
                </h1>
                <p className="text-[10px] text-slate-500 font-medium leading-snug max-w-sm">
                  {shopAddress}
                </p>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-slate-600 font-semibold pt-0.5">
                  <span className="flex items-center gap-1 text-slate-900 font-bold">
                    <Phone className="w-3 h-3 text-slate-500" />
                    {shopPhone}
                  </span>
                  <span className="text-slate-300">&bull;</span>
                  <span>Contact: {ownerName}</span>
                </div>
              </div>
            </div>

            {/* Right: Apple Store Invoice Details */}
            <div className="text-right shrink-0 bg-slate-50/80 px-3 py-2.5 rounded-2xl border border-slate-200/70">
              <div className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                Official Tax Invoice
              </div>
              <div className="text-base sm:text-lg font-mono font-black text-slate-950 tracking-tight mt-0.5">
                {invoice.invoiceNumber}
              </div>

              {/* Status Badge */}
              <div className="mt-1 flex justify-end">
                {isPaidInFull ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-900 text-white font-mono text-[9px] font-bold uppercase tracking-wider">
                    <CheckCircle className="w-2.5 h-2.5 text-emerald-400" />
                    Paid in Full
                  </span>
                ) : isPartial ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-mono text-[9px] font-bold uppercase tracking-wider">
                    <AlertCircle className="w-2.5 h-2.5 text-amber-700" />
                    Partial Paid
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-900 border border-rose-300 font-mono text-[9px] font-bold uppercase tracking-wider">
                    <AlertCircle className="w-2.5 h-2.5 text-rose-700" />
                    Payment Due
                  </span>
                )}
              </div>

              <div className="text-[10px] text-slate-500 font-medium mt-1 font-mono">
                {formatDateTime(invoice.issuedAt)}
              </div>

              {invoice.jobNumber && (
                <div className="text-[10px] text-slate-700 font-mono font-bold mt-0.5">
                  Job Ref: <span className="text-slate-950">{invoice.jobNumber}</span>
                </div>
              )}
            </div>
          </div>

          {/* Customer & Transaction Metadata (Apple Store 2-Column Grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50/70 p-3 rounded-2xl border border-slate-200/70 mb-4 text-xs">
            {/* Customer Details */}
            <div className="space-y-0.5">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
                Billed To (Customer)
              </span>
              <div className="text-xs sm:text-sm font-bold text-slate-950">
                {invoice.customerName}
              </div>
              {invoice.customerPhone ? (
                <div className="text-[10px] font-semibold text-slate-600 flex items-center gap-1 font-mono">
                  <Smartphone className="w-3 h-3 text-slate-400" />
                  {formatPhoneNumber(invoice.customerPhone)}
                </div>
              ) : null}
              {invoice.notes && (
                <div className="text-[10px] text-slate-500 italic mt-1">
                  Note: &ldquo;{invoice.notes}&rdquo;
                </div>
              )}
            </div>

            {/* Transaction Details */}
            <div className="sm:text-right space-y-0.5 sm:border-l sm:border-slate-200 sm:pl-3">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
                Transaction Details
              </span>
              <div className="text-[11px] text-slate-700">
                Payment Mode:{' '}
                <strong className="text-slate-950 uppercase font-mono">
                  {invoice.paymentMethod || 'Cash'}
                </strong>
              </div>
              <div className="text-[10px] text-slate-500">
                Place of Supply: <strong className="text-slate-700">West Bengal (19)</strong>
              </div>
              <div className="text-[10px] text-slate-500">
                Store Specialist: <strong className="text-slate-700">{invoice.createdBy || ownerName}</strong>
              </div>
            </div>
          </div>

          {/* Itemized Table (Apple Store Clean Design) */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 mb-4">
            <table className="w-full text-left text-[11px] border-collapse">
              <thead>
                <tr className="bg-slate-950 text-white uppercase text-[9px] font-bold tracking-wider">
                  <th className="py-2 px-3 w-8 text-center font-mono">#</th>
                  <th className="py-2 px-3">Item & Description</th>
                  <th className="py-2 px-3 text-center w-20">Category</th>
                  <th className="py-2 px-3 text-center w-12 font-mono">Qty</th>
                  <th className="py-2 px-3 text-right w-24 font-mono">Rate (₹)</th>
                  <th className="py-2 px-3 text-right w-28 font-mono">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150">
                {invoice.items.map((item, index) => (
                  <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                    <td className="py-2 px-3 text-center text-slate-400 font-mono text-[10px]">
                      {String(index + 1).padStart(2, '0')}
                    </td>
                    <td className="py-2 px-3">
                      <div className="font-bold text-slate-950 text-[11px]">{item.description}</div>
                      <div className="text-[9px] text-slate-500 mt-0.5">
                        {item.type === 'labour'
                          ? 'Certified Workshop Diagnostic & Repair Service'
                          : item.type === 'part'
                          ? 'Genuine Grade Hardware Component'
                          : 'Original Grade Mobile Accessory'}
                      </div>
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase bg-slate-100 text-slate-700 border border-slate-200/80">
                        {item.type}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center font-mono font-bold text-slate-900">
                      {item.quantity}
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-slate-700">
                      {formatPaiseToINR(item.unitPricePaise)}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-slate-950">
                      {formatPaiseToINR(item.totalPaise)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bottom Financials & UPI Verification Section */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-start mb-4">
            {/* Left: Authentic Instant UPI Verification QR Box */}
            <div className="sm:col-span-5 bg-slate-50/80 p-3 rounded-2xl border border-slate-200 flex items-center gap-3">
              <img
                src={qrCodeImgSrc}
                alt="UPI Payment QR"
                className="w-16 h-16 object-contain rounded-xl bg-white p-1 border border-slate-200/90 shrink-0 shadow-2xs"
              />
              <div className="space-y-0.5">
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <QrCode className="w-3 h-3 text-slate-600" />
                  Instant UPI Pay & Verify
                </div>
                <div className="text-[10px] font-bold text-slate-900 leading-tight">
                  Google Pay &bull; PhonePe &bull; Paytm &bull; BHIM
                </div>
                <p className="text-[9px] text-slate-600 font-mono font-bold break-all pt-0.5">
                  {upiPayee}
                </p>
              </div>
            </div>

            {/* Right: Apple Store Financials Breakdown */}
            <div className="sm:col-span-7 bg-white p-3 rounded-2xl border border-slate-200 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600 text-[11px]">
                <span>Subtotal:</span>
                <span className="font-mono font-semibold text-slate-900">
                  {formatPaiseToINR(invoice.subtotalPaise)}
                </span>
              </div>

              {invoice.discountPaise > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium text-[11px]">
                  <span>Discount Applied:</span>
                  <span className="font-mono font-bold">-{formatPaiseToINR(invoice.discountPaise)}</span>
                </div>
              )}

              {invoice.taxPaise > 0 ? (
                <div className="flex justify-between text-slate-600 text-[11px]">
                  <span>GST / Tax:</span>
                  <span className="font-mono font-semibold text-slate-900">
                    {formatPaiseToINR(invoice.taxPaise)}
                  </span>
                </div>
              ) : (
                <div className="flex justify-between text-slate-400 text-[10px]">
                  <span>Tax Breakdown:</span>
                  <span className="font-mono">Nil GST / Composition</span>
                </div>
              )}

              {/* Net Payable Banner */}
              <div className="flex justify-between py-1.5 text-sm sm:text-base font-black text-slate-950 border-t border-b border-slate-950 mt-1">
                <span>Total Amount:</span>
                <span className="font-mono">{formatPaiseToINR(invoice.totalPaise)}</span>
              </div>

              <div className="flex justify-between text-[11px] text-slate-700 pt-0.5">
                <span>Amount Paid:</span>
                <span className="font-mono font-bold text-slate-900">
                  {formatPaiseToINR(invoice.amountPaidPaise)}
                </span>
              </div>

              <div className="flex justify-between text-[11px] font-bold bg-slate-100 px-2.5 py-1 rounded-xl">
                <span>Balance Due:</span>
                <span
                  className={`font-mono font-black ${
                    invoice.balanceDuePaise > 0 ? 'text-rose-600' : 'text-emerald-700'
                  }`}
                >
                  {formatPaiseToINR(invoice.balanceDuePaise)}
                </span>
              </div>
            </div>
          </div>

          {/* AppleCare-Style Limited Warranty & Service Terms */}
          <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-2.5 text-[9px] text-slate-600 leading-snug mb-4 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-slate-900 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold text-slate-900 uppercase tracking-wider block">
                Warranty & Store Terms of Service:
              </span>
              <p>
                <strong>1. Testing Warranty:</strong> 30 days testing warranty applies to eligible replacement displays and batteries. &bull;{' '}
                <strong>2. Counter Exchange:</strong> Boxed accessories carry 7 days exchange window with original invoice and packaging. &bull;{' '}
                <strong>3. Warranty Exclusions:</strong> Physical breakage, post-service liquid contact, or unauthorized third-party tampering voids all warranties.
              </p>
            </div>
          </div>

          {/* Footer & Authorized Signatory Block */}
          <div className="flex justify-between items-end pt-3 border-t border-slate-200 text-[10px]">
            {/* Left: Barcode Visual & Thank You */}
            <div className="space-y-1">
              {/* Simulated Authentic Barcode */}
              <div className="flex items-center gap-0.5 py-0.5">
                <div className="w-1 h-3.5 bg-slate-900" />
                <div className="w-0.5 h-3.5 bg-slate-900" />
                <div className="w-1.5 h-3.5 bg-slate-900" />
                <div className="w-0.5 h-3.5 bg-slate-900" />
                <div className="w-2 h-3.5 bg-slate-900" />
                <div className="w-1 h-3.5 bg-slate-900" />
                <div className="w-0.5 h-3.5 bg-slate-900" />
                <div className="w-1.5 h-3.5 bg-slate-900" />
                <div className="w-1 h-3.5 bg-slate-900" />
                <div className="w-0.5 h-3.5 bg-slate-900" />
                <div className="w-2 h-3.5 bg-slate-900" />
                <div className="w-1 h-3.5 bg-slate-900" />
                <div className="w-0.5 h-3.5 bg-slate-900" />
                <div className="w-1.5 h-3.5 bg-slate-900" />
              </div>
              <div className="font-mono text-[9px] text-slate-400">
                REF: {invoice.invoiceNumber} &bull; SECURE VERIFIED BILL
              </div>
              <div className="text-[9px] text-slate-500 font-medium">
                Thank you for choosing {shopName}! For enquiries: WhatsApp {shopPhone}
              </div>
            </div>

            {/* Right: Signature & Stamp */}
            <div className="text-center w-40">
              <div className="h-8 border-b border-dashed border-slate-300 mb-1 flex items-end justify-center">
                <span className="text-[10px] text-slate-500 italic font-mono font-medium">{ownerName}</span>
              </div>
              <span className="text-[9px] font-bold text-slate-900 uppercase tracking-widest block">
                Authorized Signatory
              </span>
              <span className="text-[8px] text-slate-400 block font-mono">
                {shopName}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
