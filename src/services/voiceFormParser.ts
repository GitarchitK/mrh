// Intelligent Voice Form Parser for Mobile Repair Counter CRM
// Parses translated or dictated English into structured fields for Jobsheets, Stocks, and Billings.

import { DeviceType, RepairPriority, InventoryProduct } from '../types';

export type InventoryCategory = InventoryProduct['category'];

export interface ParsedJobsheetData {
  customerName?: string;
  customerPhone?: string;
  brand?: string;
  model?: string;
  deviceType?: DeviceType;
  reportedProblem?: string;
  diagnosis?: string;
  conditionAtIntake?: string;
  accessoriesReceived?: string;
  devicePasscodeOrPattern?: string;
  priority?: RepairPriority;
  rawTranslated: string;
}

export interface ParsedStockData {
  name?: string;
  sku?: string;
  category?: InventoryCategory;
  brand?: string;
  quantity?: number;
  costRupees?: string;
  sellingRupees?: string;
  lowStockThreshold?: number;
  adjustType?: 'stock_in' | 'stock_out' | 'repair_consumed' | 'adjustment';
  adjustReason?: string;
  rawTranslated: string;
}

export interface ParsedInvoiceItem {
  id: string;
  description: string;
  type: 'part' | 'labour' | 'accessory' | 'other';
  quantity: number;
  unitPriceRupees: string;
}

export interface ParsedInvoiceData {
  customerName?: string;
  customerPhone?: string;
  items: ParsedInvoiceItem[];
  discountRupees?: string;
  notes?: string;
  rawTranslated: string;
}

const COMMON_BRANDS = [
  'apple', 'iphone', 'ipad', 'samsung', 'xiaomi', 'redmi', 'mi', 'vivo', 'oppo',
  'realme', 'oneplus', 'motorola', 'moto', 'poco', 'nothing', 'google pixel', 'pixel',
  'iqoo', 'infinix', 'tecno', 'nokia', 'asus', 'lenovo', 'honor', 'huawei'
];

/**
 * Parses free-form spoken text into structured Jobsheet (Repair Intake) fields
 */
