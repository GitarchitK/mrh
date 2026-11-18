import React from 'react';
import { CounterBillPrint } from './CounterBillPrint';
import { Invoice, BusinessSettings } from '../../types';

interface InvoicePrintProps {
  invoice: Invoice;
  settings: BusinessSettings;
  onClose?: () => void;
}

export const InvoicePrint: React.FC<InvoicePrintProps> = (props) => {
  return <CounterBillPrint {...props} />;
};
