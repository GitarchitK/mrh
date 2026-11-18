import React, { useState, useRef } from 'react';
import { Invoice, BusinessSettings } from '../../types';
import { formatDate, formatDateTime, formatPhoneNumber } from '../../lib/utils';
import { formatPaiseToINR } from '../../lib/money';
import {
  Printer,
  Share2,
  CheckCircle,
  AlertCircle,
  QrCode,
  ShieldCheck,
  Receipt,
  Smartphone,
  Phone,
  MessageSquare,
  Sparkles,
  Check,
  Copy,
} from 'lucide-react';
import { Button } from '../ui/Button';

interface CounterBillPrintProps {
  invoice: Invoice;
  settings: BusinessSettings;
  onClose?: () => void;
}

export const CounterBillPrint: React.FC<CounterBillPrintProps> = ({ invoice, settings, onClose }) => {
  const [printFormat, setPrintFormat] = useState<'standard' | 'thermal'>('standard');
  const [copied, setCopied] = useState(false);
  const printContainerRef = useRef<HTMLDivElement>(null);

  const isPaidInFull = invoice.balanceDuePaise <= 0;
  const isPartial = invoice.amountPaidPaise > 0 && invoice.balanceDuePaise > 0;

  const shopName = settings.businessName || 'Mobile Repairing House';
  const ownerName = settings.ownerContactName || 'Debasish';
  const shopPhone = settings.phone || '+91 97327 89938';
  const shopAddress =
    settings.fullAddress ||
    'Bhajan Complex, 139, Barrackpore Trunk Road, Dunlop, Saket Nagar, Bonhooghly, Kolkata 700108';

  // Format WhatsApp message
  const handleWhatsAppShare = () => {
    const cleanPhone = invoice.customerPhone.replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

    const itemListText = invoice.items
      .map((it, idx) => `${idx + 1}. ${it.description} (x${it.quantity}) - ${formatPaiseToINR(it.totalPaise)}`)
      .join('\n');

    const msg = `*${shopName.toUpperCase()} - DUNLOP, KOLKATA*
*Official Customer Bill & Payment Receipt*
---------------------------------------
*Bill Number:* ${invoice.invoiceNumber}
*Date:* ${formatDate(invoice.issuedAt)}
*Customer:* ${invoice.customerName}
${invoice.jobNumber ? `*Job Reference:* ${invoice.jobNumber}\n` : ''}
*Billed Items:*
${itemListText}
---------------------------------------
*Subtotal:* ${formatPaiseToINR(invoice.subtotalPaise)}
${invoice.discountPaise > 0 ? `*Discount Applied:* -${formatPaiseToINR(invoice.discountPaise)}\n` : ''}${invoice.taxPaise > 0 ? `*GST / Tax:* ${formatPaiseToINR(invoice.taxPaise)}\n` : ''}*TOTAL AMOUNT:* ${formatPaiseToINR(invoice.totalPaise)}
*Amount Paid:* ${formatPaiseToINR(invoice.amountPaidPaise)}
*Balance Due:* ${formatPaiseToINR(invoice.balanceDuePaise)}
*Payment Status:* ${isPaidInFull ? 'PAID IN FULL ✅' : isPartial ? 'PARTIALLY PAID ⚠️' : 'UNPAID ❌'}
---------------------------------------
*Store Address:* ${shopAddress}
*Helpline / WhatsApp:* ${shopPhone} (${ownerName})
Thank you for trusting ${shopName}!`;

    const encodedMsg = encodeURIComponent(msg);
    const waUrl = `https://wa.me/${phoneWithCountry}?text=${encodedMsg}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  // UPI Payment Link & QR Code
  const upiPayee = '9732789938@upi';
  const totalRupees = (invoice.totalPaise / 100).toFixed(2);
  const upiUrl = `upi://pay?pa=${upiPayee}&pn=Mobile%20Repairing%20House&am=${totalRupees}&cu=INR&tn=Bill%20${invoice.invoiceNumber}`;
  const qrCodeImgSrc = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(upiUrl)}`;

  // Dedicated Isolated Print Engine (Prints ONLY the styled bill in its exact design, NOT the browser page)
  const handleExactPrint = () => {
    if (!printContainerRef.current) {
      window.print();
      return;
    }

    const billHtml = printContainerRef.current.innerHTML;
    const isThermal = printFormat === 'thermal';

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

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Bill_${invoice.invoiceNumber}_${shopName.replace(/\s+/g, '_')}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700;800&display=swap" rel="stylesheet">
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @page {
              size: ${isThermal ? '80mm auto' : 'A4 portrait'};
              margin: ${isThermal ? '2mm' : '8mm'};
            }
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
              color: #0f172a !important;
              font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
            }
            .no-print {
              display: none !important;
            }
          </style>
        </head>
        <body class="p-2 sm:p-4">
          <div class="${isThermal ? 'max-w-[340px]' : 'max-w-3xl'} mx-auto">
            ${billHtml}
          </div>
        </body>
      </html>
    `);
    doc.close();

    // Wait for styles and QR images to load, then trigger exact print
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.warn('Iframe print error, falling back to window.print:', err);
        window.print();
      }
    }, 500);
  };

  const handleCopyBillNo = () => {
    navigator.clipboard.writeText(invoice.invoiceNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="printable-bill-root text-slate-900 font-sans">
      {/* Top Action & Format Bar (Hidden in Print) */}
      <div className="no-print bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Receipt className="w-4 h-4 text-brand-orange" />
              Customer Bill & Payment Receipt
            </h2>
          </div>
          <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
            <span>
              Bill No: <strong className="font-mono text-slate-800">{invoice.invoiceNumber}</strong>
            </span>
            <span>&bull;</span>
            <span>{invoice.customerName}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Format Selector */}
          <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setPrintFormat('standard')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                printFormat === 'standard'
                  ? 'bg-white text-brand-navy shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Standard A4
            </button>
            <button
              type="button"
              onClick={() => setPrintFormat('thermal')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                printFormat === 'thermal'
                  ? 'bg-white text-brand-navy shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Thermal Slip (80mm)
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

          {/* Exact Modern Print Button */}
          <Button
            size="sm"
            variant="primary"
            className="text-xs bg-brand-navy hover:bg-brand-navy-dark text-white font-bold"
            leftIcon={<Printer className="w-3.5 h-3.5" />}
            onClick={handleExactPrint}
          >
            Print Receipt
          </Button>

          {onClose && (
            <Button size="sm" variant="outline" onClick={onClose} className="text-xs">
              Close
            </Button>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* PRINTABLE BILL CONTAINER (CAPTURED BY EXACT PRINT ENGINE)      */}
      {/* ============================================================== */}
      <div ref={printContainerRef}>
        {printFormat === 'standard' ? (
          /* ============================================================== */
          /* 1. MODERN A4 TAX INVOICE & RECEIPT                             */
          /* ============================================================== */
          <div className="print-content bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-lg text-slate-800 text-xs leading-relaxed max-w-3xl mx-auto">
            {/* Top Accent Gradient Bar */}
            <div className="h-2 w-full bg-gradient-to-r from-brand-orange via-amber-500 to-brand-navy rounded-full mb-8" />

            {/* Header: Store Branding & Unique Bill Badge */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b-2 border-slate-900/10 pb-6 mb-6">
              {/* Left: Store Branding */}
              <div className="flex items-start gap-4">
                <div className="relative shrink-0">
                  <img
                    src="/images/logo.png"
                    alt="Mobile Repairing House Logo"
                    className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-2xl p-1 bg-white border border-slate-200 shadow-sm"
                  />
                </div>
                <div>
                  <div className="inline-block px-2.5 py-0.5 rounded-full bg-slate-100 text-brand-navy font-bold text-[10px] uppercase tracking-wider mb-1 border border-slate-200">
                    Smartphone Care & Accessories Center
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
                    {shopName}
                  </h1>
                  <p className="text-[11px] text-slate-600 font-medium leading-snug max-w-sm mt-0.5">
                    {shopAddress}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-semibold text-slate-700 mt-2">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-brand-orange" />
                      {shopPhone}
                    </span>
                    <span>&bull;</span>
                    <span className="text-slate-600">Contact: {ownerName}</span>
                    <span>&bull;</span>
                    <span className="text-slate-500 font-mono text-[10px]">Plus Code: M92H+Q4</span>
                  </div>
                </div>
              </div>

              {/* Right: Unique Bill Badge with Barcode Visual */}
              <div className="sm:text-right shrink-0 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 w-full sm:w-auto">
                <div className="text-[10px] font-black uppercase tracking-wider text-brand-orange">
                  Tax Invoice & Cash Receipt
                </div>
                <div className="text-lg sm:text-xl font-mono font-black text-slate-900 mt-0.5 tracking-tight">
                  {invoice.invoiceNumber}
                </div>

                {/* Simulated Barcode Lines */}
                <div className="flex justify-end items-center gap-0.5 py-1.5 my-1 border-y border-dashed border-slate-200">
                  <div className="w-1 h-5 bg-slate-800" />
                  <div className="w-0.5 h-5 bg-slate-800" />
                  <div className="w-1.5 h-5 bg-slate-800" />
                  <div className="w-0.5 h-5 bg-slate-800" />
                  <div className="w-2 h-5 bg-slate-800" />
                  <div className="w-1 h-5 bg-slate-800" />
                  <div className="w-0.5 h-5 bg-slate-800" />
                  <div className="w-1.5 h-5 bg-slate-800" />
                  <div className="w-1 h-5 bg-slate-800" />
                  <div className="w-0.5 h-5 bg-slate-800" />
                  <div className="w-2 h-5 bg-slate-800" />
                  <div className="w-1 h-5 bg-slate-800" />
                  <div className="w-1.5 h-5 bg-slate-800" />
                  <div className="w-0.5 h-5 bg-slate-800" />
                  <div className="w-1 h-5 bg-slate-800" />
                </div>

                <div className="text-[11px] text-slate-500">
                  Issued: <strong className="text-slate-800 font-semibold">{formatDateTime(invoice.issuedAt)}</strong>
                </div>
                {invoice.jobNumber && (
                  <div className="text-[11px] text-slate-600 mt-0.5 font-mono">
                    Repair Job: <strong className="text-slate-900">{invoice.jobNumber}</strong>
                  </div>
                )}
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Biller: <span className="font-medium text-slate-600">{invoice.createdBy || ownerName}</span>
                </div>
              </div>
            </div>

            {/* Customer Information & Verified Status Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gradient-to-br from-slate-50 to-slate-100/50 p-4 sm:p-5 rounded-2xl border border-slate-200 mb-6">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Billed To Customer
                </span>
                <div className="text-sm sm:text-base font-black text-slate-900">
                  {invoice.customerName}
                </div>
                <div className="text-xs font-semibold text-slate-700 mt-0.5 flex items-center gap-1">
                  <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                  {formatPhoneNumber(invoice.customerPhone)}
                </div>
                {invoice.notes && (
                  <div className="text-[11px] text-slate-500 mt-1 italic">
                    Note: &ldquo;{invoice.notes}&rdquo;
                  </div>
                )}
              </div>

              <div className="sm:text-right flex flex-col sm:items-end justify-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Settlement Status
                </span>
                <div>
                  {isPaidInFull ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300 font-black text-xs uppercase tracking-wide shadow-2xs">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      Paid in Full &bull; Verified
                    </span>
                  ) : isPartial ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100 text-amber-800 border border-amber-300 font-black text-xs uppercase tracking-wide">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      Partially Paid
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-100 text-rose-800 border border-rose-300 font-black text-xs uppercase tracking-wide">
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                      Payment Due
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Tender Mode:{' '}
                  <strong className="text-slate-800 capitalize">{invoice.paymentMethod || 'Cash / Counter'}</strong>
                </div>
              </div>
            </div>

            {/* Itemized Products & Services Table */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 mb-6">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white uppercase text-[10px] font-bold tracking-wider">
                    <th className="py-3 px-3 w-10 text-center">#</th>
                    <th className="py-3 px-4">Item & Service Description</th>
                    <th className="py-3 px-3 text-center">Category</th>
                    <th className="py-3 px-3 text-center">Qty</th>
                    <th className="py-3 px-4 text-right">Unit Rate</th>
                    <th className="py-3 px-4 text-right">Total Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoice.items.map((item, index) => (
                    <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                      <td className="py-3 px-3 text-center text-slate-400 font-mono text-[11px]">{index + 1}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{item.description}</td>
                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-slate-100 text-slate-600 border border-slate-200">
                          {item.type}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-slate-800">{item.quantity}</td>
                      <td className="py-3 px-4 text-right font-mono text-slate-700">
                        {formatPaiseToINR(item.unitPricePaise)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                        {formatPaiseToINR(item.totalPaise)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary, UPI QR & Math Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-start mb-6">
              {/* Dynamic Live UPI QR Box (Left 5 Cols) */}
              <div className="sm:col-span-5 bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center gap-3.5">
                <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-2xs shrink-0">
                  <img src={qrCodeImgSrc} alt="UPI Payment QR" className="w-24 h-24 object-contain" />
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <QrCode className="w-3.5 h-3.5 text-brand-orange" />
                    Instant UPI QR
                  </div>
                  <div className="text-[11px] font-bold text-slate-800">Scan via GPay / PhonePe / Paytm</div>
                  <p className="text-[10px] text-slate-500 leading-snug">
                    VPA: <strong className="font-mono text-slate-700 font-semibold">{upiPayee}</strong>
                  </p>
                </div>
              </div>

              {/* Totals Summary Box (Right 7 Cols) */}
              <div className="sm:col-span-7 bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex justify-between py-1 text-slate-600 border-b border-slate-100">
                  <span>Subtotal:</span>
                  <span className="font-mono font-medium text-slate-900">{formatPaiseToINR(invoice.subtotalPaise)}</span>
                </div>

                {invoice.discountPaise > 0 && (
                  <div className="flex justify-between py-1 text-emerald-700 border-b border-slate-100 font-medium">
                    <span>Discount Applied:</span>
                    <span className="font-mono">-{formatPaiseToINR(invoice.discountPaise)}</span>
                  </div>
                )}

                {invoice.taxPaise > 0 && (
                  <div className="flex justify-between py-1 text-slate-600 border-b border-slate-100">
                    <span>GST / Tax:</span>
                    <span className="font-mono">{formatPaiseToINR(invoice.taxPaise)}</span>
                  </div>
                )}

                <div className="flex justify-between py-2 text-base font-black text-slate-900 border-b-2 border-slate-900">
                  <span>Net Grand Total:</span>
                  <span className="font-mono text-brand-orange">{formatPaiseToINR(invoice.totalPaise)}</span>
                </div>

                <div className="flex justify-between py-1 text-slate-700 text-xs">
                  <span>Amount Paid:</span>
                  <span className="font-mono font-bold text-emerald-700">
                    {formatPaiseToINR(invoice.amountPaidPaise)}
                  </span>
                </div>

                <div className="flex justify-between py-1.5 text-xs font-bold bg-slate-100 px-3 rounded-xl">
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

            {/* Official Warranty & Policy Terms */}
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 text-[10px] text-amber-900 leading-relaxed mb-8 flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold uppercase tracking-wider block mb-0.5">Official Warranty Policy:</span>
                <p>
                  1. Testing warranty of 30 days applies to eligible display and battery replacement spares.
                  <br />
                  2. Accessories in original sealed packaging may be exchanged within 7 days with this bill.
                  <br />
                  3. Physical breakage, liquid exposure, or unauthorized dismantling voids warranty.
                </p>
              </div>
            </div>

            {/* Footer & Signature Line */}
            <div className="flex justify-between items-end pt-4 border-t border-slate-200">
              <div>
                <div className="text-xs font-black text-slate-900 uppercase">{shopName}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Trusted Smartphone Care & Spares &bull; Dunlop, Kolkata
                </div>
              </div>

              <div className="text-center w-48">
                <div className="h-12 border-b border-dashed border-slate-400 mb-1 flex items-end justify-center">
                  <span className="text-[10px] text-slate-400 italic font-mono mb-1">{ownerName}</span>
                </div>
                <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                  Authorized Signatory
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* ============================================================== */
          /* 2. THERMAL POS ROLL SLIP (80mm) FORMAT                         */
          /* ============================================================== */
          <div className="print-thermal-content bg-white border border-slate-300 rounded-xl p-4 max-w-[340px] mx-auto shadow-md text-slate-900 font-mono text-[11px] leading-tight">
            {/* Store Header */}
            <div className="text-center space-y-1 border-b border-dashed border-slate-400 pb-3 mb-3">
              <img src="/images/logo.png" alt="Logo" className="w-12 h-12 object-contain mx-auto mb-1" />
              <div className="font-black text-sm uppercase">{shopName}</div>
              <div className="text-[10px] text-slate-600">{shopAddress}</div>
              <div className="text-[10px] font-bold">
                Phone / WhatsApp: {shopPhone} ({ownerName})
              </div>
            </div>

            {/* Bill Meta */}
            <div className="space-y-1 border-b border-dashed border-slate-400 pb-2 mb-2 text-[10px]">
              <div className="flex justify-between">
                <span>BILL NO:</span>
                <span className="font-bold text-xs">{invoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>DATE:</span>
                <span>{formatDateTime(invoice.issuedAt)}</span>
              </div>
              <div className="flex justify-between">
                <span>CUSTOMER:</span>
                <span className="font-bold uppercase truncate max-w-[170px]">{invoice.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span>PHONE:</span>
                <span>{formatPhoneNumber(invoice.customerPhone)}</span>
              </div>
              {invoice.jobNumber && (
                <div className="flex justify-between">
                  <span>JOB REF:</span>
                  <span className="font-bold">{invoice.jobNumber}</span>
                </div>
              )}
            </div>

            {/* Items Table */}
            <table className="w-full text-left border-collapse mb-2 text-[10px]">
              <thead>
                <tr className="border-b border-slate-400">
                  <th className="py-1">ITEM</th>
                  <th className="py-1 text-center">QTY</th>
                  <th className="py-1 text-right">AMT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dotted divide-slate-300">
                {invoice.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-1 pr-1">
                      <div className="font-bold">{item.description}</div>
                      <div className="text-[9px] text-slate-500">@{formatPaiseToINR(item.unitPricePaise)}</div>
                    </td>
                    <td className="py-1 text-center font-bold">{item.quantity}</td>
                    <td className="py-1 text-right font-bold">{formatPaiseToINR(item.totalPaise)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Financials Breakdown */}
            <div className="border-t border-dashed border-slate-400 pt-2 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatPaiseToINR(invoice.subtotalPaise)}</span>
              </div>
              {invoice.discountPaise > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Discount:</span>
                  <span>-{formatPaiseToINR(invoice.discountPaise)}</span>
                </div>
              )}
              {invoice.taxPaise > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Tax/GST:</span>
                  <span>{formatPaiseToINR(invoice.taxPaise)}</span>
                </div>
              )}
              <div className="flex justify-between font-black text-sm border-t border-b border-slate-800 py-1">
                <span>TOTAL:</span>
                <span>{formatPaiseToINR(invoice.totalPaise)}</span>
              </div>
              <div className="flex justify-between">
                <span>PAID:</span>
                <span className="font-bold">{formatPaiseToINR(invoice.amountPaidPaise)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>BALANCE DUE:</span>
                <span className={invoice.balanceDuePaise > 0 ? 'text-rose-600' : 'text-emerald-700'}>
                  {formatPaiseToINR(invoice.balanceDuePaise)}
                </span>
              </div>
            </div>

            {/* UPI QR & Barcode */}
            <div className="my-3 text-center border-t border-dashed border-slate-400 pt-2">
              <img src={qrCodeImgSrc} alt="UPI QR" className="w-20 h-20 mx-auto object-contain mb-1" />
              <div className="text-[9px] text-slate-500 font-sans">Scan to Pay via UPI ({upiPayee})</div>
            </div>

            {/* Footer */}
            <div className="text-center text-[9px] text-slate-600 pt-1 border-t border-dashed border-slate-400 space-y-1">
              <div className="font-bold uppercase text-[10px] text-slate-800">*** THANK YOU FOR VISITING ***</div>
              <div>{shopName}</div>
              <div>Goods exchangeable within 7 days with bill</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
