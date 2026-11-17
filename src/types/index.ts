export type DeviceType = 'android' | 'iphone' | 'other';

export type RepairStatus =
  | 'received'
  | 'diagnosing'
  | 'estimate_sent'
  | 'awaiting_approval'
  | 'approved'
  | 'in_repair'
  | 'ready_for_collection'
  | 'completed'
  | 'on_hold'
  | 'unrepairable'
  | 'cancelled';

export type RepairPriority = 'low' | 'normal' | 'high' | 'urgent';

export type UserRole = 'owner' | 'manager' | 'technician';

export type EstimateStatus = 'draft' | 'issued' | 'approved' | 'rejected' | 'revised' | 'expired';

export type InvoiceStatus = 'draft' | 'unpaid' | 'partial' | 'paid' | 'cancelled';

export type PaymentMethod = 'cash' | 'upi' | 'bank_transfer' | 'other';

export type EnquiryStatus = 'new' | 'contacted' | 'converted' | 'cancelled';

export interface BusinessSettings {
  businessName: string;
  ownerContactName: string;
  phone: string;
  whatsapp: string;
  fullAddress: string;
  plusCode: string;
  googleMapsUrl: string;
  openingHours: string;
  serviceCategories: string[];
  supportedBrands: {
    android: string[];
    iphone: string[];
  };
  noticeBarText: string;
  noticeBarActive: boolean;
  termsAndConditions: string;
  warrantyPolicyDefault: string;
  taxRatePercent: number; // e.g. 0 or 18
  taxEnabled: boolean;
  currencySymbol: string;
}

export interface Customer {
  id: string;
  fullName: string;
  phone: string;
  normalizedPhone: string;
  email?: string;
  address?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface ServiceItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  iconName: string;
  shortDescription: string;
  fullDescription: string;
  symptoms: string[];
  diagnosticConsiderations: string[];
  supportedDevices: string[];
  assessmentProcess: string[];
  estimateApprovalExplanation: string;
  faqs: { question: string; answer: string }[];
  enabled: boolean;
  order: number;
  startingPricePaise?: number; // only if admin sets it
}

export interface AccessoryItem {
  id: string;
  name: string;
  category: 'chargers' | 'earphones' | 'power_banks' | 'protection' | 'other';
  brand: string;
  description: string;
  pricePaise: number;
  inStock: boolean;
  imageUrl?: string;
  featured?: boolean;
}

export type StoreCategory =
  | 'all'
  | 'chargers'
  | 'cables'
  | 'earphones'
  | 'power_banks'
  | 'protection'
  | 'spares'
  | 'tools'
  | 'other';

export interface StoreProduct {
  id: string;
  name: string;
  slug: string;
  category: StoreCategory;
  categoryLabel: string;
  brand: string;
  description: string;
  shortDesc: string;
  pricePaise: number; // e.g. 49900 = ₹499
  mrpPaise: number; // e.g. 89900 = ₹899 (Flipkart strikethrough price)
  rating: number; // e.g. 4.6
  ratingCount: number; // e.g. 142
  inStock: boolean;
  stockCount: number;
  imageUrl?: string;
  badge?: string; // 'MRH Assured', 'Deal of the Day', 'Best Seller', 'Top Rated'
  features: string[];
  specs: Record<string, string>;
  warranty: string;
  returnPolicy: string;
  flipkartAssured: boolean;
}

export interface CartItem {
  product: StoreProduct;
  quantity: number;
}

