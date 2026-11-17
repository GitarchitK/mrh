import React from 'react';
import { SeoHead } from '../../components/shared/SeoHead';
import { useSettings } from '../../context/SettingsContext';

export const TermsPage: React.FC = () => {
  const { settings } = useSettings();

  return (
    <div className="bg-brand-light min-h-screen py-12 sm:py-16">
      <SeoHead
        title="Terms & Conditions | Mobile Repairing House Dunlop"
        description="Terms and service policies for diagnostic assessments and hardware repairs at Mobile Repairing House."
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-brand-border shadow-xs space-y-6 text-xs sm:text-sm text-brand-text leading-relaxed">
          <div className="border-b border-brand-border pb-4">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy">
              Terms & Conditions
            </h1>
            <p className="text-xs text-brand-secondary mt-1">
              {settings.businessName} &bull; Bhajan Complex, 139 B.T. Road, Dunlop, Kolkata 700108
            </p>
          </div>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-brand-navy uppercase tracking-wider">
              1. Diagnostics & Upfront Estimates
            </h2>
            <p>
              Diagnostic inspection is required before establishing exact repair costs and part requirements. No billable repair work will be initiated before customer approval of the provided quotation has been recorded.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-brand-navy uppercase tracking-wider">
              2. Pre-existing Condition & Data Disclaimer
            </h2>
            <p>
              Smartphones brought in with severe impact damage, bent housings, or liquid ingress may have latent fractures that only become apparent during disassembly. While every reasonable technical care is exercised, {settings.businessName} cannot be held responsible for unavoidable data loss resulting from pre-existing board failure or operating system corruption.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-brand-navy uppercase tracking-wider">
              3. Customer Approvals
            </h2>
            <p>
              Customer approval may be given in person at the counter, verbally via confirmed telephone call, via WhatsApp chat confirmation, or through our secure online approval link.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-brand-navy uppercase tracking-wider">
              4. Unclaimed Devices
            </h2>
            <p>
              Devices remaining unclaimed for more than 60 calendar days following notification of repair completion or unrepairability may be placed into long-term storage or disposed of in accordance with applicable local inventory regulations.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-brand-navy uppercase tracking-wider">
              5. Warranty Terms
            </h2>
            <p>
              Warranty coverage applies solely to replaced parts and associated workmanship as itemized on your final payment receipt. Any subsequent physical impact, liquid exposure, or unauthorized opening by another party immediately voids any warranty.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
