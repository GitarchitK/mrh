import React from 'react';
import { RepairJob, BusinessSettings } from '../../types';
import { formatDate, formatDateTime, formatPhoneNumber } from '../../lib/utils';
import { Printer } from 'lucide-react';
import { Button } from '../ui/Button';

interface IntakeSheetPrintProps {
  job: RepairJob;
  settings: BusinessSettings;
  onClose?: () => void;
}

export const IntakeSheetPrint: React.FC<IntakeSheetPrintProps> = ({ job, settings, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white text-black p-6 sm:p-10 max-w-3xl mx-auto font-sans">
      {/* Screen action bar (hidden during print) */}
      <div className="no-print flex items-center justify-between pb-6 mb-6 border-b border-gray-200">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Print Repair Intake Sheet</h2>
          <p className="text-xs text-gray-500">Provide this physical receipt to the customer upon intake.</p>
        </div>
        <div className="flex items-center gap-2">
          {onClose && (
            <Button size="sm" variant="outline" onClick={onClose}>
              Close
            </Button>
          )}
          <Button size="sm" variant="primary" leftIcon={<Printer className="w-4 h-4" />} onClick={handlePrint}>
            Print Intake Sheet
          </Button>
        </div>
      </div>

      {/* Printable Document Content */}
      <div className="print-content border border-gray-300 p-8 rounded-lg">
        {/* Shop Header */}
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
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Repair Job Sheet</div>
            <div className="text-xl font-mono font-black text-gray-900 mt-1">{job.jobNumber}</div>
            <div className="text-xs text-gray-600 mt-1">Date: {formatDate(job.receivedAt)}</div>
          </div>
        </div>

        {/* Customer & Device Information */}
        <div className="grid grid-cols-2 gap-6 mb-6 bg-gray-50 p-4 rounded border border-gray-200 text-xs">
          <div>
            <div className="font-bold text-gray-500 uppercase tracking-wider mb-1.5">Customer Information</div>
            <div className="font-bold text-sm text-gray-900">{job.customerName}</div>
            <div className="text-gray-700 mt-0.5">Phone: {formatPhoneNumber(job.customerPhone)}</div>
            {job.customerEmail && <div className="text-gray-700">Email: {job.customerEmail}</div>}
          </div>
          <div>
            <div className="font-bold text-gray-500 uppercase tracking-wider mb-1.5">Device Information</div>
            <div className="font-bold text-sm text-gray-900">
              {job.brand} {job.model} ({job.deviceType.toUpperCase()})
            </div>
            {job.imeiOrSerial && <div className="text-gray-700 mt-0.5">IMEI / Serial: {job.imeiOrSerial}</div>}
            <div className="text-gray-700">Intake Time: {formatDateTime(job.receivedAt)}</div>
          </div>
        </div>

        {/* Diagnosis & Reported Problem */}
        <div className="space-y-4 mb-6 text-xs">
          <div className="border border-gray-200 rounded p-3">
            <div className="font-bold text-gray-900 uppercase tracking-wider text-[11px] mb-1">
              Reported Symptoms / Issues:
            </div>
            <p className="text-gray-800 font-medium leading-relaxed">{job.reportedProblem}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded p-3">
              <div className="font-bold text-gray-900 uppercase tracking-wider text-[11px] mb-1">
                Condition at Intake:
              </div>
              <p className="text-gray-700">{job.conditionAtIntake || 'Normal handling wear'}</p>
            </div>
            <div className="border border-gray-200 rounded p-3">
              <div className="font-bold text-gray-900 uppercase tracking-wider text-[11px] mb-1">
                Accessories Received:
              </div>
              <p className="text-gray-700">{job.accessoriesReceived || 'None (Handset only)'}</p>
            </div>
          </div>

          {job.inspectionNotes && (
            <div className="border border-gray-200 rounded p-3 bg-amber-50/50">
              <div className="font-bold text-gray-900 uppercase tracking-wider text-[11px] mb-1">
                Counter Inspection Notes:
              </div>
              <p className="text-gray-800">{job.inspectionNotes}</p>
            </div>
          )}
        </div>

        {/* Online Tracking Box */}
        <div className="bg-gray-100 p-3.5 rounded border border-gray-300 mb-6 flex justify-between items-center text-xs">
          <div>
            <span className="font-bold text-gray-900">Track Your Repair Online: </span>
            <span className="text-gray-700">Visit mobilerepairinghouse.in/repair-status</span>
          </div>
          <div className="font-mono font-bold bg-white px-2.5 py-1 rounded border border-gray-300">
            Job #{job.jobNumber}
          </div>
        </div>

        {/* Terms & Conditions Acknowledgement */}
        <div className="border-t border-gray-300 pt-4 mb-8 text-[10px] text-gray-600 leading-normal">
          <div className="font-bold uppercase tracking-wider text-gray-800 mb-1">Terms & Acknowledgment:</div>
          <div className="whitespace-pre-line">{settings.termsAndConditions}</div>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-12 pt-6 border-t border-gray-400 text-xs">
          <div className="text-center">
            <div className="h-10 border-b border-gray-400 mb-1" />
            <span className="text-gray-600">Customer Signature / Acknowledgment</span>
          </div>
          <div className="text-center">
            <div className="h-10 border-b border-gray-400 mb-1" />
            <span className="text-gray-600">Authorized Signatory ({settings.businessName})</span>
          </div>
        </div>
      </div>
    </div>
  );
};
