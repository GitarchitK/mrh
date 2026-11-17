import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Loader2, Globe, Check, AlertCircle } from 'lucide-react';
import { SpeechRecognitionSession, isSpeechRecognitionSupported, VoiceLanguage, SUPPORTED_VOICE_LANGUAGES } from '../../services/speechService';
import { translateToEnglish } from '../../services/translationService';
import { useVoice } from '../../context/VoiceContext';
import { cn } from '../../lib/utils';

export interface VoiceInputButtonProps {
  onTranscript: (englishText: string, originalText?: string) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  mode?: 'append' | 'replace';
  currentValue?: string;
  placeholder?: string;
}

export const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({
  onTranscript,
  className,
  size = 'sm',
  mode = 'replace',
  currentValue = '',
}) => {
  const { activeLanguage, setActiveLanguage } = useVoice();
  const [isListening, setIsListening] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const sessionRef = useRef<SpeechRecognitionSession | null>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);

  const isSupported = isSpeechRecognitionSupported();

  useEffect(() => {
    // Close lang menu on outside click
    const handleClickOutside = (e: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setShowLangMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (sessionRef.current) {
        sessionRef.current.stop();
      }
    };
  }, []);

  const startListening = () => {
    setErrorMessage(null);
    setInterimText('');

    if (!isSupported) {
      setErrorMessage('Speech recognition not supported in this browser. Please use Chrome or Edge.');
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
      onFinal: async (finalSpokenText) => {
        setIsListening(false);
        setIsTranslating(true);
        try {
          const result = await translateToEnglish(finalSpokenText, activeLanguage);
          let finalText = result.translatedText;
          if (mode === 'append' && currentValue.trim()) {
            finalText = `${currentValue.trim()} ${finalText}`;
          }
          onTranscript(finalText, result.originalText);
        } catch (err) {
          console.error('Translation error:', err);
          onTranscript(finalSpokenText, finalSpokenText);
        } finally {
          setIsTranslating(false);
          setInterimText('');
        }
      },
      onError: (err) => {
        setIsListening(false);
        setIsTranslating(false);
        setErrorMessage(err);
        setTimeout(() => setErrorMessage(null), 4000);
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

  const toggleListening = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const currentLangObj = SUPPORTED_VOICE_LANGUAGES.find((l) => l.code === activeLanguage) || SUPPORTED_VOICE_LANGUAGES[0];

  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
  };

  return (
    <div className="relative inline-flex items-center gap-1 shrink-0">
      {/* Speech Button */}
      <button
        type="button"
        onClick={toggleListening}
        title={
          isListening
            ? 'Listening... Click to stop (Speak in Bengali, Hindi, or English)'
            : `Voice Type in ${currentLangObj.nativeLabel} (Auto-translates to English)`
        }
        className={cn(
          'relative rounded-lg flex items-center justify-center transition-all duration-200 focus:outline-none shadow-2xs',
          sizeClasses[size],
          isListening
            ? 'bg-rose-500 text-white animate-pulse ring-2 ring-rose-400 ring-offset-1'
            : isTranslating
            ? 'bg-amber-500 text-white'
            : 'bg-brand-navy/5 text-brand-navy hover:bg-brand-orange hover:text-white',
          className
        )}
      >
        {isTranslating ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : isListening ? (
          <Mic className="w-3.5 h-3.5 animate-bounce" />
        ) : (
          <Mic className="w-3.5 h-3.5" />
        )}

        {/* Listening Ping Ring */}
        {isListening && (
          <span className="absolute -inset-1 rounded-lg bg-rose-400/30 animate-ping pointer-events-none" />
        )}
      </button>

      {/* Language Indicator / Mini Selector Toggle */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowLangMenu(!showLangMenu);
        }}
        title={`Change voice language (Current: ${currentLangObj.label})`}
        className="px-1.5 py-0.5 rounded text-[10px] font-bold text-brand-secondary hover:text-brand-navy bg-brand-navy/5 hover:bg-brand-navy/10 flex items-center gap-0.5 tracking-tight transition-colors"
      >
        <span>{currentLangObj.flag}</span>
        <span className="hidden sm:inline font-mono">{currentLangObj.nativeLabel}</span>
      </button>

      {/* Language Popup Dropdown */}
      {showLangMenu && (
        <div
          ref={langMenuRef}
          className="absolute top-full right-0 mt-1 z-30 w-44 bg-white rounded-xl shadow-xl border border-brand-border py-1.5 divide-y divide-brand-border/40 text-xs"
        >
          <div className="px-2.5 py-1 text-[10px] uppercase font-bold text-brand-secondary tracking-wider">
            Spoken Voice Language
          </div>
          <div className="py-1">
            {SUPPORTED_VOICE_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  setActiveLanguage(lang.code);
                  setShowLangMenu(false);
                }}
                className={cn(
                  'w-full px-2.5 py-1.5 flex items-center justify-between text-left hover:bg-brand-light transition-colors',
                  activeLanguage === lang.code ? 'font-bold text-brand-orange bg-brand-orange/5' : 'text-brand-navy'
                )}
              >
                <div className="flex items-center gap-2">
                  <span>{lang.flag}</span>
                  <div>
                    <div className="leading-tight">{lang.nativeLabel}</div>
                    <div className="text-[10px] text-brand-secondary">{lang.label}</div>
                  </div>
                </div>
                {activeLanguage === lang.code && <Check className="w-3.5 h-3.5 text-brand-orange" />}
              </button>
            ))}
          </div>
          <div className="px-2.5 py-1.5 text-[10px] text-brand-secondary bg-brand-light/50">
            Auto-translates into English CRM fields
          </div>
        </div>
      )}

      {/* Floating Interim / Status Toast */}
      {(isListening || isTranslating || errorMessage) && (
        <div className="absolute top-full left-0 mt-1.5 z-40 bg-brand-navy text-white text-[11px] px-2.5 py-1.5 rounded-lg shadow-lg whitespace-nowrap flex items-center gap-2 max-w-xs truncate border border-brand-navy-light animate-fadeIn">
          {errorMessage ? (
            <div className="flex items-center gap-1.5 text-rose-300">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          ) : isTranslating ? (
            <div className="flex items-center gap-1.5 text-amber-300">
              <Loader2 className="w-3 h-3 animate-spin shrink-0" />
              <span>Translating to English...</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping shrink-0" />
              <span className="font-semibold text-rose-300">Listening ({currentLangObj.nativeLabel}):</span>
              <span className="italic text-white/90 truncate">{interimText || 'Speak now...'}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
