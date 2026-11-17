import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wrench,
  CheckCircle2,
  Clock,
  Phone,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Copy,
  Check,
  Smartphone,
  Calendar,
  Sparkles,
  Lock,
} from 'lucide-react';
import { submitRepairEnquiry } from '../../services/db';
import { useSettings } from '../../context/SettingsContext';
import { isValidIndianPhone } from '../../lib/utils';
import { createWhatsAppUrl } from '../../lib/whatsapp';
import { Button } from '../../components/ui/Button';
import { Input, Textarea, Select } from '../../components/ui/Input';
import { SeoHead } from '../../components/shared/SeoHead';
import { DeviceType, RepairEnquiry } from '../../types';
import { triggerSuccessConfetti } from '../../lib/confetti';
import { scaleIn, fadeInUp } from '../../lib/animations';

export const RepairRequestPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { enabledServices } = useSettings();

  const preselectedType = (searchParams.get('type') as DeviceType) || 'android';
  const preselectedCategory = searchParams.get('category') || '';
  const preselectedBrand = searchParams.get('brand') || '';

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [deviceType, setDeviceType] = useState<DeviceType>(preselectedType);
  const [brand, setBrand] = useState(preselectedBrand);
  const [model, setModel] = useState('');
  const [imeiOrSerial, setImeiOrSerial] = useState('');
  const [problemCategory, setProblemCategory] = useState(preselectedCategory || 'Display and Touchscreen Replacement');
  const [description, setDescription] = useState('');
  const [preferredVisitDate, setPreferredVisitDate] = useState('');
  const [preferredContactMethod, setPreferredContactMethod] = useState<'whatsapp' | 'phone'>('whatsapp');
  const [consent, setConsent] = useState(true);

  // Status & Errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedEnquiry, setSubmittedEnquiry] = useState<RepairEnquiry | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!customerName.trim()) {
      newErrors.customerName = 'Please enter your name.';
    } else if (customerName.trim().length > 70) {
      newErrors.customerName = 'Name must be under 70 characters.';
    }

    if (!phone.trim()) {
      newErrors.phone = 'Mobile number is required.';
    } else if (!isValidIndianPhone(phone)) {
      newErrors.phone = 'Please enter a valid 10-digit Indian mobile number.';
    }

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!brand.trim()) {
      newErrors.brand = 'Device brand is required (e.g. Samsung, Apple, Redmi).';
    }

    if (!model.trim()) {
      newErrors.model = 'Model name is required (e.g. Galaxy M31, iPhone 13, Note 10).';
    }

    if (!description.trim()) {
      newErrors.description = 'Please describe the problem you are experiencing.';
    } else if (description.trim().length < 10) {
      newErrors.description = 'Please provide a little more detail (at least 10 characters).';
    }

    if (!consent) {
      newErrors.consent = 'You must acknowledge the communication consent to proceed.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const enquiry = await submitRepairEnquiry({
        customerName,
        phone,
        email: email.trim() || undefined,
        deviceType,
        brand,
        model,
        imeiOrSerial: imeiOrSerial.trim() || undefined,
        problemCategory,
        description,
        preferredVisitDate: preferredVisitDate || undefined,
        preferredContactMethod,
      });

      setSubmittedEnquiry(enquiry);
      triggerSuccessConfetti();
    } catch (err) {
      console.error('Enquiry submission failed:', err);
      setErrors({ form: 'An unexpected error occurred while saving your request. Please try again or message Debasish on WhatsApp.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = () => {
    if (submittedEnquiry) {
      navigator.clipboard.writeText(submittedEnquiry.publicReference);
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2500);
    }
  };

  return (
    <div className="bg-brand-light min-h-screen py-12 sm:py-20 relative overflow-hidden">
      <SeoHead
        title="Book a Smartphone Repair | Repair Enquiry Dunlop"
        description="Submit your Android or iPhone repair enquiry online. Receive preliminary diagnosis assessment from Debasish at Mobile Repairing House in Dunlop, Kolkata."
      />

      {/* Decorative ambient gradient */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-orange/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10">
        <AnimatePresence mode="wait">
          {/* Success Confirmation View */}
          {submittedEnquiry ? (
            <motion.div
              key="confirmation"
              variants={scaleIn}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white rounded-3xl p-8 sm:p-12 border border-brand-border/90 shadow-card-hover space-y-6 text-center"
            >
              <div className="w-20 h-20 rounded-3xl bg-emerald-100/90 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Enquiry Received Successfully
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-brand-navy">
                  Thank You, {submittedEnquiry.customerName}!
                </h1>
                <p className="text-xs sm:text-sm text-brand-secondary max-w-lg mx-auto leading-relaxed">
                  Your repair enquiry has been logged at Mobile Repairing House. Debasish will review your reported symptoms and connect with you shortly via{' '}
                  <strong className="text-brand-navy capitalize">{submittedEnquiry.preferredContactMethod}</strong>.
                </p>
              </div>

              {/* Reference Box */}
              <div className="bg-brand-light p-5 rounded-2xl border border-brand-border max-w-md mx-auto">
                <div className="text-[11px] font-bold text-brand-secondary uppercase tracking-wider mb-1">
                  Your Unique Enquiry Reference
                </div>
                <div className="flex items-center justify-center gap-2.5">
                  <span className="text-2xl sm:text-3xl font-mono font-black text-brand-navy tracking-wider">
                    {submittedEnquiry.publicReference}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="p-2 text-brand-secondary hover:text-brand-navy rounded-xl hover:bg-white border border-transparent hover:border-brand-border transition-colors cursor-pointer"
                    title="Copy Reference"
                  >
                    {copiedRef ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-brand-secondary mt-1">
                  Keep this reference handy when calling or visiting our shop in Dunlop.
                </p>
              </div>

              {/* Next Steps */}
              <div className="text-left bg-brand-light/70 p-6 rounded-2xl border border-brand-border space-y-3 text-xs">
                <div className="font-bold text-brand-navy uppercase tracking-wider text-[11px]">
                  What Happens Next:
                </div>
                <ul className="space-y-2.5 text-brand-secondary">
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-brand-orange text-white flex items-center justify-center font-mono font-bold text-[10px] shrink-0 mt-0.5">1</span>
                    <span>We evaluate spare parts availability for your {submittedEnquiry.brand} {submittedEnquiry.model}.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-brand-orange text-white flex items-center justify-center font-mono font-bold text-[10px] shrink-0 mt-0.5">2</span>
                    <span>We contact you at {submittedEnquiry.phone} with an indicative estimate and shop visit timing.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-brand-orange text-white flex items-center justify-center font-mono font-bold text-[10px] shrink-0 mt-0.5">3</span>
                    <span>Bring the device to our Dunlop shop (Bhajan Complex, 139 B.T. Road) for physical intake and confirmation.</span>
                  </li>
                </ul>
              </div>

              {/* Actions */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={createWhatsAppUrl(`Hello Debasish, I just submitted repair enquiry ${submittedEnquiry.publicReference} for my ${submittedEnquiry.brand} ${submittedEnquiry.model}.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto"
                >
                  <Button size="md" variant="outline" className="w-full text-emerald-700 border-emerald-300 hover:bg-emerald-50" leftIcon={<MessageSquare className="w-4 h-4 text-emerald-600" />}>
                    Follow-up on WhatsApp
                  </Button>
                </a>
                <Link to="/" className="w-full sm:w-auto">
                  <Button size="md" variant="primary" className="w-full">
                    Return to Homepage
                  </Button>
                </Link>
              </div>
            </motion.div>
          ) : (
            /* Main Animated Enquiry Form */
            <motion.div
              key="form"
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="bg-white rounded-3xl p-6 sm:p-10 border border-brand-border/90 shadow-card-hover space-y-8"
            >
              <div className="text-center space-y-2 border-b border-brand-border/80 pb-6">
                <span className="text-xs font-bold text-brand-orange uppercase tracking-wider bg-brand-orange-light/80 px-3 py-1 rounded-full">
                  Online Diagnostic Booking
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-brand-navy">
                  Book a Smartphone Repair
                </h1>
                <p className="text-xs sm:text-sm text-brand-secondary max-w-lg mx-auto leading-relaxed">
                  Provide your device symptoms and contact info. No account required. We will review your enquiry and provide preliminary guidance.
                </p>
              </div>

              {errors.form && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-xs text-rose-700">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errors.form}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-7">
                {/* 1. Customer Information */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-brand-navy text-white flex items-center justify-center text-xs font-bold font-mono">1</span>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-brand-navy">
                      Your Contact Information
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Full Name"
                      required
                      placeholder="e.g. Sourav Mukherjee"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      error={errors.customerName}
                    />
                    <Input
                      label="Mobile Number (WhatsApp preferred)"
                      required
                      placeholder="10-digit mobile number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      error={errors.phone}
                      helperText="We will call or WhatsApp this number"
                    />
                  </div>
                  <Input
                    label="Email Address (Optional)"
                    placeholder="name@example.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={errors.email}
                  />
                </div>

                {/* 2. Device Information */}
                <div className="space-y-4 pt-5 border-t border-brand-border">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-brand-navy text-white flex items-center justify-center text-xs font-bold font-mono">2</span>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-brand-navy">
                      Device Specifications
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Select
                      label="Device Operating System"
                      required
                      value={deviceType}
                      onChange={(e) => setDeviceType(e.target.value as DeviceType)}
                    >
                      <option value="android">Android Phone</option>
                      <option value="iphone">iPhone (iOS)</option>
                      <option value="other">Other / Feature Phone</option>
                    </Select>

                    <Input
                      label="Brand Name"
                      required
                      placeholder="e.g. Samsung, Apple, Xiaomi"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      error={errors.brand}
                    />

                    <Input
                      label="Model Name / Number"
                      required
                      placeholder="e.g. Galaxy M31, iPhone 12"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      error={errors.model}
                    />
                  </div>

                  <Input
                    label="IMEI or Serial Number (Optional)"
                    placeholder="Optional, only if known"
                    value={imeiOrSerial}
                    onChange={(e) => setImeiOrSerial(e.target.value)}
                    helperText="Useful for verifying exact model revisions before ordering parts"
                  />
                </div>

                {/* 3. Repair Details */}
                <div className="space-y-4 pt-5 border-t border-brand-border">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-brand-navy text-white flex items-center justify-center text-xs font-bold font-mono">3</span>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-brand-navy">
                      Reported Symptoms & Issue Description
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Select
                      label="Problem Category"
                      required
                      value={problemCategory}
                      onChange={(e) => setProblemCategory(e.target.value)}
                    >
                      {enabledServices.map((srv) => (
                        <option key={srv.id} value={srv.title}>
                          {srv.title}
                        </option>
                      ))}
                      <option value="Other Issue">Other Hardware / Software Issue</option>
                    </Select>

                    <Input
                      label="Preferred Visit Date (Optional)"
                      type="date"
                      value={preferredVisitDate}
                      onChange={(e) => setPreferredVisitDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <Textarea
                    label="Description of the Issue"
                    required
                    placeholder="Please describe what happened (e.g. dropped on floor, display has black lines, phone does not turn on, charger must be held at an angle)..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    error={errors.description}
                  />

                  <div className="space-y-1.5 pt-1">
                    <label className="block text-xs font-semibold text-brand-navy uppercase tracking-wider">
                      Preferred Follow-up Contact Method:
                    </label>
                    <div className="flex items-center gap-6 text-xs text-brand-text pt-1">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="contactMethod"
                          value="whatsapp"
                          checked={preferredContactMethod === 'whatsapp'}
                          onChange={() => setPreferredContactMethod('whatsapp')}
                          className="text-brand-orange focus:ring-brand-orange"
                        />
                        <span className="font-medium">WhatsApp Message (Recommended)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="contactMethod"
                          value="phone"
                          checked={preferredContactMethod === 'phone'}
                          onChange={() => setPreferredContactMethod('phone')}
                          className="text-brand-orange focus:ring-brand-orange"
                        />
                        <span className="font-medium">Phone Call</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* 4. Privacy & Consent Acknowledgement */}
                <div className="pt-4 border-t border-brand-border space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      className="mt-1 text-brand-orange rounded border-brand-border focus:ring-brand-orange cursor-pointer"
                    />
                    <span className="text-xs text-brand-secondary leading-relaxed">
                      I acknowledge that the submitted contact details and device symptoms will be used by Mobile Repairing House exclusively to evaluate and respond to this repair enquiry. I agree to the{' '}
                      <Link to="/privacy-policy" className="text-brand-navy underline font-medium" target="_blank">
                        Privacy Policy
                      </Link>.
                    </span>
                  </label>
                  {errors.consent && <p className="text-xs text-rose-600 font-medium">{errors.consent}</p>}
                </div>

                {/* Submit Button */}
                <div className="pt-3">
                  <Button
                    type="submit"
                    size="lg"
                    variant="glow"
                    className="w-full text-base font-bold shadow-md"
                    isLoading={isSubmitting}
                  >
                    Submit Repair Request Online
                  </Button>
                  <p className="text-[11px] text-center text-brand-secondary mt-2">
                    No advance payment is required to submit a diagnostic enquiry.
                  </p>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
