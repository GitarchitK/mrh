import React, { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  CheckCircle2,
  MapPin,
  Phone,
  MessageSquare,
  Shield,
  FileText,
  DollarSign,
  ToggleLeft,
  ToggleRight,
  Mic,
  Languages,
  Sparkles,
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { useVoice } from '../../context/VoiceContext';
import { SUPPORTED_VOICE_LANGUAGES } from '../../services/speechService';
import { updateService } from '../../services/db';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, services, refreshSettings } = useSettings();
  const { activeLanguage, setActiveLanguage, openAssistant } = useVoice();

  const [formSettings, setFormSettings] = useState(settings);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setFormSettings(settings);
  }, [settings]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    try {
      await updateSettings(formSettings);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save settings:', err);
      alert('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleService = async (serviceId: string, currentEnabled: boolean) => {
    await updateService(serviceId, { enabled: !currentEnabled });
    await refreshSettings();
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-brand-navy tracking-tight">
            Business Settings
          </h1>
          <p className="text-xs text-brand-secondary mt-0.5">
            Configure shop information, verified phone numbers, address, and service catalog toggles.
          </p>
        </div>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-800">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-bold">Settings saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-8">
        {/* Section 1: Business Identity */}
        <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-xs space-y-4">
          <h2 className="text-xs font-bold text-brand-navy uppercase tracking-wider pb-2 border-b border-brand-border">
            1. Business Profile & Contact Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Business Name *"
              required
              value={formSettings.businessName}
              onChange={(e) => setFormSettings({ ...formSettings, businessName: e.target.value })}
            />
            <Input
              label="Owner / Contact Name *"
              required
              value={formSettings.ownerContactName}
              onChange={(e) => setFormSettings({ ...formSettings, ownerContactName: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Primary Phone Number *"
              required
              value={formSettings.phone}
              onChange={(e) => setFormSettings({ ...formSettings, phone: e.target.value })}
            />
            <Input
              label="WhatsApp Number *"
              required
              value={formSettings.whatsapp}
              onChange={(e) => setFormSettings({ ...formSettings, whatsapp: e.target.value })}
            />
          </div>

          <Textarea
            label="Full Physical Address *"
            required
            value={formSettings.fullAddress}
            onChange={(e) => setFormSettings({ ...formSettings, fullAddress: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Google Maps Plus Code"
              value={formSettings.plusCode}
              onChange={(e) => setFormSettings({ ...formSettings, plusCode: e.target.value })}
            />
            <Input
              label="Google Maps Search / Navigation URL"
              value={formSettings.googleMapsUrl}
              onChange={(e) => setFormSettings({ ...formSettings, googleMapsUrl: e.target.value })}
            />
          </div>
        </div>

        {/* Section 2: Website Announcement Bar */}
        <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-brand-border">
            <h2 className="text-xs font-bold text-brand-navy uppercase tracking-wider">
              2. Announcement Bar Notice
            </h2>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-brand-navy">
              <input
                type="checkbox"
                checked={formSettings.noticeBarActive}
                onChange={(e) => setFormSettings({ ...formSettings, noticeBarActive: e.target.checked })}
                className="rounded border-brand-border text-brand-orange focus:ring-brand-orange"
              />
              <span>Display on Public Website</span>
            </label>
          </div>

          <Input
            label="Announcement Message Text"
            value={formSettings.noticeBarText}
            onChange={(e) => setFormSettings({ ...formSettings, noticeBarText: e.target.value })}
            helperText="Appears at the very top of all public pages"
          />
        </div>

        {/* Section 3: Enabled Services Catalog */}
        <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-xs space-y-4">
          <h2 className="text-xs font-bold text-brand-navy uppercase tracking-wider pb-2 border-b border-brand-border">
            3. Active Repair Services Catalog (Admin Toggle)
          </h2>
          <p className="text-xs text-brand-secondary">
            Only services toggled &quot;Active&quot; will be displayed to customers on the public website.
          </p>

          <div className="divide-y divide-brand-border border border-brand-border rounded-xl overflow-hidden text-xs">
            {services.map((srv) => (
              <div key={srv.id} className="p-3.5 flex items-center justify-between bg-white hover:bg-brand-light/30">
                <div>
                  <div className="font-bold text-brand-navy">{srv.title}</div>
                  <div className="text-[11px] text-brand-secondary">{srv.category}</div>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleService(srv.id, srv.enabled)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                    srv.enabled
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-slate-100 text-slate-500 border border-slate-300'
                  }`}
                >
                  {srv.enabled ? <ToggleRight className="w-4 h-4 text-emerald-600" /> : <ToggleLeft className="w-4 h-4 text-slate-400" />}
                  <span>{srv.enabled ? 'Enabled' : 'Disabled'}</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Terms & Policies */}
        <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-xs space-y-4">
          <h2 className="text-xs font-bold text-brand-navy uppercase tracking-wider pb-2 border-b border-brand-border">
            4. Repair Policies & Warranty Terms
          </h2>

          <Textarea
            label="Counter Terms & Conditions (Appears on Intake Sheets)"
            rows={4}
            value={formSettings.termsAndConditions}
            onChange={(e) => setFormSettings({ ...formSettings, termsAndConditions: e.target.value })}
          />

          <Textarea
            label="Default Warranty Policy (Appears on Customer Invoices)"
            rows={3}
            value={formSettings.warrantyPolicyDefault}
            onChange={(e) => setFormSettings({ ...formSettings, warrantyPolicyDefault: e.target.value })}
          />
        </div>

        {/* Section 5: Voice Typing & Multi-Lingual Auto-Translate */}
        <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-brand-border">
            <div className="flex items-center gap-2">
              <Mic className="w-4 h-4 text-brand-orange" />
              <h2 className="text-xs font-bold text-brand-navy uppercase tracking-wider">
                5. Voice Typing & Multi-lingual Auto-Translate Configuration
              </h2>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-orange/10 text-brand-orange">
              AI Powered
            </span>
          </div>

          <p className="text-xs text-brand-secondary">
            Rajib da Mobile Repairing House is situated in Dunlop, West Bengal where walk-in customers and staff speak in Bengali (বাংলা), Hindi (हिन्दी), or English. Voice input recognizes spoken audio in any of these three languages and automatically translates and structures it into standardized English CRM records.
          </p>

          <div>
            <label className="block text-xs font-semibold text-brand-navy uppercase tracking-wider mb-2">
              Default Spoken Language for Counter Microphones
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {SUPPORTED_VOICE_LANGUAGES.map((lang) => (
                <div
                  key={lang.code}
                  onClick={() => setActiveLanguage(lang.code)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    activeLanguage === lang.code
                      ? 'border-brand-orange bg-brand-orange/5 ring-1 ring-brand-orange/30'
                      : 'border-brand-border hover:bg-brand-light'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{lang.flag}</span>
                    <div>
                      <div className="font-bold text-sm text-brand-navy leading-tight">{lang.nativeLabel}</div>
                      <div className="text-[11px] text-brand-secondary">{lang.label}</div>
                    </div>
                  </div>
                  {activeLanguage === lang.code && (
                    <CheckCircle2 className="w-4 h-4 text-brand-orange shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between p-3.5 rounded-xl bg-brand-light border border-brand-border">
            <div>
              <span className="text-xs font-bold text-brand-navy block">Test Counter Voice Assistant</span>
              <span className="text-[11px] text-brand-secondary">
                Verify microphone permissions and speech auto-translation into English.
              </span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              leftIcon={<Mic className="w-3.5 h-3.5 text-brand-orange" />}
              onClick={() => openAssistant()}
            >
              Open Voice Assistant
            </Button>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="font-bold shadow-md"
            isLoading={saving}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save All Settings
          </Button>
        </div>
      </form>
    </div>
  );
};
