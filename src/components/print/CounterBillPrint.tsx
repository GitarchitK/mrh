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
} from 'lucide-react';
import { Button } from '../ui/Button';

interface CounterBillPrintProps {
  invoice: Invoice;
  settings: BusinessSettings;
  onClose?: () => void;
}

export const CounterBillPrint: React.FC<CounterBillPrintProps> = ({ invoice, settings, onClose }) => {
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
${invoice.jobNumber ? `*Job Reference:* ${invoice.jobNumber}\n` : ''}*Billed Items:*
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

  // Dedicated Isolated Print Engine for A5 Paper
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

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Bill_${invoice.invoiceNumber}_Mobile_Repairing_House</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700;800&display=swap" rel="stylesheet">
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @page {
              size: A5 portrait;
              margin: 4mm 6mm;
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
              width: 100%;
            }
            .a5-print-wrapper {
              width: 100%;
              max-width: 138mm;
              margin: 0 auto;
            }
            .no-print {
              display: none !important;
            }
            /* Avoid splitting table rows across page if table grows */
            tr {
              page-break-inside: avoid;
            }
          </style>
        </head>
        <body class="p-0">
          <div class="a5-print-wrapper">
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
      {/* Top Action Bar (Hidden in Print) */}
      <div className="no-print bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
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
          {/* A5 Format Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700">
            <FileText className="w-3.5 h-3.5 text-brand-orange" />
            <span>A5 Paper (148 × 210 mm)</span>
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

          {/* Exact Modern A5 Print Button */}
          <Button
            size="sm"
            variant="primary"
            className="text-xs bg-brand-navy hover:bg-brand-navy-dark text-white font-bold shadow-xs"
            leftIcon={<Printer className="w-3.5 h-3.5" />}
            onClick={handleExactPrint}
          >
            Print A5 Bill
          </Button>

          {onClose && (
            <Button size="sm" variant="outline" onClick={onClose} className="text-xs">
              Close
            </Button>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* A5 PRINTABLE BILL CONTAINER                                    */}
      {/* Specifically sized and styled for A5 portrait (148mm × 210mm)   */}
      {/* ============================================================== */}
      <div ref={printContainerRef} className="a5-print-wrapper max-w-[620px] mx-auto">
        <div className="print-content bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm text-slate-800 text-xs leading-tight">
          {/* Top Accent Gradient Bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-brand-orange via-amber-500 to-brand-navy rounded-full mb-3.5" />

          {/* Header: Store Branding & Unique Bill Badge */}
          <div className="flex justify-between items-start gap-4 border-b border-slate-200 pb-3 mb-3">
            {/* Left: Store Branding */}
            <div className="flex items-start gap-3">
              <img
                src="/images/logo.png"
                alt="Mobile Repairing House Logo"
                className="w-12 h-12 object-contain rounded-xl p-0.5 bg-white border border-slate-200 shadow-2xs shrink-0"
              />
              <div>
                <span className="inline-block px-2 py-0.5 rounded-full bg-slate-100 text-brand-navy font-bold text-[9px] uppercase tracking-wider mb-0.5 border border-slate-200">
                  Smartphone Care & Accessories Center
                </span>
                <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight uppercase leading-tight">
                  {shopName}
                </h1>
                <p className="text-[10px] text-slate-600 font-medium leading-snug mt-0.5 max-w-xs">
                  {shopAddress}
                </p>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] font-semibold text-slate-700 mt-1">
                  <span className="flex items-center gap-0.5">
                    <Phone className="w-2.5 h-2.5 text-brand-orange" />
                    {shopPhone}
                  </span>
                  <span>&bull;</span>
                  <span className="text-slate-600">Contact: {ownerName}</span>
                </div>
              </div>
            </div>

            {/* Right: Unique Bill Badge with Barcode Visual */}
            <div className="text-right shrink-0 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
              <div className="text-[9px] font-black uppercase tracking-wider text-brand-orange">
                A5 Tax Invoice / Bill
              </div>
              <div className="text-base font-mono font-black text-slate-900 tracking-tight mt-0.5">
                {invoice.invoiceNumber}
              </div>

              {/* Simulated Barcode */}
              <div className="flex justify-end items-center gap-0.5 py-1 my-0.5 border-y border-dashed border-slate-200">
                <div className="w-1 h-3.5 bg-slate-800" />
                <div className="w-0.5 h-3.5 bg-slate-800" />
                <div className="w-1.5 h-3.5 bg-slate-800" />
                <div className="w-0.5 h-3.5 bg-slate-800" />
                <div className="w-2 h-3.5 bg-slate-800" />
                <div className="w-1 h-3.5 bg-slate-800" />
                <div className="w-0.5 h-3.5 bg-slate-800" />
                <div className="w-1.5 h-3.5 bg-slate-800" />
                <div className="w-1 h-3.5 bg-slate-800" />
                <div className="w-0.5 h-3.5 bg-slate-800" />
                <div className="w-1.5 h-3.5 bg-slate-800" />
              </div>

              <div className="text-[10px] text-slate-600 font-medium">
                {formatDateTime(invoice.issuedAt)}
              </div>
              {invoice.jobNumber && (
                <div className="text-[10px] text-slate-700 font-mono mt-0.5">
                  Job Ref: <strong className="text-slate-900">{invoice.jobNumber}</strong>
                </div>
              )}
            </div>
          </div>

          {/* Customer & Settlement Bar */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50/90 p-2.5 rounded-xl border border-slate-200 mb-3 text-xs">
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                Billed To Customer
              </span>
              <div className="text-xs font-black text-slate-900 mt-0.5">
                {invoice.customerName}
              </div>
              <div className="text-[10px] font-semibold text-slate-600 flex items-center gap-1 mt-0.5">
                <Smartphone className="w-3 h-3 text-slate-400" />
                {formatPhoneNumber(invoice.customerPhone)}
              </div>
              {invoice.notes && (
                <div className="text-[9px] text-slate-500 italic mt-0.5">
                  Note: &ldquo;{invoice.notes}&rdquo;
                </div>
              )}
            </div>

            <div className="text-right flex flex-col items-end justify-center">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                Payment Status
              </span>
              <div>
                {isPaidInFull ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-[10px] uppercase">
                    <CheckCircle className="w-3 h-3 text-emerald-600" />
                    Paid in Full
                  </span>
                ) : isPartial ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-300 font-bold text-[10px] uppercase">
                    <AlertCircle className="w-3 h-3 text-amber-600" />
                    Partially Paid
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-rose-100 text-rose-800 border border-rose-300 font-bold text-[10px] uppercase">
                    <AlertCircle className="w-3 h-3 text-rose-600" />
                    Payment Due
                  </span>
                )}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Mode: <strong className="text-slate-800 capitalize">{invoice.paymentMethod || 'Cash'}</strong>
              </div>
            </div>
          </div>

          {/* Itemized Products & Services Table */}
          <div className="overflow-hidden rounded-xl border border-slate-200 mb-3">
            <table className="w-full text-left text-[11px] border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white uppercase text-[9px] font-bold tracking-wider">
                  <th className="py-1.5 px-2 w-8 text-center">#</th>
                  <th className="py-1.5 px-2">Description</th>
                  <th className="py-1.5 px-2 text-center w-16">Type</th>
                  <th className="py-1.5 px-2 text-center w-10">Qty</th>
                  <th className="py-1.5 px-2 text-right w-20">Rate</th>
                  <th className="py-1.5 px-2 text-right w-24">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoice.items.map((item, index) => (
                  <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                    <td className="py-1.5 px-2 text-center text-slate-400 font-mono text-[10px]">{index + 1}</td>
                    <td className="py-1.5 px-2 font-semibold text-slate-900">{item.description}</td>
                    <td className="py-1.5 px-2 text-center">
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold uppercase bg-slate-100 text-slate-600 border border-slate-200">
                        {item.type}
                      </span>
                    </td>
                    <td className="py-1.5 px-2 text-center font-bold text-slate-800">{item.quantity}</td>
                    <td className="py-1.5 px-2 text-right font-mono text-slate-700">
                      {formatPaiseToINR(item.unitPricePaise)}
                    </td>
                    <td className="py-1.5 px-2 text-right font-mono font-bold text-slate-900">
                      {formatPaiseToINR(item.totalPaise)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bottom Section: UPI QR & Financials Breakdown */}
          <div className="grid grid-cols-12 gap-3 items-start mb-3">
            {/* Live UPI QR Box */}
            <div className="col-span-5 bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center gap-2.5">
              <img
                src={qrCodeImgSrc}
                alt="UPI Payment QR"
                className="w-16 h-16 object-contain rounded-lg bg-white p-1 border border-slate-200 shrink-0 shadow-2xs"
              />
              <div className="space-y-0.5">
                <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <QrCode className="w-3 h-3 text-brand-orange" />
                  Instant UPI
                </div>
                <div className="text-[10px] font-bold text-slate-800 leading-tight">GPay &bull; PhonePe &bull; Paytm</div>
                <p className="text-[9px] text-slate-600 font-mono font-semibold break-all">
                  {upiPayee}
                </p>
              </div>
            </div>

            {/* Totals Summary Box */}
            <div className="col-span-7 bg-white p-2.5 rounded-xl border border-slate-200 space-y-1 text-xs">
              <div className="flex justify-between text-slate-600 text-[11px]">
                <span>Subtotal:</span>
                <span className="font-mono font-medium text-slate-900">{formatPaiseToINR(invoice.subtotalPaise)}</span>
              </div>

              {invoice.discountPaise > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium text-[11px]">
                  <span>Discount Applied:</span>
                  <span className="font-mono">-{formatPaiseToINR(invoice.discountPaise)}</span>
                </div>
              )}

              {invoice.taxPaise > 0 && (
                <div className="flex justify-between text-slate-600 text-[11px]">
                  <span>GST / Tax:</span>
                  <span className="font-mono">{formatPaiseToINR(invoice.taxPaise)}</span>
                </div>
              )}

              <div className="flex justify-between py-1 text-sm font-black text-slate-900 border-t border-b border-slate-900">
                <span>Net Total:</span>
                <span className="font-mono text-brand-orange">{formatPaiseToINR(invoice.totalPaise)}</span>
              </div>

              <div className="flex justify-between text-[11px] text-slate-700">
                <span>Amount Paid:</span>
                <span className="font-mono font-bold text-emerald-700">
                  {formatPaiseToINR(invoice.amountPaidPaise)}
                </span>
              </div>

              <div className="flex justify-between text-[11px] font-bold bg-slate-100 px-2 py-0.5 rounded-lg">
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
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-2 text-[9px] text-amber-900 leading-snug mb-3 flex items-start gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold uppercase tracking-wider block mb-0.5">Warranty & Service Policy:</span>
              <p>
                1. 30 days testing warranty applies to eligible replacement displays and batteries. &bull; 2. Accessories exchangeable within 7 days in original pack with this bill. &bull; 3. Physical breakage or liquid exposure voids warranty.
              </p>
            </div>
          </div>

          {/* Footer & Signature Line */}
          <div className="flex justify-between items-end pt-2 border-t border-slate-200 text-[10px]">
            <div>
              <div className="font-black text-slate-900 uppercase">{shopName}</div>
              <div className="text-slate-500 text-[9px]">
                Trusted Smartphone Care &bull; Dunlop, Kolkata 700108
              </div>
            </div>

            <div className="text-center w-36">
              <div className="h-8 border-b border-dashed border-slate-400 mb-0.5 flex items-end justify-center">
                <span className="text-[9px] text-slate-400 italic font-mono">{ownerName}</span>
              </div>
              <span className="text-[9px] font-bold text-slate-700 uppercase tracking-wider">
                Authorized Signatory
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