export interface RepairEnquiry {
  id: string;
  publicReference: string;
  customerName: string;
  phone: string;
  email?: string;
  deviceType: DeviceType;
  brand: string;
  model: string;
  imeiOrSerial?: string;
  problemCategory: string;
  description: string;
  preferredVisitDate?: string;
  preferredContactMethod: 'phone' | 'whatsapp';
  status: EnquiryStatus;
  notes?: string;
  customerId?: string;
  convertedJobId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RepairJob {
  id: string;
  jobNumber: string; // e.g. MRH-2026-0001
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deviceType: DeviceType;
  brand: string;
  model: string;
  imeiOrSerial?: string;
  reportedProblem: string;
  diagnosis?: string;
  inspectionNotes?: string;
  conditionAtIntake?: string; // scratches, broken glass, dents, etc.
  accessoriesReceived?: string; // SIM tray, case, memory card, charger
  devicePasscodeOrPattern?: string; // counter use only
  status: RepairStatus;
  priority: RepairPriority;
  assignedTechnicianId?: string;
  assignedTechnicianName?: string;
  receivedAt: string;
  expectedCompletionAt?: string;
  completedAt?: string;
  estimateId?: string;
  invoiceId?: string;
  warrantyId?: string;
  internalNotes?: string;
  trackingToken: string; // High-entropy secure token for customer tracking
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  approvalTimestamp?: string;
  approvalMethod?: 'in_person' | 'whatsapp' | 'phone' | 'online_portal';
  approvalRecordedBy?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface RepairJobEvent {
  id: string;
  repairJobId: string;
  status: RepairStatus;
  timestamp: string;
  actorId: string;
  actorName: string;
  note?: string;
}

export interface EstimateLineItem {
  id: string;
  description: string;
  type: 'part' | 'labour';
  quantity: number;
  unitPricePaise: number;
  totalPaise: number;
  partInventoryId?: string;
}

export interface Estimate {
  id: string;
  estimateNumber: string; // e.g. EST-2026-0001
  repairJobId: string;
  jobNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  items: EstimateLineItem[];
  subtotalPaise: number;
  discountPaise: number;
  taxPaise: number;
  totalPaise: number;
  status: EstimateStatus;
  revision: number;
  approvalToken: string; // high-entropy token for customer public approval page
  notes?: string;
  issuedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  approvalMethod?: string;
  approvalRecordedBy?: string;
  validUntilDays: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  type: 'part' | 'labour' | 'accessory' | 'other';
  quantity: number;
  unitPricePaise: number;
  totalPaise: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g. INV-2026-0001
  repairJobId?: string;
  jobNumber?: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  items: InvoiceLineItem[];
  subtotalPaise: number;
  discountPaise: number;
  taxPaise: number;
  totalPaise: number;
  amountPaidPaise: number;
  balanceDuePaise: number;
  status: InvoiceStatus;
  issuedAt: string;
  dueDate?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  paymentReference: string; // e.g. PAY-2026-0001
  invoiceId: string;
  repairJobId?: string;
  customerId: string;
  customerName: string;
  amountPaise: number;
  method: PaymentMethod;
  externalReference?: string; // UPI ref / Bank transaction ID
  notes?: string;
  recordedBy: string;
  recordedAt: string;
}

export interface InventoryProduct {
  id: string;
  name: string;
  sku: string;
  category: 'displays' | 'batteries' | 'charging_ports' | 'cables' | 'chargers' | 'earphones' | 'headphones' | 'power_banks' | 'back_glass' | 'cameras' | 'other';
  brand?: string;
  description?: string;
  quantityAvailable: number;
  lowStockThreshold: number;
  purchaseCostPaise: number; // strictly internal
  sellingPricePaise: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryMovement {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  type: 'stock_in' | 'stock_out' | 'repair_consumed' | 'adjustment';
  quantityDelta: number;
  previousQuantity: number;
  newQuantity: number;
  referenceId?: string; // e.g. repair job ID
  notes?: string;
  performedBy: string;
  createdAt: string;
}

export interface Warranty {
  id: string;
  warrantyReference: string; // e.g. WRN-2026-0001
  repairJobId: string;
  jobNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  deviceInfo: string;
  coveredWork: string;
  durationDays: number;
  startDate: string;
  expiryDate: string;
  terms: string;
  status: 'active' | 'expired' | 'voided';
  voidReason?: string;
  createdBy: string;
  createdAt: string;
}

export interface StaffUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  phone?: string;
  active: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface PublicTrackingResponse {
  valid: boolean;
  jobNumber?: string;
  deviceType?: DeviceType;
  brand?: string;
  model?: string;
  status?: RepairStatus;
  receivedAt?: string;
  expectedCompletionAt?: string;
  completedAt?: string;
  timeline?: {
    status: RepairStatus;
    timestamp: string;
    publicNote?: string;
  }[];
  customerFacingUpdates?: string;
  warrantyActive?: boolean;
  warrantyExpiry?: string;
  shopContact: {
    name: string;
    phone: string;
    whatsapp: string;
    address: string;
  };
}
