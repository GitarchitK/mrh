// Multi-lingual Translation Service (Bengali, Hindi, English -> English)
// Designed for Mobile Repair Shop Counter CRM (Rajib da Mobile Repairing House)

const BENGALI_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
const DEVANAGARI_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];

// Convert Bengali and Devanagari numerals to standard Western 0-9 digits
export const normalizeIndicDigits = (text: string): string => {
  if (!text) return '';
  let result = text;
  BENGALI_DIGITS.forEach((digit, index) => {
    result = result.split(digit).join(String(index));
  });
  DEVANAGARI_DIGITS.forEach((digit, index) => {
    result = result.split(digit).join(String(index));
  });
  return result;
};

// Check if string contains Bengali script
export const containsBengali = (text: string): boolean => {
  return /[\u0980-\u09FF]/.test(text);
};

// Check if string contains Devanagari (Hindi) script
export const containsHindi = (text: string): boolean => {
  return /[\u0900-\u097F]/.test(text);
};

// Check if text has any non-Latin / Indic characters
export const containsIndicScript = (text: string): boolean => {
  return containsBengali(text) || containsHindi(text);
};

// Local Mobile Repair Domain Dictionary for Offline Fallback
const REPAIR_DOMAIN_DICTIONARY: Record<string, string> = {
  // Bengali terms
  'ডিসপ্লে': 'display',
  'ডিসপ্লেটা': 'the display',
  'টাচ': 'touch screen',
  'কাচ': 'glass',
  'ভাঙা': 'broken',
  'ভেঙে গেছে': 'is broken',
  'কাজ করছে না': 'not working',
  'চার্জ হচ্ছে না': 'not charging',
  'চার্জ নিচ্ছে না': 'not taking charge',
  'চার্জিং পোর্ট': 'charging port',
  'চার্জার পিন': 'charging pin',
  'ব্যাটারি': 'battery',
  'চার্জ থাকছে না': 'battery draining fast',
  'ফুল গেছে': 'swollen',
  'ক্যামেরা': 'camera',
  'ছবি আসছে না': 'no image / camera blank',
  'স্পিকার': 'speaker',
  'মাইক': 'microphone',
  'কথা শোনা যাচ্ছে না': 'voice not audible',
  'আওয়াজ আসছে না': 'no sound',
  'জলে পড়ে গেছে': 'liquid water damage',
  'পানি ঢুকেছে': 'water ingress',
  'অন হচ্ছে না': 'not powering on / dead',
  'ডেড': 'dead condition',
  'স্ক্রিন গার্ড': 'screen protector / tempered glass',
  'কাস্টমার': 'Customer',
  'নাম': 'Name',
  'ফোন': 'Phone',
  'নম্বর': 'Number',
  'টাকা': 'Rupees',
  'দাম': 'Price',
  'জরুরি': 'Urgent',
  'তাড়াতাড়ি': 'Urgent / Priority',

  // Hindi terms
  'डिस्प्ले': 'display',
  'टच': 'touch screen',
  'फूटा हुआ': 'cracked / broken',
  'टूट गया': 'broken',
  'काम नहीं कर रहा': 'not working',
  'चार्ज नहीं हो रहा': 'not charging',
  'चार्जिंग सॉकेट': 'charging socket',
  'चार्जिंग पिन': 'charging pin',
  'बैटरी': 'battery',
  'बैटरी बैकअप नहीं दे रहा': 'battery draining fast',
  'फूल गया': 'swollen battery',
  'कैमरा': 'camera',
  'स्पीकर': 'speaker',
  'माइक': 'microphone',
  'आवाज नहीं आ रही': 'no sound / mic issue',
  'पानी में गिर गया': 'water damage',
  'चालू नहीं हो रहा': 'not turning on / dead',
  'डेड': 'dead',
  'ग्राहक': 'Customer',
  'फोन नंबर': 'Phone number',
  'रुपये': 'Rupees',
  'कीमत': 'Price',
  'जल्दी': 'Urgent',
};

// Known brands capitalization map
const BRAND_CORRECTIONS: Record<string, string> = {
  iphone: 'iPhone',
  ipad: 'iPad',
  apple: 'Apple',
  samsung: 'Samsung',
  xiaomi: 'Xiaomi',
  redmi: 'Redmi',
  realme: 'Realme',
  vivo: 'Vivo',
  oppo: 'Oppo',
  oneplus: 'OnePlus',
  motorola: 'Motorola',
  moto: 'Moto',
  poco: 'POCO',
  nothing: 'Nothing Phone',
  iqoo: 'iQOO',
  infinix: 'Infinix',
  tecno: 'Tecno',
  google: 'Google',
  pixel: 'Pixel',
  nokia: 'Nokia',
};

