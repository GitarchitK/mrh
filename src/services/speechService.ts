// Web Speech API wrapper for Multi-lingual voice recognition (Bengali, Hindi, English)

export type VoiceLanguage = 'bn-IN' | 'hi-IN' | 'en-IN';

export interface VoiceLanguageOption {
  code: VoiceLanguage;
  label: string;
  nativeLabel: string;
  flag: string;
  samplePhrase: string;
}

export const SUPPORTED_VOICE_LANGUAGES: VoiceLanguageOption[] = [
  {
    code: 'bn-IN',
    label: 'Bengali (India)',
    nativeLabel: 'বাংলা',
    flag: '🇧🇩',
    samplePhrase: 'কাস্টমার অমল কর, ফোন ৯৮৩১০১২৩৪৫, স্যামসাং এম৩১ ডিসপ্লে ভেঙে গেছে',
  },
  {
    code: 'hi-IN',
    label: 'Hindi (India)',
    nativeLabel: 'हिन्दी',
    flag: '🇮🇳',
    samplePhrase: 'ग्राहक राहुल शर्मा, फोन 9876543210, रेडमी नोट 10 डिस्प्ले खराब है',
  },
  {
    code: 'en-IN',
    label: 'English (India)',
    nativeLabel: 'English',
    flag: '🇬🇧',
    samplePhrase: 'Customer Subhash Ghosh, phone 9830123456, iPhone 12 battery drain',
  },
];

// Check browser support
export const isSpeechRecognitionSupported = (): boolean => {
  return typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
};

export interface SpeechRecognitionCallbacks {
  onInterim?: (text: string) => void;
  onFinal?: (text: string) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
  onStart?: () => void;
}

export class SpeechRecognitionSession {
  private recognition: any = null;
  private isListening = false;
  private currentLanguage: VoiceLanguage = 'bn-IN';
  private callbacks: SpeechRecognitionCallbacks = {};
  private finalTranscript = '';
  private interimTranscript = '';
  private restartTimeout: any = null;
  private shouldKeepListening = false;

  constructor(lang: VoiceLanguage = 'bn-IN', continuous: boolean = false) {
    this.currentLanguage = lang;
    this.shouldKeepListening = continuous;
    this.initRecognition();
  }

  private initRecognition() {
    if (!isSpeechRecognitionSupported()) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    this.recognition.continuous = this.shouldKeepListening;
    this.recognition.interimResults = true;
    this.recognition.lang = this.currentLanguage;
    this.recognition.maxAlternatives = 1;

    this.recognition.onstart = () => {
      this.isListening = true;
      if (this.callbacks.onStart) this.callbacks.onStart();
    };

    this.recognition.onresult = (event: any) => {
      let interim = '';
      let finalChunk = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const item = event.results[i];
        if (item.isFinal) {
          finalChunk += item[0].transcript;
        } else {
          interim += item[0].transcript;
        }
      }

      if (finalChunk) {
        this.finalTranscript = (this.finalTranscript ? this.finalTranscript + ' ' : '') + finalChunk.trim();
        if (this.callbacks.onFinal) {
          this.callbacks.onFinal(this.finalTranscript);
        }
      }

      this.interimTranscript = interim;
      if (this.callbacks.onInterim) {
        this.callbacks.onInterim(interim);
      }
    };

    this.recognition.onerror = (event: any) => {
      console.warn('SpeechRecognition error:', event.error);
      let message = 'Speech recognition error';
      if (event.error === 'not-allowed') {
        message = 'Microphone permission denied. Please allow microphone access in your browser.';
      } else if (event.error === 'no-speech') {
        message = 'No speech detected. Please speak into your microphone.';
      } else if (event.error === 'network') {
        message = 'Network error during speech recognition.';
      }
      if (this.callbacks.onError) this.callbacks.onError(message);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (this.shouldKeepListening) {
        // Auto-restart if continuous mode is enabled
        this.restartTimeout = setTimeout(() => {
          try {
            if (this.shouldKeepListening && this.recognition) {
              this.recognition.start();
            }
          } catch (e) {
            // Already started or terminated
          }
        }, 200);
      } else {
        if (this.callbacks.onEnd) this.callbacks.onEnd();
      }
    };
  }

  public setLanguage(lang: VoiceLanguage) {
    this.currentLanguage = lang;
    if (this.recognition) {
      const wasListening = this.isListening;
      if (wasListening) {
        this.stop();
      }
      this.recognition.lang = lang;
      if (wasListening) {
        setTimeout(() => this.start(this.callbacks), 150);
      }
    }
  }

  public start(callbacks: SpeechRecognitionCallbacks) {
    this.callbacks = callbacks;
    this.finalTranscript = '';
    this.interimTranscript = '';

    if (!isSpeechRecognitionSupported()) {
      if (callbacks.onError) {
        callbacks.onError('Web Speech API is not supported in this browser. Please use Chrome, Edge, or Safari.');
      }
      return;
    }

    try {
      if (this.recognition) {
        this.recognition.lang = this.currentLanguage;
        this.recognition.start();
      }
    } catch (e) {
      console.warn('Failed to start speech recognition (already started?):', e);
    }
  }

  public stop() {
    this.shouldKeepListening = false;
    if (this.restartTimeout) {
      clearTimeout(this.restartTimeout);
      this.restartTimeout = null;
    }
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        // Ignored
      }
    }
    this.isListening = false;
  }

  public abort() {
    this.shouldKeepListening = false;
    if (this.restartTimeout) {
      clearTimeout(this.restartTimeout);
      this.restartTimeout = null;
    }
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch (e) {
        // Ignored
      }
    }
    this.isListening = false;
  }

  public getListeningStatus(): boolean {
    return this.isListening;
  }
}