export const parseJobsheetVoice = (text: string): ParsedJobsheetData => {
  const result: ParsedJobsheetData = {
    rawTranslated: text,
  };

  const clean = text.trim();
  if (!clean) return result;

  // 1. Phone number (10 digits starting with 6, 7, 8, or 9)
  const phoneMatch = clean.match(/(?:(?:\+?91|0)?[ -]?)?([6-9]\d{9})\b/);
  if (phoneMatch) {
    result.customerPhone = phoneMatch[1];
  }

  // 2. Customer Name
  const custNameMatch = clean.match(
    /(?:customer(?:'s)?(?: name)?(?: is)?|client(?:'s)?(?: name)?(?: is)?|name is|name|mr\.?|mrs\.?)\s+([a-zA-Z\s]{2,30}?)(?:\s+(?:phone|mobile|number|ph|brand|device|model|has|with|having)|,|\.|$)/i
  );
  if (custNameMatch) {
    result.customerName = custNameMatch[1].trim();
  }

  // 3. Brand & Device Type
  let detectedBrand = '';
  let detectedType: DeviceType = 'android';

  for (const b of COMMON_BRANDS) {
    const rx = new RegExp(`\\b${b}\\b`, 'i');
    if (rx.test(clean)) {
      if (b === 'iphone' || b === 'apple' || b === 'ipad') {
        detectedBrand = 'Apple';
        detectedType = b === 'ipad' ? 'other' : 'iphone';
      } else {
        detectedBrand = b.charAt(0).toUpperCase() + b.slice(1);
        detectedType = 'android';
      }
      break;
    }
  }

  if (detectedBrand) {
    result.brand = detectedBrand;
    result.deviceType = detectedType;

    // 4. Model extraction after brand
    const brandRegex = new RegExp(
      `(?:${detectedBrand}|iPhone|iPad|Samsung|Vivo|Oppo|Redmi|Realme|OnePlus|Poco)\\s+([a-zA-Z0-9\\+\\s\\-]{1,25}?)(?:\\s+(?:display|screen|battery|broken|touch|problem|issue|cracked|not charging|dead|water|charging|camera|speaker)|,|\\.|$)`,
      'i'
    );
    const modelMatch = clean.match(brandRegex);
    if (modelMatch && modelMatch[1].trim().length > 0) {
      result.model = modelMatch[1].trim();
    }
  }

  // If no model found yet, check generic model mentions like "Galaxy M31", "Note 10 Pro", "iPhone 13"
  if (!result.model) {
    const genericModel = clean.match(/\b(iPhone\s+[0-9]{1,2}(?:\s+Pro(?:\s+Max)?)?|Galaxy\s+[a-zA-Z0-9]+|Note\s+[0-9]+(?:\s+Pro)?|M[0-9]{2}|A[0-9]{2}|Y[0-9]{2})\b/i);
    if (genericModel) {
      result.model = genericModel[1].trim();
    }
  }

  // 5. Passcode or Pattern
  const passMatch = clean.match(/(?:passcode|password|pin|pattern|lock code)(?:\s+is)?\s+([a-zA-Z0-9\s]{1,15})(?:,|\.|$)/i);
  if (passMatch) {
    result.devicePasscodeOrPattern = passMatch[1].trim();
  }

  // 6. Priority
  if (/urgent|emergency|asap|fast|immediately|express/i.test(clean)) {
    result.priority = 'urgent';
  } else {
    result.priority = 'normal';
  }

  // 7. Accessories
  const accMatch = clean.match(/(?:accessories|with|received with|having)\s+([a-zA-Z0-9\s,]+(?:charger|box|cover|sim|cable|case)[a-zA-Z0-9\s]*)/i);
  if (accMatch) {
    result.accessoriesReceived = accMatch[1].trim();
  }

  // 8. Condition at intake
  const condMatch = clean.match(/(?:condition|body condition|physical condition)(?:\s+is)?\s+([a-zA-Z0-9\s,]+)/i);
  if (condMatch) {
    result.conditionAtIntake = condMatch[1].trim();
  } else if (/scratched|dented|bent|back glass cracked|heavy scratches/i.test(clean)) {
    const matched = clean.match(/\b(scratched|dented|bent|back glass cracked|heavy scratches)\b/i);
    if (matched) result.conditionAtIntake = matched[0];
  }

  // 9. Reported Problem extraction
  // Look for problem markers or sentences mentioning display, touch, battery, charging, water, etc.
  const probMatch = clean.match(
    /(?:problem(?: is)?|issue(?: is)?|complaint(?: is)?|fault(?: is)?|symptom(?: is)?)\s+([^.]+)/i
  );
  if (probMatch) {
    result.reportedProblem = probMatch[1].trim();
  } else {
    // Collect fault phrases
    const symptoms: string[] = [];
    if (/display|screen|glass|folder/i.test(clean)) {
      if (/broken|cracked|shattered|damaged/i.test(clean)) symptoms.push('Display cracked / broken');
      else if (/black|blank|no display|flickering/i.test(clean)) symptoms.push('Display black / no graphics');
      else symptoms.push('Display issue');
    }
    if (/touch/i.test(clean) && /not working|dead|unresponsive|auto touch/i.test(clean)) {
      symptoms.push('Touch screen unresponsive');
    }
    if (/battery/i.test(clean)) {
      if (/drain|backup|low|draining|backup low/i.test(clean)) symptoms.push('Battery backup low / fast draining');
      else if (/swollen|full/i.test(clean)) symptoms.push('Battery swollen');
      else symptoms.push('Battery replacement required');
    }
    if (/charg(?:ing|e|er)/i.test(clean) && /not|slow|pin|loose|socket/i.test(clean)) {
      symptoms.push('Charging port loose / not charging');
    }
    if (/water|liquid|liquid damage/i.test(clean)) {
      symptoms.push('Liquid / Water ingress damage');
    }
    if (/dead|not turning on|not switching on|power/i.test(clean)) {
      symptoms.push('Device dead / not powering on');
    }
    if (/speaker|sound|ring|ringer/i.test(clean)) {
      symptoms.push('Speaker / sound distortion');
    }
    if (/mic|microphone|voice/i.test(clean)) {
      symptoms.push('Microphone issue');
    }
    if (/camera/i.test(clean)) {
      symptoms.push('Camera failure / blurry');
    }

    if (symptoms.length > 0) {
      result.reportedProblem = symptoms.join(', ');
    } else {
      // Default to entire translated sentence if concise
      result.reportedProblem = clean;
    }
  }

  return result;
};

