import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Wrench,
  Search,
  PlusCircle,
  Smartphone,
  CheckCircle2,
  Printer,
  ArrowRight,
  User,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  Mic,
} from 'lucide-react';
import {
  getCustomers,
  createOrUpdateCustomer,
  createRepairJob,
  getBusinessSettings,
  getStaffUsers,
} from '../../services/db';
import { Customer, DeviceType, RepairPriority, RepairJob, BusinessSettings, StaffUser } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useVoice } from '../../context/VoiceContext';
import { SUPPORTED_VOICE_LANGUAGES } from '../../services/speechService';
import { Button } from '../../components/ui/Button';
import { Input, Textarea, Select } from '../../components/ui/Input';
import { IntakeSheetPrint } from '../../components/print/IntakeSheetPrint';
import { isValidIndianPhone, normalizePhoneNumber } from '../../lib/utils';
import { triggerConfetti } from '../../lib/confetti';
import { fadeInUp, staggerContainer } from '../../lib/animations';

export const RepairIntakePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser } = useAuth();
  const { registerJobsheetHandler, openAssistant, activeLanguage } = useVoice();
  const currentVoiceLang = SUPPORTED_VOICE_LANGUAGES.find((l) => l.code === activeLanguage) || SUPPORTED_VOICE_LANGUAGES[0];

  // Query param prefill (e.g. from enquiry or customer page)
  const paramName = searchParams.get('name') || '';
  const paramPhone = searchParams.get('phone') || '';
  const paramBrand = searchParams.get('brand') || '';
  const paramModel = searchParams.get('model') || '';
  const paramDeviceType = (searchParams.get('deviceType') as DeviceType) || 'android';
  const paramProblem = searchParams.get('problem') || '';
  const paramCustId = searchParams.get('custId') || '';

  // Customer State
  const [customerSearch, setCustomerSearch] = useState(paramPhone || paramName || '');
  const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isNewCustomer, setIsNewCustomer] = useState(false);

  // New Customer Fields
  const [custName, setCustName] = useState(paramName);
  const [custPhone, setCustPhone] = useState(paramPhone);
  const [custEmail, setCustEmail] = useState('');
  const [custAddress, setCustAddress] = useState('');

  // Device & Intake Fields
  const [deviceType, setDeviceType] = useState<DeviceType>(paramDeviceType);
  const [brand, setBrand] = useState(paramBrand);
  const [model, setModel] = useState(paramModel);
  const [imeiOrSerial, setImeiOrSerial] = useState('');
  const [conditionAtIntake, setConditionAtIntake] = useState('');
  const [accessoriesReceived, setAccessoriesReceived] = useState('');
  const [devicePasscodeOrPattern, setDevicePasscodeOrPattern] = useState('');

  // Diagnosis & Operational Fields
  const [reportedProblem, setReportedProblem] = useState(paramProblem);
  const [diagnosis, setDiagnosis] = useState('');
  const [inspectionNotes, setInspectionNotes] = useState('');
  const [priority, setPriority] = useState<RepairPriority>('normal');
  const [assignedTechnician, setAssignedTechnician] = useState('Debasish');
  const [expectedCompletionAt, setExpectedCompletionAt] = useState('');
  const [staffList, setStaffList] = useState<StaffUser[]>([]);

  // Completed Intake Result
  const [createdJob, setCreatedJob] = useState<RepairJob | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [businessSettings, setBusinessSettings] = useState<BusinessSettings | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const [cList, settings, sList] = await Promise.all([getCustomers(), getBusinessSettings(), getStaffUsers()]);
      setAllCustomers(cList);
      setBusinessSettings(settings);
      setStaffList(sList);

      if (sList.length > 0 && !assignedTechnician) {
        setAssignedTechnician(sList[0].displayName);
      }

      if (paramCustId) {
        const found = cList.find((c) => c.id === paramCustId);
        if (found) setSelectedCustomer(found);
      } else if (paramPhone) {
        const norm = normalizePhoneNumber(paramPhone);
        const found = cList.find((c) => c.normalizedPhone === norm);
        if (found) {
          setSelectedCustomer(found);
        } else {
          setIsNewCustomer(true);
        }
      }
    };
    fetch();
  }, [paramCustId, paramPhone]);

  // Voice AI Autofill Registration
  useEffect(() => {
    const unregister = registerJobsheetHandler((data) => {
      if (data.customerName) {
        setCustName(data.customerName);
        setIsNewCustomer(true);
      }
      if (data.customerPhone) {
        setCustPhone(data.customerPhone);
        setCustomerSearch(data.customerPhone);
      }
      if (data.brand) setBrand(data.brand);
      if (data.model) setModel(data.model);
      if (data.deviceType) setDeviceType(data.deviceType);
      if (data.reportedProblem) setReportedProblem(data.reportedProblem);
      if (data.diagnosis) setDiagnosis(data.diagnosis);
      if (data.conditionAtIntake) setConditionAtIntake(data.conditionAtIntake);
      if (data.accessoriesReceived) setAccessoriesReceived(data.accessoriesReceived);
      if (data.devicePasscodeOrPattern) setDevicePasscodeOrPattern(data.devicePasscodeOrPattern);
      if (data.priority) setPriority(data.priority);
    });
    return unregister;
  }, [registerJobsheetHandler]);

  // Handle Customer Selection
  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustName(customer.fullName);
    setCustPhone(customer.phone);
    setCustEmail(customer.email || '');
    setCustAddress(customer.address || '');
    setIsNewCustomer(false);
    setCustomerSearch('');
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!selectedCustomer) {
      if (!custName.trim()) errs.custName = 'Customer name is required.';
      if (!custPhone.trim()) errs.custPhone = 'Mobile number is required.';
      else if (!isValidIndianPhone(custPhone)) errs.custPhone = 'Enter valid 10-digit Indian mobile number.';
    }

    if (!brand.trim()) errs.brand = 'Device brand is required.';
    if (!model.trim()) errs.model = 'Model is required.';
    if (!reportedProblem.trim()) errs.reportedProblem = 'Reported problem description is required.';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveIntake = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      // 1. Resolve or Create Customer
      let customerId = selectedCustomer?.id;
      let finalCustName = selectedCustomer?.fullName || custName.trim();
      let finalCustPhone = selectedCustomer?.phone || custPhone.trim();
      let finalCustEmail = selectedCustomer?.email || custEmail.trim() || undefined;

      if (!selectedCustomer) {
        const createdCust = await createOrUpdateCustomer({
          fullName: finalCustName,
          phone: finalCustPhone,
          email: finalCustEmail,
          address: custAddress.trim() || undefined,
          createdBy: currentUser?.displayName || 'Debasish',
        });
        customerId = createdCust.id;
      }

      // 2. Create Repair Job
      const newJob = await createRepairJob({
        customerId: customerId!,
        customerName: finalCustName,
        customerPhone: finalCustPhone,
        customerEmail: finalCustEmail,
        deviceType,
        brand: brand.trim(),
        model: model.trim(),
        imeiOrSerial: imeiOrSerial.trim() || undefined,
        reportedProblem: reportedProblem.trim(),
        diagnosis: diagnosis.trim() || undefined,
        inspectionNotes: inspectionNotes.trim() || undefined,
        conditionAtIntake: conditionAtIntake.trim() || 'Standard intake condition (normal wear)',
        accessoriesReceived: accessoriesReceived.trim() || 'Handset only (no extra accessories)',
        devicePasscodeOrPattern: devicePasscodeOrPattern.trim() || undefined,
        priority,
        assignedTechnicianId:
          staffList.find((s) => s.displayName === assignedTechnician)?.uid ||
          (assignedTechnician === 'Debasish' ? 'owner_debasish' : 'tech_counter'),
        assignedTechnicianName: assignedTechnician,
        expectedCompletionAt: expectedCompletionAt || undefined,
        createdBy: currentUser?.uid || 'owner_debasish',
        createdByName: currentUser?.displayName || 'Debasish',
      });

      triggerConfetti();
      setCreatedJob(newJob);
      setShowPrintModal(true);
    } catch (err) {
      console.error('Failed to create repair job:', err);
      setErrors({ form: 'An error occurred while saving the repair intake.' });
    } finally {
      setSaving(false);
    }
  };

  // If Job successfully created, display intake completion with print button
  if (createdJob && businessSettings && showPrintModal) {
    return (
      <div className="space-y-6">
        <IntakeSheetPrint
          job={createdJob}
          settings={businessSettings}
          onClose={() => navigate(`/admin/repairs/${createdJob.id}`)}
        />
      </div>
    );
  }

  const matchingCustomers = customerSearch.trim()
    ? allCustomers.filter(
        (c) =>
          c.fullName.toLowerCase().includes(customerSearch.toLowerCase()) ||
          c.phone.includes(customerSearch)
      )
    : [];

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6 max-w-4xl mx-auto"
    >
      {/* Title */}
      <motion.div variants={fadeInUp} className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-brand-navy tracking-tight">
              Counter Repair Intake
            </h1>
            <span className="w-2 h-2 rounded-full bg-brand-orange animate-pulse" />
          </div>
          <p className="text-xs text-brand-secondary mt-0.5">
            Record customer device handoff, condition, symptoms, and generate physical Job Sheet.
          </p>
        </div>
      </motion.div>

      {/* AI Voice Quick Intake Banner */}
      <motion.div
        variants={fadeInUp}
        className="p-5 rounded-3xl bg-gradient-to-r from-brand-navy via-brand-navy-light to-brand-navy text-white border border-brand-orange/30 shadow-lg relative overflow-hidden"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-orange to-brand-orange-dark flex items-center justify-center text-white shadow-glow-orange shrink-0">
              <Mic className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm sm:text-base tracking-tight text-white">
                  Hands-Free Voice Intake Auto-Fill
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-orange text-white uppercase tracking-wider">
                  Auto-Translate
                </span>
              </div>
              <p className="text-xs text-white/80 mt-1">
                Speak in <strong className="text-white">বাংলা</strong>, <strong className="text-white">हिन्दी</strong> or <strong className="text-white">English</strong> &mdash; customer, brand, model, and symptoms will be auto-translated & filled into English!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="glow"
              size="sm"
              onClick={() => openAssistant('jobsheet')}
              leftIcon={<Mic className="w-4 h-4" />}
              className="font-bold shadow-md"
            >
              <span>Speak Intake ({currentVoiceLang.nativeLabel})</span>
            </Button>
          </div>
        </div>
      </motion.div>

      <form onSubmit={handleSaveIntake} className="space-y-6">
        {errors.form && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errors.form}</span>
          </div>
        )}

        {/* STEP 1: CUSTOMER SELECTION / CREATION */}
        <motion.div
          variants={fadeInUp}
          className="bg-white p-6 rounded-3xl border border-brand-border shadow-xs space-y-4"
        >
          <div className="flex items-center justify-between pb-3 border-b border-brand-border">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-brand-orange text-white flex items-center justify-center text-xs font-bold font-mono shadow-xs">
                1
              </span>
              <h2 className="text-xs font-bold text-brand-navy uppercase tracking-wider">
                Customer Information
              </h2>
            </div>
            {selectedCustomer && (
              <button
                type="button"
                onClick={() => {
                  setSelectedCustomer(null);
                  setIsNewCustomer(true);
                }}
                className="text-xs text-brand-orange hover:underline font-semibold"
              >
                Change Customer
              </button>
            )}
          </div>

          {selectedCustomer ? (
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                  Selected Customer:
                </span>
                <span className="font-bold text-sm text-brand-navy block">{selectedCustomer.fullName}</span>
                <span className="text-brand-secondary">{selectedCustomer.phone}</span>
                {selectedCustomer.address && <span> &bull; {selectedCustomer.address}</span>}
              </div>
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Customer Lookup Search */}
              <div className="relative">
                <Input
                  label="Search Existing Customer by Phone or Name"
                  placeholder="Enter 10-digit mobile number or name..."
                  enableVoice
                  value={customerSearch}
                  onChange={(e) => {
                    setCustomerSearch(e.target.value);
                    if (e.target.value.trim().length >= 10 && isValidIndianPhone(e.target.value)) {
                      setCustPhone(e.target.value);
                    }
                  }}
                />

                {matchingCustomers.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-20 bg-white border border-brand-border rounded-2xl shadow-xl mt-1 max-h-48 overflow-y-auto divide-y divide-brand-border">
                    {matchingCustomers.map((cust) => (
                      <div
                        key={cust.id}
                        onClick={() => handleSelectCustomer(cust)}
                        className="p-3 hover:bg-brand-light cursor-pointer text-xs flex justify-between items-center"
                      >
                        <div>
                          <div className="font-bold text-brand-navy">{cust.fullName}</div>
                          <div className="text-brand-secondary">{cust.phone} &bull; {cust.address || 'Dunlop'}</div>
                        </div>
                        <span className="text-[11px] font-bold text-brand-orange">Select</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Or New Customer Fields */}
              <div className="pt-2">
                <span className="text-xs font-bold text-brand-navy block mb-3 uppercase tracking-wider">
                  Or Create New Customer Record:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Customer Full Name *"
                    required={!selectedCustomer}
                    placeholder="e.g. Soumitra Chatterjee"
                    enableVoice
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                    error={errors.custName}
                  />
                  <Input
                    label="Mobile Number *"
                    required={!selectedCustomer}
                    placeholder="10-digit mobile number"
                    enableVoice
                    value={custPhone}
                    onChange={(e) => setCustPhone(e.target.value)}
                    error={errors.custPhone}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                  <Input
                    label="Email Address (Optional)"
                    type="email"
                    placeholder="customer@example.com"
                    value={custEmail}
                    onChange={(e) => setCustEmail(e.target.value)}
                  />
                  <Input
                    label="Locality / Address (Optional)"
                    placeholder="e.g. Saket Nagar, Bonhooghly"
                    enableVoice
                    value={custAddress}
                    onChange={(e) => setCustAddress(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* STEP 2: DEVICE DETAILS */}
        <motion.div
          variants={fadeInUp}
          className="bg-white p-6 rounded-3xl border border-brand-border shadow-xs space-y-4"
        >
          <div className="flex items-center gap-2.5 pb-3 border-b border-brand-border">
            <span className="w-6 h-6 rounded-full bg-brand-orange text-white flex items-center justify-center text-xs font-bold font-mono shadow-xs">
              2
            </span>
            <h2 className="text-xs font-bold text-brand-navy uppercase tracking-wider">
              Device Specifications
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Device Category *"
              required
              value={deviceType}
              onChange={(e) => setDeviceType(e.target.value as DeviceType)}
            >
              <option value="android">Android Phone</option>
              <option value="iphone">iPhone (iOS)</option>
              <option value="other">Other Mobile Device</option>
            </Select>

            <Input
              label="Brand *"
              required
              placeholder="e.g. Samsung, Apple, Redmi, Vivo"
              enableVoice
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              error={errors.brand}
            />

            <Input
              label="Model Name / Number *"
              required
              placeholder="e.g. Galaxy M31, iPhone 13, Note 10"
              enableVoice
              value={model}
              onChange={(e) => setModel(e.target.value)}
              error={errors.model}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Serial Number or IMEI (Optional)"
              placeholder="IMEI / Serial if needed"
              enableVoice
              value={imeiOrSerial}
              onChange={(e) => setImeiOrSerial(e.target.value)}
            />
            <Input
              label="Device Passcode / Pattern (If Provided for Testing)"
              placeholder="PIN or pattern description for bench testing"
              enableVoice
              value={devicePasscodeOrPattern}
              onChange={(e) => setDevicePasscodeOrPattern(e.target.value)}
              helperText="Only recorded with customer permission for post-repair tests"
            />
          </div>
        </motion.div>

        {/* STEP 3: INTAKE CONDITION & ACCESSORIES */}
        <motion.div
          variants={fadeInUp}
          className="bg-white p-6 rounded-3xl border border-brand-border shadow-xs space-y-4"
        >
          <div className="flex items-center gap-2.5 pb-3 border-b border-brand-border">
            <span className="w-6 h-6 rounded-full bg-brand-orange text-white flex items-center justify-center text-xs font-bold font-mono shadow-xs">
              3
            </span>
            <h2 className="text-xs font-bold text-brand-navy uppercase tracking-wider">
              Intake Inspection & Condition
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Physical Condition at Handoff"
              placeholder="e.g. Front glass cracked, back cover scratched, bent frame"
              enableVoice
              value={conditionAtIntake}
              onChange={(e) => setConditionAtIntake(e.target.value)}
              helperText="Documents pre-existing damage prior to shop intake"
            />
            <Input
              label="Accessories Handed Over"
              placeholder="e.g. None (handset only), or SIM tray + back cover"
              enableVoice
              value={accessoriesReceived}
              onChange={(e) => setAccessoriesReceived(e.target.value)}
              helperText="Protects customer items left at the counter"
            />
          </div>
        </motion.div>

        {/* STEP 4: REPORTED ISSUE & DIAGNOSIS */}
        <motion.div
          variants={fadeInUp}
          className="bg-white p-6 rounded-3xl border border-brand-border shadow-xs space-y-4"
        >
          <div className="flex items-center gap-2.5 pb-3 border-b border-brand-border">
            <span className="w-6 h-6 rounded-full bg-brand-orange text-white flex items-center justify-center text-xs font-bold font-mono shadow-xs">
              4
            </span>
            <h2 className="text-xs font-bold text-brand-navy uppercase tracking-wider">
              Symptoms & Workshop Assignment
            </h2>
          </div>

          <Textarea
            label="Reported Problem by Customer *"
            required
            placeholder="e.g. Display shows black screen after drop, phone vibrates when call arrives, customer needs screen replacement..."
            enableVoice
            value={reportedProblem}
            onChange={(e) => setReportedProblem(e.target.value)}
            error={errors.reportedProblem}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Initial Technician Diagnosis (Optional)"
              placeholder="e.g. Display assembly failure, frame checked straight"
              enableVoice
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
            />
            <Input
              label="Counter Inspection Notes (Internal)"
              placeholder="e.g. Customer requested quick quote before 4 PM"
              enableVoice
              value={inspectionNotes}
              onChange={(e) => setInspectionNotes(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <Select
              label="Repair Priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as RepairPriority)}
            >
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent / Emergency</option>
              <option value="low">Low</option>
            </Select>

            <Select
              label="Assigned Technician"
              value={assignedTechnician}
              onChange={(e) => setAssignedTechnician(e.target.value)}
            >
              {staffList.filter(s => s.active).length > 0 ? (
                staffList
                  .filter((s) => s.active)
                  .map((s) => (
                    <option key={s.uid} value={s.displayName}>
                      {s.displayName} ({s.role})
                    </option>
                  ))
              ) : (
                <>
                  <option value="Debasish">Debasish (Owner / Senior Tech)</option>
                  <option value="Workshop Tech">Counter Workshop Bench</option>
                </>
              )}
            </Select>

            <Input
              label="Expected Completion (Optional)"
              type="date"
              value={expectedCompletionAt}
              onChange={(e) => setExpectedCompletionAt(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        </motion.div>

        {/* Submit Bar */}
        <motion.div variants={fadeInUp} className="flex items-center justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/admin/repairs')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="glow"
            size="lg"
            className="font-bold shadow-md"
            isLoading={saving}
            rightIcon={<Printer className="w-4 h-4" />}
          >
            Save Job & Print Intake Sheet
          </Button>
        </motion.div>
      </form>
    </motion.div>
  );
};
