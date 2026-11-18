import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mic,
  MicOff,
  Sparkles,
  X,
  Volume2,
  CheckCircle2,
  Copy,
  ArrowRight,
  RefreshCw,
  Languages,
  Smartphone,
  Package,
  FileText,
  AlertCircle,
  HelpCircle,
  Check,
  Send,
} from 'lucide-react';
import { useVoice, VoiceAssistantMode } from '../../context/VoiceContext';
import { SpeechRecognitionSession, isSpeechRecognitionSupported, SUPPORTED_VOICE_LANGUAGES, VoiceLanguage } from '../../services/speechService';
import { translateToEnglish, TranslationResult } from '../../services/translationService';
import {
  parseJobsheetVoice,
  parseStockVoice,
  parseInvoiceVoice,
  ParsedJobsheetData,
  ParsedStockData,
  ParsedInvoiceData,
} from '../../services/voiceFormParser';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';

export const VoiceCounterAssistantModal: React.FC = () => {
  const navigate = useNavigate();
  const {
    isAssistantOpen,
    closeAssistant,
    assistantMode,
    setAssistantMode,
    activeLanguage,
    setActiveLanguage,
    onApplyJobsheetData,
    onApplyStockData,
    onApplyInvoiceData,
  } = useVoice();

  const [isListening, setIsListening] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [spokenRawText, setSpokenRawText] = useState('');
  const [interimText, setInterimText] = useState('');
  const [translatedEnglish, setTranslatedEnglish] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Parsed structured data
  const [parsedJobsheet, setParsedJobsheet] = useState<ParsedJobsheetData | null>(null);
  const [parsedStock, setParsedStock] = useState<ParsedStockData | null>(null);
  const [parsedInvoice, setParsedInvoice] = useState<ParsedInvoiceData | null>(null);

  const sessionRef = useRef<SpeechRecognitionSession | null>(null);
  const isSupported = isSpeechRecognitionSupported();

  // Reset state when mode changes
  useEffect(() => {
    if (isAssistantOpen) {
      setErrorMessage(null);
    } else {
      if (sessionRef.current) {
        sessionRef.current.stop();
      }
      setIsListening(false);
    }
  }, [isAssistantOpen, assistantMode]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (sessionRef.current) {
        sessionRef.current.stop();
      }
    };
  }, []);

  const handleProcessText = async (text: string) => {
    if (!text.trim()) return;
    setIsTranslating(true);
    setErrorMessage(null);

    try {
      const result = await translateToEnglish(text, activeLanguage);
      setTranslatedEnglish(result.translatedText);

      // Parse depending on active mode
      if (assistantMode === 'jobsheet') {
        const parsed = parseJobsheetVoice(result.translatedText);
        setParsedJobsheet(parsed);
      } else if (assistantMode === 'inventory') {
        const parsed = parseStockVoice(result.translatedText);
        setParsedStock(parsed);
      } else if (assistantMode === 'billing') {
        const parsed = parseInvoiceVoice(result.translatedText);
        setParsedInvoice(parsed);
      }
    } catch (err) {
      console.error('Translation / parsing error:', err);
      setErrorMessage('Failed to translate speech. Please try again.');
    } finally {
      setIsTranslating(false);
    }
  };

  const startListening = () => {
    setErrorMessage(null);
    setInterimText('');
    setSpokenRawText('');
    setTranslatedEnglish('');
    setParsedJobsheet(null);
    setParsedStock(null);
    setParsedInvoice(null);

    if (!isSupported) {
      setErrorMessage('Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
      return;
    }

    const session = new SpeechRecognitionSession(activeLanguage, false);
    sessionRef.current = session;

    session.start({
      onStart: () => {
        setIsListening(true);
      },
      onInterim: (text) => {
        setInterimText(text);
      },
      onFinal: async (finalText) => {
        setIsListening(false);
        setSpokenRawText(finalText);
        setInterimText('');
        await handleProcessText(finalText);
      },
      onError: (err) => {
        setIsListening(false);
        setErrorMessage(err);
      },
      onEnd: () => {
        setIsListening(false);
      },
    });
  };

  const stopListening = () => {
    if (sessionRef.current) {
      sessionRef.current.stop();
    }
    setIsListening(false);
  };

  const handleApplyToForm = () => {
    if (assistantMode === 'jobsheet') {
      const applied = onApplyJobsheetData && parsedJobsheet ? onApplyJobsheetData(parsedJobsheet) : false;
      if (applied) {
        closeAssistant();
      } else {
        // Navigate to Repair Intake with query params
        const params = new URLSearchParams();
        if (parsedJobsheet?.customerName) params.set('name', parsedJobsheet.customerName);
        if (parsedJobsheet?.customerPhone) params.set('phone', parsedJobsheet.customerPhone);
        if (parsedJobsheet?.brand) params.set('brand', parsedJobsheet.brand);
        if (parsedJobsheet?.model) params.set('model', parsedJobsheet.model);
        if (parsedJobsheet?.deviceType) params.set('deviceType', parsedJobsheet.deviceType);
        if (parsedJobsheet?.reportedProblem) params.set('problem', parsedJobsheet.reportedProblem);
        closeAssistant();
        navigate(`/admin/repairs/new?${params.toString()}`);
      }
    } else if (assistantMode === 'inventory') {
      const applied = onApplyStockData && parsedStock ? onApplyStockData(parsedStock) : false;
      if (applied) {
        closeAssistant();
      } else {
        closeAssistant();
        navigate('/admin/inventory');
      }
    } else if (assistantMode === 'billing') {
      const applied = onApplyInvoiceData && parsedInvoice ? onApplyInvoiceData(parsedInvoice) : false;
      if (applied) {
        closeAssistant();
      } else {
        const params = new URLSearchParams();
        if (parsedInvoice?.customerName) params.set('name', parsedInvoice.customerName);
        if (parsedInvoice?.customerPhone) params.set('phone', parsedInvoice.customerPhone);
        closeAssistant();
        navigate(`/admin/invoices?${params.toString()}`);
      }
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Sample phrases for quick testing or demonstration
  const samplePhrases: Record<VoiceAssistantMode, { lang: VoiceLanguage; text: string; label: string }[]> = {
    jobsheet: [
      {
        lang: 'bn-IN',
        label: 'বাংলা (Bengali)',
        text: 'কাস্টমার সুব্রত দে ফোন ৯৮৩১০১১২২৩ স্যামসাং এম৩১ ডিসপ্লে ভেঙে গেছে টাচ কাজ করছে না আর ব্যাটারি ব্যাকআপ কম',
      },
      {
        lang: 'hi-IN',
        label: 'हिन्दी (Hindi)',
        text: 'ग्राहक राहुल शर्मा फोन 9876543210 रेडमी नोट 10 प्रो डिस्प्ले खराब है और चार्जिंग पिन ढीला है',
      },
      {
        lang: 'en-IN',
        label: 'English',
        text: 'Customer Bikash Das phone 9830098300 iPhone 13 cracked screen urgent priority',
      },
    ],
    inventory: [
      {
        lang: 'bn-IN',
        label: 'বাংলা (Bengali)',
        text: 'নতুন স্টক স্যামসাং এম৩১ অরিজিনাল ডিসপ্লে ব্র্যান্ড স্যামসাং কোয়ান্টিটি ১০ কেনা বারোশো বিক্রি সতেরশো',
      },
      {
        lang: 'hi-IN',
        label: 'हिन्दी (Hindi)',
        text: 'नया स्टॉक वीवो वी20 डिस्प्ले फोल्डर ब्रांड वीवो क्वांटिटी 5 खरीद 1100 बिक्री 1600',
      },
      {
        lang: 'en-IN',
        label: 'English',
        text: 'New product iPhone 12 original battery brand Apple quantity 8 cost 1400 selling 2200',
      },
    ],
    billing: [
      {
        lang: 'bn-IN',
        label: 'বাংলা (Bengali)',
        text: 'কাস্টমার বিকাশ দাস ফোন ৯৮৩০০১২৩৪৫ ডিসপ্লে চেঞ্জ পনেরশো টাকা এবং ফিটিং লেবার চার্জ আড়াইশো টাকা',
      },
      {
        lang: 'hi-IN',
        label: 'हिन्दी (Hindi)',
        text: 'ग्राहक रोहित सेन फोन 9876543210 स्क्रीन रिप्लेसमेंट 1600 टेम्पर्ड ग्लास 150 डिस्काउंट 50',
      },
      {
        lang: 'en-IN',
        label: 'English',
        text: 'Customer Joy Paul phone 9831122334 iPhone screen replacement 2200 labour 350 discount 100',
      },
    ],
    dictation: [
      {
        lang: 'bn-IN',
        label: 'বাংলা (Bengali)',
        text: 'মাদারবোর্ড শর্ট আছে এবং পাওয়ার আইসি পরিবর্তন করতে হবে',
      },
      {
        lang: 'hi-IN',
        label: 'हिन्दी (Hindi)',
        text: 'चार्जिंग आईसी खराब है और वाटर डैमेज की वजह से क्लीनिंग चाहिए',
      },
      {
        lang: 'en-IN',
        label: 'English',
        text: 'Motherboard short circuit detected and needs ultrasonic cleaning',
      },
    ],
  };

  if (!isAssistantOpen) return null;

  const currentLangObj = SUPPORTED_VOICE_LANGUAGES.find((l) => l.code === activeLanguage) || SUPPORTED_VOICE_LANGUAGES[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-brand-navy/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-brand-border w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-brand-navy via-brand-navy to-brand-navy-light text-white flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-orange flex items-center justify-center text-white shadow-glow-orange">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black tracking-tight">Voice Counter Assistant</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white uppercase tracking-wider">
                  AI Auto-Translate
                </span>
              </div>
              <p className="text-xs text-white/70">
                Speak in Bengali (বাংলা), Hindi (हिन्दी), or English &mdash; Auto-fills in English
              </p>
            </div>
          </div>
          <button
            onClick={closeAssistant}
            className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="px-6 pt-3 pb-2 bg-brand-light/70 border-b border-brand-border flex items-center gap-1.5 overflow-x-auto">
          <button
            type="button"
            onClick={() => setAssistantMode('jobsheet')}
            className={cn(
              'px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0',
              assistantMode === 'jobsheet'
                ? 'bg-brand-navy text-white shadow-xs'
                : 'text-brand-secondary hover:text-brand-navy hover:bg-brand-navy/5'
            )}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Jobsheet Intake</span>
          </button>
          <button
            type="button"
            onClick={() => setAssistantMode('inventory')}
            className={cn(
              'px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0',
              assistantMode === 'inventory'
                ? 'bg-brand-navy text-white shadow-xs'
                : 'text-brand-secondary hover:text-brand-navy hover:bg-brand-navy/5'
            )}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Stocks / Parts</span>
          </button>
          <button
            type="button"
            onClick={() => setAssistantMode('billing')}
            className={cn(
              'px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0',
              assistantMode === 'billing'
                ? 'bg-brand-navy text-white shadow-xs'
                : 'text-brand-secondary hover:text-brand-navy hover:bg-brand-navy/5'
            )}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Billing / Invoices</span>
          </button>
          <button
            type="button"
            onClick={() => setAssistantMode('dictation')}
            className={cn(
              'px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0',
              assistantMode === 'dictation'
                ? 'bg-brand-navy text-white shadow-xs'
                : 'text-brand-secondary hover:text-brand-navy hover:bg-brand-navy/5'
            )}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Free Dictation</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Spoken Language Selector Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-2xl bg-brand-light border border-brand-border">
            <div className="flex items-center gap-2">
              <Languages className="w-4 h-4 text-brand-orange shrink-0" />
              <span className="text-xs font-bold text-brand-navy">Select Spoken Language:</span>
            </div>
            <div className="flex items-center gap-1.5">
              {SUPPORTED_VOICE_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    setActiveLanguage(lang.code);
                    if (sessionRef.current && isListening) {
                      sessionRef.current.setLanguage(lang.code);
                    }
                  }}
                  className={cn(
                    'px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border',
                    activeLanguage === lang.code
                      ? 'bg-white border-brand-orange text-brand-orange shadow-xs ring-1 ring-brand-orange/20'
                      : 'bg-white/50 border-brand-border text-brand-secondary hover:text-brand-navy hover:bg-white'
                  )}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.nativeLabel}</span>
                  <span className="text-[10px] opacity-70 hidden sm:inline">({lang.label.split(' ')[0]})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Microphone Central Zone */}
          <div className="flex flex-col items-center justify-center p-6 rounded-3xl bg-gradient-to-b from-brand-light/50 to-white border border-brand-border relative overflow-hidden text-center">
            {/* Ambient Animated Rings when listening */}
            {isListening && (
              <>
                <div className="absolute w-44 h-44 rounded-full bg-rose-400/15 animate-ping pointer-events-none" />
                <div className="absolute w-32 h-32 rounded-full bg-rose-500/20 animate-pulse pointer-events-none" />
              </>
            )}

            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              className={cn(
                'relative w-20 h-20 rounded-full flex items-center justify-center text-white transition-all transform shadow-xl focus:outline-none z-10',
                isListening
                  ? 'bg-rose-500 scale-105 shadow-rose-300 ring-4 ring-rose-400/50'
                  : 'bg-gradient-to-br from-brand-orange to-brand-orange-dark hover:scale-105 shadow-glow-orange'
              )}
            >
              {isListening ? (
                <Mic className="w-8 h-8 animate-bounce" />
              ) : (
                <Mic className="w-8 h-8" />
              )}
            </button>

            <div className="mt-4">
              <span className="text-xs font-black uppercase tracking-wider block text-brand-navy">
                {isListening ? (
                  <span className="text-rose-600 flex items-center justify-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
                    Listening in {currentLangObj.nativeLabel}... Click to Stop
                  </span>
                ) : isTranslating ? (
                  <span className="text-amber-600 flex items-center justify-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Translating & Structuring into English...
                  </span>
                ) : (
                  <span>Click Mic & Speak in {currentLangObj.nativeLabel}</span>
                )}
              </span>
              <p className="text-[11px] text-brand-secondary mt-0.5">
                Our AI converts Bengali, Hindi, or English speech into clean English counter forms
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mt-3 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2 max-w-md">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>

          {/* Real-time Spoken Text & Translation Box */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Spoken Language Box */}
            <div className="p-4 rounded-2xl bg-brand-light/60 border border-brand-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-secondary flex items-center gap-1.5">
                  <span>{currentLangObj.flag}</span>
                  <span>Spoken Voice ({currentLangObj.nativeLabel})</span>
                </span>
                {isListening && (
                  <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 flex items-center gap-1 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                    Live
                  </span>
                )}
              </div>
              <div className="min-h-[70px] text-xs text-brand-navy font-medium bg-white p-3 rounded-xl border border-brand-border/60">
                {isListening && interimText ? (
                  <span className="text-brand-orange italic font-mono">{interimText}</span>
                ) : spokenRawText ? (
                  <span>{spokenRawText}</span>
                ) : (
                  <span className="text-brand-secondary/60 italic">
                    Spoken words in {currentLangObj.nativeLabel} will appear here...
                  </span>
                )}
              </div>
            </div>

            {/* English Auto-Translation Box */}
            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                  <span>🇬🇧</span>
                  <span>Auto-Translated English (CRM)</span>
                </span>
                {translatedEnglish && (
                  <button
                    type="button"
                    onClick={() => copyToClipboard(translatedEnglish)}
                    className="text-[10px] text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1"
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                )}
              </div>
              <div className="min-h-[70px] text-xs text-emerald-950 font-medium bg-white p-3 rounded-xl border border-emerald-200">
                {isTranslating ? (
                  <span className="text-amber-600 italic flex items-center gap-1.5">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    Translating into English...
                  </span>
                ) : translatedEnglish ? (
                  <span>{translatedEnglish}</span>
                ) : (
                  <span className="text-emerald-800/40 italic">
                    Translated English CRM text will appear here...
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Structured Field Extracted Preview */}
          {assistantMode === 'jobsheet' && parsedJobsheet && (
            <div className="p-4 rounded-2xl bg-white border border-brand-border shadow-xs space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-brand-border pb-2">
                <span className="text-xs font-black uppercase tracking-wider text-brand-navy flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Extracted Jobsheet Fields
                </span>
                <span className="text-[11px] font-bold text-brand-orange bg-brand-orange/10 px-2 py-0.5 rounded-full">
                  Priority: {parsedJobsheet.priority?.toUpperCase() || 'NORMAL'}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-brand-light border border-brand-border/60">
                  <span className="text-[10px] font-bold text-brand-secondary block uppercase">Customer</span>
                  <span className="font-bold text-brand-navy">{parsedJobsheet.customerName || '—'}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-brand-light border border-brand-border/60">
                  <span className="text-[10px] font-bold text-brand-secondary block uppercase">Mobile</span>
                  <span className="font-bold text-brand-navy">{parsedJobsheet.customerPhone || '—'}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-brand-light border border-brand-border/60">
                  <span className="text-[10px] font-bold text-brand-secondary block uppercase">Device Brand & Model</span>
                  <span className="font-bold text-brand-navy">
                    {parsedJobsheet.brand || ''} {parsedJobsheet.model || '—'}
                  </span>
                </div>
                <div className="col-span-2 sm:col-span-3 p-2.5 rounded-xl bg-brand-light border border-brand-border/60">
                  <span className="text-[10px] font-bold text-brand-secondary block uppercase">Reported Problem</span>
                  <span className="font-bold text-brand-navy">{parsedJobsheet.reportedProblem || '—'}</span>
                </div>
              </div>
            </div>
          )}

          {assistantMode === 'inventory' && parsedStock && (
            <div className="p-4 rounded-2xl bg-white border border-brand-border shadow-xs space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-brand-border pb-2">
                <span className="text-xs font-black uppercase tracking-wider text-brand-navy flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Extracted Stock / Part Fields
                </span>
                <span className="text-[11px] font-bold text-brand-navy bg-brand-navy/10 px-2 py-0.5 rounded-full capitalize">
                  Category: {parsedStock.category || 'General'}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="col-span-2 p-2.5 rounded-xl bg-brand-light border border-brand-border/60">
                  <span className="text-[10px] font-bold text-brand-secondary block uppercase">Product Name</span>
                  <span className="font-bold text-brand-navy">{parsedStock.name || '—'}</span>
                  {parsedStock.brand && (
                    <span className="inline-block mt-1 mr-2 px-1.5 py-0.5 rounded bg-brand-navy/10 text-[10px] font-semibold text-brand-navy">
                      Brand: {parsedStock.brand}
                    </span>
                  )}
                  {parsedStock.serialNumber && (
                    <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-mono font-semibold">
                      S/N: {parsedStock.serialNumber}
                    </span>
                  )}
                </div>
                <div className="p-2.5 rounded-xl bg-brand-light border border-brand-border/60">
                  <span className="text-[10px] font-bold text-brand-secondary block uppercase">Quantity</span>
                  <span className="font-bold text-brand-navy">{parsedStock.quantity ?? 1} pcs</span>
                </div>
                <div className="p-2.5 rounded-xl bg-brand-light border border-brand-border/60">
                  <span className="text-[10px] font-bold text-brand-secondary block uppercase">Selling Price</span>
                  <span className="font-bold text-emerald-700">₹{parsedStock.sellingRupees || '0'}</span>
                </div>
              </div>
            </div>
          )}

          {assistantMode === 'billing' && parsedInvoice && (
            <div className="p-4 rounded-2xl bg-white border border-brand-border shadow-xs space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-brand-border pb-2">
                <span className="text-xs font-black uppercase tracking-wider text-brand-navy flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Extracted Invoice Items
                </span>
                {parsedInvoice.customerName && (
                  <span className="text-[11px] font-bold text-brand-navy">
                    Customer: {parsedInvoice.customerName}
                  </span>
                )}
              </div>
              <div className="space-y-1.5 text-xs">
                {parsedInvoice.items.map((it, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-brand-light border border-brand-border/60">
                    <span className="font-medium text-brand-navy">{it.description}</span>
                    <span className="font-bold text-emerald-700">₹{it.unitPriceRupees}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Clickable Testing / Sample Phrases */}
          <div className="space-y-2 pt-2 border-t border-brand-border">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-secondary block">
              Quick Test Examples (Click to simulate speaking):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {samplePhrases[assistantMode].map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={async () => {
                    setActiveLanguage(sample.lang);
                    setSpokenRawText(sample.text);
                    await handleProcessText(sample.text);
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-brand-light hover:bg-brand-navy hover:text-white border border-brand-border text-[11px] text-brand-navy font-medium text-left transition-all"
                >
                  <span className="font-bold text-brand-orange mr-1">[{sample.label}]</span>
                  <span className="truncate max-w-xs">{sample.text.substring(0, 45)}...</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 bg-brand-light border-t border-brand-border flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={closeAssistant}>
            Cancel
          </Button>

          <div className="flex items-center gap-2">
            {(translatedEnglish || parsedJobsheet || parsedStock || parsedInvoice) && (
              <Button
                variant="glow"
                size="sm"
                onClick={handleApplyToForm}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                {assistantMode === 'jobsheet'
                  ? 'Apply to Jobsheet'
                  : assistantMode === 'inventory'
                  ? 'Apply to Stock'
                  : assistantMode === 'billing'
                  ? 'Apply to Invoice'
                  : 'Apply Dictation'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
