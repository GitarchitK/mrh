import React, { useState } from 'react';
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
} from 'lucide-react';
import { Button } from '../ui/Button';

interface CounterBillPrintProps {
  invoice: Invoice;
  settings: BusinessSettings;
  onClose?: () => void;
}

export const CounterBillPrint: React.FC<CounterBillPrintProps> = ({ invoice, settings, onClose }) => {
  const [printFormat, setPrintFormat] = useState<'standard' | 'thermal'>('standard');

  const handlePrint = () => {
    window.print();
  };

  const isPaidInFull = invoice.balanceDuePaise <= 0;
  const isPartial = invoice.amountPaidPaise > 0 && invoice.balanceDuePaise > 0;

  // Format WhatsApp message
  const handleWhatsAppShare = () => {
    const cleanPhone = invoice.customerPhone.replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

    const itemListText = invoice.items
      .map((it, idx) => `${idx + 1}. ${it.description} (x${it.quantity}) - ${formatPaiseToINR(it.totalPaise)}`)
      .join('\n');

    const msg = `*RAJIB DA MOBILE REPAIRING HOUSE - DUNLOP*
*Official Customer Bill / Receipt*
---------------------------------------
*Bill No:* ${invoice.invoiceNumber}
*Date:* ${formatDate(invoice.issuedAt)}
*Customer:* ${invoice.customerName}
${invoice.jobNumber ? `*Job Ref:* ${invoice.jobNumber}\n` : ''}
*Items:*
${itemListText}
---------------------------------------
*Subtotal:* ${formatPaiseToINR(invoice.subtotalPaise)}
${invoice.discountPaise > 0 ? `*Discount:* -${formatPaiseToINR(invoice.discountPaise)}\n` : ''}${invoice.taxPaise > 0 ? `*GST/Tax:* ${formatPaiseToINR(invoice.taxPaise)}\n` : ''}*TOTAL AMOUNT:* ${formatPaiseToINR(invoice.totalPaise)}
*Amount Paid:* ${formatPaiseToINR(invoice.amountPaidPaise)}
*Balance Due:* ${formatPaiseToINR(invoice.balanceDuePaise)}
*Status:* ${isPaidInFull ? 'PAID IN FULL ✅' : isPartial ? 'PARTIALLY PAID ⚠️' : 'UNPAID ❌'}
---------------------------------------
*Store Address:* Bhajan Complex, 139, B.T. Road, Dunlop, Kolkata 700108
*Helpline / WhatsApp:* +91 97327 89938 (Debasish)
Thank you for choosing Rajib da Mobile Repairing House!`;

    const encodedMsg = encodeURIComponent(msg);
    const waUrl = `https://wa.me/${phoneWithCountry}?text=${encodedMsg}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  // UPI Payment Link/QR data
  const upiPayee = '9732789938@upi';
  const totalRupees = (invoice.totalPaise / 100).toFixed(2);
  const upiUrl = `upi://pay?pa=${upiPayee}&pn=Rajib%20da%20Mobile%20Repairing%20House&am=${totalRupees}&cu=INR&tn=Bill%20${invoice.invoiceNumber}`;
  const qrCodeImgSrc = `https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=${encodeURIComponent(upiUrl)}`;

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen py-4 sm:py-8 px-2 sm:px-4 font-sans">
      {/* Screen Control Bar */}
      <div className="no-print max-w-3xl mx-auto mb-6 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-1.5">
              <Receipt className="w-4 h-4 text-brand-orange" />
              Counter Bill Preview & Print
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Bill No: <span className="font-mono font-bold text-slate-800">{invoice.invoiceNumber}</span> &bull; {invoice.customerName}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Format Toggle */}
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
              Thermal POS (80mm)
            </button>
          </div>

          <Button
            size="sm"
            variant="outline"
            className="text-xs bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
            leftIcon={<MessageSquare className="w-3.5 h-3.5 text-emerald-600" />}
            onClick={handleWhatsAppShare}
            title="Share formatted bill to customer via WhatsApp"
          >
            WhatsApp Bill
          </Button>

          <Button
            size="sm"
            variant="primary"
            leftIcon={<Printer className="w-3.5 h-3.5" />}
            onClick={handlePrint}
          >
            Print
          </Button>

          {onClose && (
            <Button size="sm" variant="outline" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>

      {/* DOCUMENT WRAPPER */}
      <div className="max-w-3xl mx-auto">
        {printFormat === 'standard' ? (
          /* ============================================================== */
          /* STANDARD MODERN A4 RECEIPT                                    */
          /* ============================================================== */
          <div className="print-content bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-lg text-slate-800 text-xs leading-relaxed">
            {/* Top Accent Strip */}
            <div className="h-2 w-full bg-gradient-to-r from-brand-orange via-amber-500 to-brand-navy rounded-full mb-8 no-print" />

            {/* Header with Store Branding & Bill Meta */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b-2 border-slate-900/10 pb-6 mb-6">
              {/* Left: Branding */}
              <div className="flex items-start gap-4">
                <div className="relative shrink-0">
                  <img
                    src="/images/logo.png"
                    alt="Rajib da Mobile Repairing House Logo"
                    className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-2xl p-1 bg-white border border-slate-200 shadow-sm"
                  />
                </div>
                <div>
                  <div className="inline-block px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-[10px] uppercase tracking-wider mb-1">
                    Rajib da Mobile Repairing House
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
                    Mobile Repairing House
                  </h1>
                  <p className="text-[11px] text-slate-600 font-medium leading-snug max-w-sm mt-0.5">
                    Bhajan Complex, 139 B.T. Road, Dunlop, Saket Nagar, Bonhooghly, Kolkata &bull; 700108
                  </p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-semibold text-slate-700 mt-2">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-brand-orange" />
                      +91 97327 89938
                    </span>
                    <span>&bull;</span>
                    <span className="text-slate-600">Contact: Debasish (Rajib da)</span>
                    <span>&bull;</span>
                    <span className="text-slate-500 font-mono text-[10px]">Plus Code: M92H+Q4</span>
                  </div>
                </div>
              </div>

              {/* Right: Bill Badge */}
              <div className="sm:text-right shrink-0 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 w-full sm:w-auto">
                <div className="text-[10px] font-black uppercase tracking-wider text-brand-orange">
                  Counter Sale Bill & Receipt
                </div>
                <div className="text-lg sm:text-xl font-mono font-black text-slate-900 mt-0.5 tracking-tight">
                  {invoice.invoiceNumber}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Issued: <span className="font-semibold text-slate-800">{formatDateTime(invoice.issuedAt)}</span>
                </div>
                {invoice.jobNumber && (
                  <div className="text-[11px] text-slate-600 mt-0.5 font-mono">
                    Repair Job: <span className="font-bold text-slate-900">{invoice.jobNumber}</span>
                  </div>
                )}
                <div className="text-[10px] text-slate-400 mt-1">
                  Cashier: <span className="font-medium text-slate-600">{invoice.createdBy || 'Debasish'}</span>
                </div>
              </div>
            </div>

            {/* Customer & Payment Status Box */}
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
                  Payment Status
                </span>
                <div>
                  {isPaidInFull ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300 font-black text-xs uppercase tracking-wide shadow-2xs">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      Paid in Full
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
                  Mode: <span className="font-semibold text-slate-700 capitalize">{invoice.paymentMethod || 'Cash / Counter'}</span>
                </div>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 mb-6">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white uppercase text-[10px] font-bold tracking-wider">
                    <th className="py-3 px-3 w-10 text-center">#</th>
                    <th className="py-3 px-4">Item & Description</th>
                    <th className="py-3 px-3 text-center">Type</th>
                    <th className="py-3 px-3 text-center">Qty</th>
                    <th className="py-3 px-4 text-right">Unit Rate</th>
                    <th className="py-3 px-4 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoice.items.map((item, index) => (
                    <tr
                      key={item.id}
                      className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}
                    >
                      <td className="py-3 px-3 text-center text-slate-400 font-mono text-[11px]">
                        {index + 1}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {item.description}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-slate-100 text-slate-600 border border-slate-200">
                          {item.type}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-slate-800">
                        {item.quantity}
                      </td>
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

            {/* Summary & QR Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-start mb-6">
              {/* UPI QR & Payment Info (Left 5 Cols) */}
              <div className="sm:col-span-5 bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center gap-3.5">
                <div className="bg-white p-1.5 rounded-xl border border-slate-200 shadow-2xs shrink-0">
                  <img
                    src={qrCodeImgSrc}
                    alt="UPI Payment QR"
                    className="w-24 h-24 object-contain"
                  />
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <QrCode className="w-3.5 h-3.5 text-brand-orange" />
                    Instant UPI QR
                  </div>
                  <div className="text-[11px] font-bold text-slate-800">
                    Scan with any UPI App
                  </div>
                  <p className="text-[10px] text-slate-500 leading-snug">
                    Google Pay, PhonePe, Paytm, BHIM to <span className="font-mono text-slate-700 font-semibold">{upiPayee}</span>
                  </p>
                </div>
              </div>

              {/* Totals Table (Right 7 Cols) */}
              <div className="sm:col-span-7 bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex justify-between py-1 text-slate-600 border-b border-slate-100">
                  <span>Subtotal:</span>
                  <span className="font-mono font-medium text-slate-900">
                    {formatPaiseToINR(invoice.subtotalPaise)}
                  </span>
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
                  <span>Grand Total:</span>
                  <span className="font-mono text-brand-orange">
                    {formatPaiseToINR(invoice.totalPaise)}
                  </span>
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

            {/* Warranty & Store Policy */}
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 text-[10px] text-amber-900 leading-relaxed mb-8 flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold uppercase tracking-wider block mb-0.5">
                  Warranty & Exchange Terms:
                </span>
                <p>
                  1. Testing warranty of 30 days is applicable on selected display and battery replacement spares.
                  <br />
                  2. Accessories in sealed original condition may be exchanged within 7 days with this bill.
                  <br />
                  3. Physical breakage, liquid ingress, or tampering voids warranty.
                </p>
              </div>
            </div>

            {/* Footer Signatures */}
            <div className="flex justify-between items-end pt-4 border-t border-slate-200">
              <div>
                <div className="text-xs font-black text-slate-900">
                  Rajib da Mobile Repairing House
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Trusted Smartphone Care & Accessories &bull; Dunlop, Kolkata
                </div>
              </div>

              <div className="text-center w-48">
                <div className="h-12 border-b border-dashed border-slate-400 mb-1 flex items-end justify-center">
                  <span className="text-[10px] text-slate-400 italic font-mono mb-1">Debasish / Rajib da</span>
                </div>
                <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                  Authorized Signatory
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* ============================================================== */
          /* THERMAL POS SLIP (80mm) FORMAT                                */
          /* ============================================================== */
          <div className="print-content bg-white border border-slate-300 rounded-xl p-4 max-w-[340px] mx-auto shadow-md text-slate-900 font-mono text-[11px] leading-tight">
            {/* Store Header */}
            <div className="text-center space-y-1 border-b border-dashed border-slate-400 pb-3 mb-3">
              <img
                src="/images/logo.png"
                alt="Logo"
                className="w-12 h-12 object-contain mx-auto mb-1"
              />
              <div className="font-black text-sm uppercase">RAJIB DA MOBILE REPAIRING HOUSE</div>
              <div className="text-[10px] text-slate-600">
                Bhajan Complex, 139 B.T. Road, Dunlop, Kolkata-700108
              </div>
              <div className="text-[10px] font-bold">
                Phone / WhatsApp: +91 97327 89938
              </div>
            </div>

            {/* Bill Info */}
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

            {/* Itemized Table */}
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

            {/* Financials */}
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
              <img
                src={qrCodeImgSrc}
                alt="UPI QR"
                className="w-20 h-20 mx-auto object-contain mb-1"
              />
              <div className="text-[9px] text-slate-500 font-sans">
                Scan to Pay / Verify UPI
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-[9px] text-slate-600 pt-1 border-t border-dashed border-slate-400 space-y-1">
              <div className="font-bold uppercase text-[10px] text-slate-800">
                *** THANK YOU FOR VISITING ***
              </div>
              <div>Rajib da Mobile Repairing House</div>
              <div>Goods exchangeable within 7 days with bill</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