// Clean and polish translated technical text
export const polishTechnicalEnglish = (text: string): string => {
  if (!text) return '';
  let cleaned = text.trim();

  // Fix brand capitalization
  Object.entries(BRAND_CORRECTIONS).forEach(([lower, proper]) => {
    const regex = new RegExp(`\\b${lower}\\b`, 'gi');
    cleaned = cleaned.replace(regex, proper);
  });

  // Standardize common phrases
  cleaned = cleaned
    .replace(/\bthe phone\b/gi, 'Phone')
    .replace(/\bthe display\b/gi, 'Display')
    .replace(/\bdisplay broke\b/gi, 'Display broken')
    .replace(/\btouch not work\b/gi, 'Touch not working')
    .replace(/\bnot getting charge\b/gi, 'Not charging')
    .replace(/\bcharge pin\b/gi, 'Charging pin')
    .replace(/\bwater fallen\b/gi, 'Liquid / Water damage')
    .replace(/\bswitched off not turning on\b/gi, 'Dead / Not turning on');

  // Capitalize first character of sentence
  if (cleaned.length > 0) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }

  return cleaned;
};

// Translate text using Google Translate GTX endpoint (CORS-friendly public endpoint)
const translateViaGoogleGTX = async (text: string, sourceLang = 'auto'): Promise<string> => {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=en&dt=t&q=${encodeURIComponent(text)}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Google Translate API returned status ${response.status}`);
  }
  const data = await response.json();
  if (data && Array.isArray(data[0])) {
    return data[0].map((item: any) => item[0]).join('');
  }
  throw new Error('Unexpected translation response format');
};

// Fallback translation using MyMemory API
const translateViaMyMemory = async (text: string): Promise<string> => {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=auto|en`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`MyMemory API returned status ${response.status}`);
  }
  const data = await response.json();
  if (data && data.responseData && data.responseData.translatedText) {
    return data.responseData.translatedText;
  }
  throw new Error('MyMemory translation failed');
};

// Fallback dictionary-based replacement
const translateViaDictionaryFallback = (text: string): string => {
  let translated = text;
  Object.entries(REPAIR_DOMAIN_DICTIONARY).forEach(([indicWord, englishWord]) => {
    translated = translated.split(indicWord).join(englishWord);
  });
  return translated;
};

export interface TranslationResult {
  originalText: string;
  translatedText: string;
  detectedSourceLang: 'bn' | 'hi' | 'en' | 'mixed';
  method: 'google' | 'mymemory' | 'dictionary' | 'passthrough';
}

/**
 * Main translation entry point.
 * Converts Bengali, Hindi, or mixed Indian language speech into clean, standard English for CRM forms.
 */
export const translateToEnglish = async (
  rawText: string,
  preferredSource?: 'bn-IN' | 'hi-IN' | 'en-IN' | 'auto'
): Promise<TranslationResult> => {
  if (!rawText || !rawText.trim()) {
    return {
      originalText: '',
      translatedText: '',
      detectedSourceLang: 'en',
      method: 'passthrough',
    };
  }

  // 1. Normalize Bengali and Hindi numerals to standard digits (e.g. ৯৮৩০১ -> 98301)
  const normalizedText = normalizeIndicDigits(rawText.trim());

  // 2. Detect language
  const hasBengali = containsBengali(normalizedText);
  const hasHindi = containsHindi(normalizedText);
  let detectedSourceLang: 'bn' | 'hi' | 'en' | 'mixed' = 'en';

  if (hasBengali && hasHindi) detectedSourceLang = 'mixed';
  else if (hasBengali) detectedSourceLang = 'bn';
  else if (hasHindi) detectedSourceLang = 'hi';
  else if (preferredSource === 'bn-IN') detectedSourceLang = 'bn';
  else if (preferredSource === 'hi-IN') detectedSourceLang = 'hi';

  // If text is pure English and user was listening in English, simply polish and return
  if (!hasBengali && !hasHindi && (!preferredSource || preferredSource === 'en-IN')) {
    return {
      originalText: rawText,
      translatedText: polishTechnicalEnglish(normalizedText),
      detectedSourceLang: 'en',
      method: 'passthrough',
    };
  }

  const sourceLangParam = detectedSourceLang === 'bn' ? 'bn' : detectedSourceLang === 'hi' ? 'hi' : 'auto';

  // 3. Try Google GTX primary
  try {
    const translated = await translateViaGoogleGTX(normalizedText, sourceLangParam);
    return {
      originalText: rawText,
      translatedText: polishTechnicalEnglish(translated),
      detectedSourceLang,
      method: 'google',
    };
  } catch (err) {
    console.warn('Google GTX translation failed, trying MyMemory...', err);
  }

  // 4. Try MyMemory secondary
  try {
    const translated = await translateViaMyMemory(normalizedText);
    return {
      originalText: rawText,
      translatedText: polishTechnicalEnglish(translated),
      detectedSourceLang,
      method: 'mymemory',
    };
  } catch (err) {
    console.warn('MyMemory translation failed, falling back to domain dictionary...', err);
  }

  // 5. Offline Domain Dictionary Fallback
  const dictTranslated = translateViaDictionaryFallback(normalizedText);
  return {
    originalText: rawText,
    translatedText: polishTechnicalEnglish(dictTranslated),
    detectedSourceLang,
    method: 'dictionary',
  };
};
