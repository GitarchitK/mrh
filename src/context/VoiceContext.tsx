import React, { createContext, useContext, useState, useEffect } from 'react';
import { VoiceLanguage, SUPPORTED_VOICE_LANGUAGES } from '../services/speechService';
import { ParsedJobsheetData, ParsedStockData, ParsedInvoiceData } from '../services/voiceFormParser';

export type VoiceAssistantMode = 'jobsheet' | 'inventory' | 'billing' | 'dictation';

interface VoiceContextType {
  activeLanguage: VoiceLanguage;
  setActiveLanguage: (lang: VoiceLanguage) => void;
  isAssistantOpen: boolean;
  openAssistant: (mode?: VoiceAssistantMode) => void;
  closeAssistant: () => void;
  assistantMode: VoiceAssistantMode;
  setAssistantMode: (mode: VoiceAssistantMode) => void;
  
  // Registration and event dispatch for active pages to receive filled data
  onApplyJobsheetData?: (data: ParsedJobsheetData) => void;
  registerJobsheetHandler: (handler: (data: ParsedJobsheetData) => void) => () => void;
  
  onApplyStockData?: (data: ParsedStockData) => void;
  registerStockHandler: (handler: (data: ParsedStockData) => void) => () => void;

  onApplyInvoiceData?: (data: ParsedInvoiceData) => void;
  registerInvoiceHandler: (handler: (data: ParsedInvoiceData) => void) => () => void;
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'mrh_voice_language';

export const VoiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeLanguage, setActiveLanguageState] = useState<VoiceLanguage>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY) as VoiceLanguage;
      if (saved && (saved === 'bn-IN' || saved === 'hi-IN' || saved === 'en-IN')) {
        return saved;
      }
    } catch (e) {
      // Ignored
    }
    return 'bn-IN'; // Default to Bengali as shop is in Dunlop / WB
  });

  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [assistantMode, setAssistantMode] = useState<VoiceAssistantMode>('jobsheet');

  // Page handlers registry
  const [jobsheetHandler, setJobsheetHandler] = useState<((data: ParsedJobsheetData) => void) | null>(null);
  const [stockHandler, setStockHandler] = useState<((data: ParsedStockData) => void) | null>(null);
  const [invoiceHandler, setInvoiceHandler] = useState<((data: ParsedInvoiceData) => void) | null>(null);

  const setActiveLanguage = (lang: VoiceLanguage) => {
    setActiveLanguageState(lang);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, lang);
    } catch (e) {
      // Ignored
    }
  };

  const openAssistant = (mode: VoiceAssistantMode = 'jobsheet') => {
    setAssistantMode(mode);
    setIsAssistantOpen(true);
  };

  const closeAssistant = () => {
    setIsAssistantOpen(false);
  };

  const registerJobsheetHandler = (handler: (data: ParsedJobsheetData) => void) => {
    setJobsheetHandler(() => handler);
    return () => setJobsheetHandler(null);
  };

  const registerStockHandler = (handler: (data: ParsedStockData) => void) => {
    setStockHandler(() => handler);
    return () => setStockHandler(null);
  };

  const registerInvoiceHandler = (handler: (data: ParsedInvoiceData) => void) => {
    setInvoiceHandler(() => handler);
    return () => setInvoiceHandler(null);
  };

  return (
    <VoiceContext.Provider
      value={{
        activeLanguage,
        setActiveLanguage,
        isAssistantOpen,
        openAssistant,
        closeAssistant,
        assistantMode,
        setAssistantMode,
        onApplyJobsheetData: jobsheetHandler || undefined,
        registerJobsheetHandler,
        onApplyStockData: stockHandler || undefined,
        registerStockHandler,
        onApplyInvoiceData: invoiceHandler || undefined,
        registerInvoiceHandler,
      }}
    >
      {children}
    </VoiceContext.Provider>
  );
};

export const useVoice = () => {
  const context = useContext(VoiceContext);
  if (!context) {
    throw new Error('useVoice must be used within a VoiceProvider');
  }
  return context;
};
