import React from 'react';
import { Invoice, BusinessSettings } from '../../types';
import { formatDate, formatPhoneNumber } from '../../lib/utils';
import { formatPaiseToINR } from '../../lib/money';
import { Printer } from 'lucide-react';
import { Button } from '../ui/Button';

interface InvoicePrintProps {
  invoice: Invoice;
  settings: BusinessSettings;
  onClose?: () => void;
}

export const InvoicePrint: React.FC<InvoicePrintProps> = ({ invoice, settings, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white text-black p-6 sm:p-10 max-w-3xl mx-auto font-sans">
      {/* Screen action bar */}
      <div className="no-print flex items-center justify-between pb-6 mb-6 border-b border-gray-200">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Tax Invoice & Payment Receipt</h2>
          <p className="text-xs text-gray-500">Official receipt for customer repair and parts.</p>
        </div>
        <div className="flex items-center gap-2">
          {onClose && (
            <Button size="sm" variant="outline" onClick={onClose}>
              Close
            </Button>
          )}
          <Button size="sm" variant="primary" leftIcon={<Printer className="w-4 h-4" />} onClick={handlePrint}>
            Print Invoice
          </Button>
        </div>
      </div>

      {/* Invoice Document */}
      <div className="print-content border border-gray-300 p-8 rounded-lg">
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-gray-900 pb-5 mb-5">
          <div className="flex items-start gap-4">
            <img
              src="/images/logo.png"
              alt="Mobile Repairing House Logo"
              className="w-16 h-16 object-contain shrink-0"
            />
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">
                {settings.businessName}
              </h1>
              <p className="text-xs text-gray-700 max-w-md mt-1 leading-snug">
                {settings.fullAddress}
              </p>
              <div className="text-xs font-semibold text-gray-800 mt-2 space-x-3">
                <span>Contact: {settings.ownerContactName}</span>
                <span>•</span>
                <span>Phone: {settings.phone}</span>
                <span>•</span>
                <span>WhatsApp: {settings.whatsapp}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              {invoice.balanceDuePaise === 0 ? 'PAYMENT RECEIPT' : 'REPAIR INVOICE'}
            </div>
            <div className="text-xl font-mono font-black text-gray-900 mt-1">{invoice.invoiceNumber}</div>
            <div className="text-xs text-gray-600 mt-1">Date: {formatDate(invoice.issuedAt)}</div>
            {invoice.jobNumber && (
              <div className="text-xs font-semibold text-gray-800 mt-0.5">Job: {invoice.jobNumber}</div>
            )}
          </div>
        </div>

        {/* Bill To */}
        <div className="bg-gray-50 p-4 rounded border border-gray-200 mb-6 text-xs flex justify-between">
          <div>
            <div className="font-bold text-gray-500 uppercase tracking-wider mb-1">Billed To:</div>
            <div className="font-bold text-sm text-gray-900">{invoice.customerName}</div>
            <div className="text-gray-700 mt-0.5">Phone: {formatPhoneNumber(invoice.customerPhone)}</div>
          </div>
          <div className="text-right">
            <div className="font-bold text-gray-500 uppercase tracking-wider mb-1">Payment Status:</div>
            <span
              className={`inline-block font-bold px-2.5 py-1 rounded text-xs uppercase ${
                invoice.status === 'paid'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : invoice.status === 'partial'
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'bg-rose-100 text-rose-800 border border-rose-300'
              }`}
            >
              {invoice.status === 'paid' ? 'Paid in Full' : invoice.status === 'partial' ? 'Partially Paid' : 'Unpaid'}
            </span>
          </div>
        </div>

        {/* Itemized Table */}
        <table className="w-full text-left text-xs mb-6 border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-900 text-gray-600 uppercase text-[10px] tracking-wider">
              <th className="py-2.5 px-2">#</th>
              <th className="py-2.5 px-2">Description</th>
              <th className="py-2.5 px-2 text-center">Type</th>
              <th className="py-2.5 px-2 text-center">Qty</th>
              <th className="py-2.5 px-2 text-right">Rate</th>
              <th className="py-2.5 px-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {invoice.items.map((item, index) => (
              <tr key={item.id}>
                <td className="py-2.5 px-2 text-gray-500">{index + 1}</td>
                <td className="py-2.5 px-2 font-medium text-gray-900">{item.description}</td>
                <td className="py-2.5 px-2 text-center capitalize text-gray-600">{item.type}</td>
                <td className="py-2.5 px-2 text-center">{item.quantity}</td>
                <td className="py-2.5 px-2 text-right">{formatPaiseToINR(item.unitPricePaise)}</td>
                <td className="py-2.5 px-2 text-right font-medium">{formatPaiseToINR(item.totalPaise)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals Breakdown */}
        <div className="flex justify-end mb-6 text-xs">
          <div className="w-72 space-y-2">
            <div className="flex justify-between py-1 text-gray-600 border-b border-gray-200">
              <span>Subtotal:</span>
              <span className="font-medium text-gray-900">{formatPaiseToINR(invoice.subtotalPaise)}</span>
            </div>

            {invoice.discountPaise > 0 && (
              <div className="flex justify-between py-1 text-emerald-700 border-b border-gray-200">
                <span>Discount:</span>
                <span>-{formatPaiseToINR(invoice.discountPaise)}</span>
              </div>
            )}

            {invoice.taxPaise > 0 && (
              <div className="flex justify-between py-1 text-gray-600 border-b border-gray-200">
                <span>Tax:</span>
                <span>{formatPaiseToINR(invoice.taxPaise)}</span>
              </div>
            )}

            <div className="flex justify-between py-2 text-sm font-bold text-gray-900 border-b-2 border-gray-900">
              <span>Total Amount:</span>
              <span>{formatPaiseToINR(invoice.totalPaise)}</span>
            </div>

            <div className="flex justify-between py-1 text-gray-700">
              <span>Amount Paid:</span>
              <span className="font-semibold text-emerald-700">{formatPaiseToINR(invoice.amountPaidPaise)}</span>
            </div>

            <div className="flex justify-between py-1.5 text-xs font-bold bg-gray-100 px-2 rounded">
              <span>Balance Due:</span>
              <span className={invoice.balanceDuePaise > 0 ? 'text-rose-700' : 'text-emerald-700'}>
                {formatPaiseToINR(invoice.balanceDuePaise)}
              </span>
            </div>
          </div>
        </div>

        {/* Warranty Notice & Policies */}
        <div className="border-t border-gray-300 pt-4 text-[10px] text-gray-600 leading-normal">
          <div className="font-bold text-gray-800 uppercase tracking-wider mb-1">Warranty Policy:</div>
          <p>{settings.warrantyPolicyDefault}</p>
        </div>

        {/* Signature */}
        <div className="flex justify-between items-end pt-10 text-xs">
          <div className="text-[11px] text-gray-500">
            Thank you for trusting Mobile Repairing House, Dunlop!
          </div>
          <div className="text-center w-56">
            <div className="h-10 border-b border-gray-400 mb-1" />
            <span className="text-gray-600 text-xs">Authorized Signature</span>
          </div>
        </div>
      </div>
    </div>
  );
};