/**
 * Parses free-form spoken text into structured Stock / Inventory product fields
 */
export const parseStockVoice = (text: string): ParsedStockData => {
  const result: ParsedStockData = {
    rawTranslated: text,
  };

  const clean = text.trim();
  if (!clean) return result;

  // 1. Quantity
  const qtyMatch = clean.match(/(?:quantity|qty|pieces|pcs|count|units?|stock of)\s*[:=]?\s*(\d+)/i) ||
                   clean.match(/\b(\d+)\s*(?:pieces|pcs|units?)\b/i);
  if (qtyMatch) {
    result.quantity = parseInt(qtyMatch[1], 10);
  }

  // 2. Cost / Purchase Price
  const costMatch = clean.match(/(?:cost|purchase|buy|cost price|cp|bought for)\s*(?:is|at|of)?\s*(?:rs\.?|inr|₹)?\s*(\d+)/i);
  if (costMatch) {
    result.costRupees = costMatch[1];
  }

  // 3. Selling / Sale Price
  const sellMatch = clean.match(/(?:selling|sell|sale price|sp|mrp|price|rate)\s*(?:is|at|of)?\s*(?:rs\.?|inr|₹)?\s*(\d+)/i);
  if (sellMatch) {
    result.sellingRupees = sellMatch[1];
  }

  // 4. Category detection
  if (/display|folder|screen|combo|touch|oled|amoled|lcd/i.test(clean)) {
    result.category = 'displays';
  } else if (/battery|batteries/i.test(clean)) {
    result.category = 'batteries';
  } else if (/charging|cc board|sub board|pin|socket|connector/i.test(clean)) {
    result.category = 'charging_ports';
  } else if (/camera|lens/i.test(clean)) {
    result.category = 'cameras';
  } else if (/back glass|back cover|housing|body/i.test(clean)) {
    result.category = 'back_glass';
  } else if (/cable/i.test(clean)) {
    result.category = 'cables';
  } else if (/charger|adapter/i.test(clean)) {
    result.category = 'chargers';
  } else if (/earphone/i.test(clean)) {
    result.category = 'earphones';
  } else if (/headphone/i.test(clean)) {
    result.category = 'headphones';
  } else if (/power bank/i.test(clean)) {
    result.category = 'power_banks';
  } else {
    result.category = 'other';
  }

  // 5. Brand detection
  for (const b of COMMON_BRANDS) {
    const rx = new RegExp(`\\b${b}\\b`, 'i');
    if (rx.test(clean)) {
      result.brand = b === 'apple' || b === 'iphone' ? 'Apple' : b.charAt(0).toUpperCase() + b.slice(1);
      break;
    }
  }

  // 6. Product Name
  const nameMatch = clean.match(/(?:product|item|part|name is|name)\s+([^,]+?)(?:\s+(?:category|brand|quantity|qty|cost|price|rs)|$)/i);
  if (nameMatch) {
    result.name = nameMatch[1].trim();
  } else {
    // Generate clean descriptive name based on detected parts
    let constructed = '';
    if (result.brand) constructed += result.brand + ' ';
    const modelMatch = clean.match(/(?:for|model)\s+([a-zA-Z0-9\s\+\-]+?)(?:\s+(?:display|battery|quantity|cost|price)|$)/i);
    if (modelMatch) constructed += modelMatch[1].trim() + ' ';
    if (result.category) {
      constructed += result.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    result.name = constructed.trim() || clean;
  }

  // 7. Auto-generate SKU if needed
  if (result.name) {
    const initials = result.name
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .split(/\s+/)
      .map(w => w.substring(0, 3).toUpperCase())
      .join('-');
    result.sku = initials.substring(0, 15);
  }

  // 8. Adjust type detection (for stock adjustment modal)
  if (/damage|broken|loss|waste|faulty/i.test(clean)) {
    result.adjustType = 'stock_out';
    result.adjustReason = 'Damaged / defective stock written off';
  } else if (/repair|consumed|used in repair|fitted/i.test(clean)) {
    result.adjustType = 'repair_consumed';
    result.adjustReason = 'Consumed in customer repair';
  } else if (/bought|new stock|received|stock in|supplier/i.test(clean)) {
    result.adjustType = 'stock_in';
    result.adjustReason = 'New stock purchase arrival';
  } else {
    result.adjustType = 'stock_in';
  }

  return result;
};

/**
 * Parses free-form spoken text into structured Invoice / Billing fields
 */
export const parseInvoiceVoice = (text: string): ParsedInvoiceData => {
  const result: ParsedInvoiceData = {
    items: [],
    rawTranslated: text,
  };

  const clean = text.trim();
  if (!clean) return result;

  // 1. Phone number
  const phoneMatch = clean.match(/(?:(?:\+?91|0)?[ -]?)?([6-9]\d{9})\b/);
  if (phoneMatch) {
    result.customerPhone = phoneMatch[1];
  }

  // 2. Customer Name
  const custNameMatch = clean.match(
    /(?:customer(?:'s)?(?: name)?(?: is)?|client(?:'s)?(?: name)?(?: is)?|bill to|name is|name)\s+([a-zA-Z\s]{2,30}?)(?:\s+(?:phone|mobile|number|item|items|charge)|,|\.|$)/i
  );
  if (custNameMatch) {
    result.customerName = custNameMatch[1].trim();
  }

  // 3. Discount
  const discMatch = clean.match(/(?:discount|less|off)\s*(?:is|of)?\s*(?:rs\.?|inr|₹)?\s*(\d+)/i);
  if (discMatch) {
    result.discountRupees = discMatch[1];
  }

  // 4. Extract Line items
  // Look for items mentioned with prices (e.g., "Screen replacement 1800, labour charge 300, glass 150")
  // Or match multiple price associations
  const itemMatches = Array.from(clean.matchAll(/(?:item|charge|service)?\s*([a-zA-Z0-9\s\+\-\/\(\)]+?)\s*(?:price|rate|cost|amount|of|for|rs\.?|inr|₹)?\s*(?:rs\.?|inr|₹)?\s*(\d{2,6})\s*(?:rupees|rs)?/gi));

  if (itemMatches.length > 0) {
    itemMatches.forEach((match, idx) => {
      let desc = match[1].trim();
      const price = match[2];

      // Clean up common prefix words
      desc = desc.replace(/^(and|item|also|plus|for|with)\s+/i, '').trim();

      // Avoid matching customer name or phone as an item
      if (/customer|client|phone|mobile|discount|total/i.test(desc) || desc.length < 2) {
        return;
      }

      // Determine item type
      let type: 'part' | 'labour' | 'accessory' | 'other' = 'part';
      if (/labour|service|fitting|repair charge|work|installation/i.test(desc)) {
        type = 'labour';
      } else if (/glass|tempered|guard|cover|case|cable|charger/i.test(desc)) {
        type = 'accessory';
      }

      result.items.push({
        id: `voice_item_${Date.now()}_${idx}`,
        description: desc.charAt(0).toUpperCase() + desc.slice(1),
        type,
        quantity: 1,
        unitPriceRupees: price,
      });
    });
  }

  // If no structured items could be extracted, but prices exist, create a default item
  if (result.items.length === 0) {
    const singlePrice = clean.match(/(?:rs\.?|inr|₹)\s*(\d+)|(\d+)\s*(?:rupees|rs)/i);
    result.items.push({
      id: `voice_item_${Date.now()}`,
      description: clean.substring(0, 60),
      type: 'part',
      quantity: 1,
      unitPriceRupees: singlePrice ? (singlePrice[1] || singlePrice[2]) : '0',
    });
  }

  return result;
};
