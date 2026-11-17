import React from 'react';
import { SeoHead } from '../../components/shared/SeoHead';
import { useSettings } from '../../context/SettingsContext';

export const PrivacyPolicyPage: React.FC = () => {
  const { settings } = useSettings();

  return (
    <div className="bg-brand-light min-h-screen py-12 sm:py-16">
      <SeoHead
        title="Privacy Policy | Mobile Repairing House Dunlop"
        description="Privacy policy and data protection practices at Mobile Repairing House in Dunlop, Kolkata."
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-brand-border shadow-xs space-y-6 text-xs sm:text-sm text-brand-text leading-relaxed">
          <div className="border-b border-brand-border pb-4">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-navy">
              Privacy Policy
            </h1>
            <p className="text-xs text-brand-secondary mt-1">
              Last updated: October 2026 &bull; {settings.businessName}, Dunlop, Kolkata
            </p>
          </div>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-brand-navy uppercase tracking-wider">
              1. Information We Collect
            </h2>
            <p>
              When you submit a repair enquiry or bring your smartphone to <strong>{settings.businessName}</strong>, we collect only the information necessary to fulfill our repair and customer communication duties:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-brand-secondary">
              <li>Customer full name and mobile phone number</li>
              <li>Optional email address</li>
              <li>Device manufacturer, model, and optional IMEI or serial number</li>
              <li>Reported physical symptoms, diagnostic observations, and intake condition</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-brand-navy uppercase tracking-wider">
              2. How Your Information is Used
            </h2>
            <p>
              Your contact details are used solely to communicate regarding your diagnostic evaluation, provide estimates, provide repair progress updates, and inform you when your device is ready for collection.
            </p>
            <p>
              We do not sell, rent, or trade your personal information with any third-party marketing entities.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-brand-navy uppercase tracking-wider">
              3. Device Data & Privacy Protection
            </h2>
            <p>
              We respect the confidentiality of personal data stored on your device. Our technicians do not access your personal media, messages, or applications unless strictly required to diagnose or verify a reported hardware fault (e.g. testing camera functionality or audio recording).
            </p>
            <p>
              Customers are always advised to perform a full local or cloud backup of device data prior to bringing a smartphone in for hardware service.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-bold text-brand-navy uppercase tracking-wider">
              4. Contact for Privacy Inquiries
            </h2>
            <p>
              For any questions regarding our data handling practices, please contact {settings.ownerContactName} at {settings.fullAddress} or by phone at {settings.phone}.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
