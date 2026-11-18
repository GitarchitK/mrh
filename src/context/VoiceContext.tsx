import React, { createContext, useContext, useState, useCallback, useRef, useMemo } from 'react';
import { VoiceLanguage } from '../services/speechService';
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
  onApplyJobsheetData?: (data: ParsedJobsheetData) => boolean;
  registerJobsheetHandler: (handler: (data: ParsedJobsheetData) => void) => () => void;

  onApplyStockData?: (data: ParsedStockData) => boolean;
  registerStockHandler: (handler: (data: ParsedStockData) => void) => () => void;

  onApplyInvoiceData?: (data: ParsedInvoiceData) => boolean;
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

  // Page handlers registry using stable refs to prevent re-render cascading
  const jobsheetHandlerRef = useRef<((data: ParsedJobsheetData) => void) | null>(null);
  const stockHandlerRef = useRef<((data: ParsedStockData) => void) | null>(null);
  const invoiceHandlerRef = useRef<((data: ParsedInvoiceData) => void) | null>(null);

  const setActiveLanguage = useCallback((lang: VoiceLanguage) => {
    setActiveLanguageState(lang);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, lang);
    } catch (e) {
      // Ignored
    }
  }, []);

  const openAssistant = useCallback((mode: VoiceAssistantMode = 'jobsheet') => {
    setAssistantMode(mode);
    setIsAssistantOpen(true);
  }, []);

  const closeAssistant = useCallback(() => {
    setIsAssistantOpen(false);
  }, []);

  const registerJobsheetHandler = useCallback((handler: (data: ParsedJobsheetData) => void) => {
    jobsheetHandlerRef.current = handler;
    return () => {
      if (jobsheetHandlerRef.current === handler) {
        jobsheetHandlerRef.current = null;
      }
    };
  }, []);

  const registerStockHandler = useCallback((handler: (data: ParsedStockData) => void) => {
    stockHandlerRef.current = handler;
    return () => {
      if (stockHandlerRef.current === handler) {
        stockHandlerRef.current = null;
      }
    };
  }, []);

  const registerInvoiceHandler = useCallback((handler: (data: ParsedInvoiceData) => void) => {
    invoiceHandlerRef.current = handler;
    return () => {
      if (invoiceHandlerRef.current === handler) {
        invoiceHandlerRef.current = null;
      }
    };
  }, []);

  const onApplyJobsheetData = useCallback((data: ParsedJobsheetData): boolean => {
    if (jobsheetHandlerRef.current) {
      jobsheetHandlerRef.current(data);
      return true;
    }
    return false;
  }, []);

  const onApplyStockData = useCallback((data: ParsedStockData): boolean => {
    if (stockHandlerRef.current) {
      stockHandlerRef.current(data);
      return true;
    }
    return false;
  }, []);

  const onApplyInvoiceData = useCallback((data: ParsedInvoiceData): boolean => {
    if (invoiceHandlerRef.current) {
      invoiceHandlerRef.current(data);
      return true;
    }
    return false;
  }, []);

  const contextValue = useMemo(
    () => ({
      activeLanguage,
      setActiveLanguage,
      isAssistantOpen,
      openAssistant,
      closeAssistant,
      assistantMode,
      setAssistantMode,
      onApplyJobsheetData,
      registerJobsheetHandler,
      onApplyStockData,
      registerStockHandler,
      onApplyInvoiceData,
      registerInvoiceHandler,
    }),
    [
      activeLanguage,
      setActiveLanguage,
      isAssistantOpen,
      openAssistant,
      closeAssistant,
      assistantMode,
      onApplyJobsheetData,
      registerJobsheetHandler,
      onApplyStockData,
      registerStockHandler,
      onApplyInvoiceData,
      registerInvoiceHandler,
    ]
  );

  return <VoiceContext.Provider value={contextValue}>{children}</VoiceContext.Provider>;
};

export const useVoice = () => {
  const context = useContext(VoiceContext);
  if (!context) {
    throw new Error('useVoice must be used within a VoiceProvider');
  }
  return context;
};
