import {
  BusinessSettings,
  Customer,
  ServiceItem,
  AccessoryItem,
  RepairEnquiry,
  RepairJob,
  RepairJobEvent,
  Estimate,
  Invoice,
  Payment,
  InventoryProduct,
  InventoryMovement,
  Warranty,
  PublicTrackingResponse,
  RepairStatus,
  StaffUser,
  UserRole,
} from '../types';
import {
  DEFAULT_BUSINESS_SETTINGS,
  INITIAL_SERVICES,
  INITIAL_ACCESSORIES,
} from './defaultData';
import {
  generateJobNumber,
  generateTrackingToken,
  generateEnquiryReference,
} from '../lib/reference';
import { normalizePhoneNumber } from '../lib/utils';
import { apiRequest } from '../lib/api';

// Local storage keys for resilient offline fallback
const STORAGE_PREFIX = 'mrh_';
const KEYS = {
  SETTINGS: `${STORAGE_PREFIX}settings`,
  SERVICES: `${STORAGE_PREFIX}services`,
  ACCESSORIES: `${STORAGE_PREFIX}accessories`,
  ENQUIRIES: `${STORAGE_PREFIX}enquiries`,
  CUSTOMERS: `${STORAGE_PREFIX}customers`,
  REPAIRS: `${STORAGE_PREFIX}repairs`,
  EVENTS: `${STORAGE_PREFIX}repair_events`,
  ESTIMATES: `${STORAGE_PREFIX}estimates`,
  INVOICES: `${STORAGE_PREFIX}invoices`,
  PAYMENTS: `${STORAGE_PREFIX}payments`,
  INVENTORY: `${STORAGE_PREFIX}inventory`,
  INVENTORY_MOVEMENTS: `${STORAGE_PREFIX}inventory_movements`,
  WARRANTIES: `${STORAGE_PREFIX}warranties`,
};

function readLocal<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function writeLocal<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Failed to write to local storage [${key}]:`, err);
  }
}

// -------------------------------------------------------------
// 1. BUSINESS SETTINGS
// -------------------------------------------------------------
export async function getBusinessSettings(): Promise<BusinessSettings> {
  try {
    const data = await apiRequest<BusinessSettings>('/settings');
    writeLocal(KEYS.SETTINGS, data);
    return data;
  } catch (err) {
    console.warn('Error fetching settings from API, using fallback:', err);
    return readLocal<BusinessSettings>(KEYS.SETTINGS, DEFAULT_BUSINESS_SETTINGS);
  }
}

export async function updateBusinessSettings(settings: Partial<BusinessSettings>): Promise<BusinessSettings> {
  const current = await getBusinessSettings();
  const updated: BusinessSettings = { ...current, ...settings };
  writeLocal(KEYS.SETTINGS, updated);

  try {
    return await apiRequest<BusinessSettings>('/settings', {
      method: 'PUT',
      body: JSON.stringify(updated),
    });
  } catch (err) {
    console.warn('Error updating settings via API, saved locally:', err);
    return updated;
  }
}

// -------------------------------------------------------------
// 2. SERVICES
// -------------------------------------------------------------
export async function getServices(): Promise<ServiceItem[]> {
  try {
    const list = await apiRequest<ServiceItem[]>('/services');
    if (Array.isArray(list) && list.length > 0) {
      writeLocal(KEYS.SERVICES, list);
      return list;
    }
  } catch (err) {
    console.warn('Error fetching services from API, using fallback:', err);
  }
  return readLocal<ServiceItem[]>(KEYS.SERVICES, INITIAL_SERVICES);
}

export async function getServiceBySlug(slug: string): Promise<ServiceItem | null> {
  const services = await getServices();
  return services.find(s => s.slug === slug) || null;
}

export async function updateService(id: string, updates: Partial<ServiceItem>): Promise<void> {
  const services = await getServices();
  const idx = services.findIndex(s => s.id === id);
  if (idx !== -1) {
    const updated = { ...services[idx], ...updates };
    services[idx] = updated;
    writeLocal(KEYS.SERVICES, services);
    try {
      await apiRequest('/services', {
        method: 'POST',
        body: JSON.stringify(updated),
      });
    } catch (err) {
      console.warn('Error updating service via API:', err);
    }
  }
}

// -------------------------------------------------------------
// 3. ACCESSORIES SHOWCASE
// -------------------------------------------------------------
export async function getAccessories(): Promise<AccessoryItem[]> {
  try {
    const list = await apiRequest<AccessoryItem[]>('/accessories');
    if (Array.isArray(list) && list.length > 0) {
      writeLocal(KEYS.ACCESSORIES, list);
      return list;
    }
  } catch (err) {
    console.warn('Error fetching accessories from API, using fallback:', err);
  }
  return readLocal<AccessoryItem[]>(KEYS.ACCESSORIES, INITIAL_ACCESSORIES);
}

export async function saveAccessory(accessory: AccessoryItem): Promise<void> {
  const list = await getAccessories();
  const existingIdx = list.findIndex(a => a.id === accessory.id);
  if (existingIdx >= 0) {
    list[existingIdx] = accessory;
  } else {
    list.push(accessory);
  }
  writeLocal(KEYS.ACCESSORIES, list);

  try {
    await apiRequest('/accessories', {
      method: 'POST',
      body: JSON.stringify(accessory),
    });
  } catch (err) {
    console.warn('Error saving accessory via API:', err);
  }
}

// -------------------------------------------------------------
// 4. REPAIR ENQUIRIES (Public submission & CRM management)
// -------------------------------------------------------------
export async function submitRepairEnquiry(
  data: Omit<RepairEnquiry, 'id' | 'publicReference' | 'status' | 'createdAt' | 'updatedAt'>
): Promise<RepairEnquiry> {
  const localId = `enq_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const localRef = generateEnquiryReference();
  const now = new Date().toISOString();

  const fallbackEnquiry: RepairEnquiry = {
    id: localId,
    publicReference: localRef,
    customerName: data.customerName.trim(),
    phone: data.phone.trim(),
    email: data.email?.trim() || undefined,
    deviceType: data.deviceType,
    brand: data.brand.trim(),
    model: data.model.trim(),
    imeiOrSerial: data.imeiOrSerial?.trim() || undefined,
    problemCategory: data.problemCategory,
    description: data.description.trim(),
    preferredVisitDate: data.preferredVisitDate,
    preferredContactMethod: data.preferredContactMethod,
    status: 'new',
    createdAt: now,
    updatedAt: now,
  };

  try {
    const res = await apiRequest<{ success: boolean; enquiry: RepairEnquiry }>('/enquiries', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res.enquiry) {
      const enquiries = readLocal<RepairEnquiry[]>(KEYS.ENQUIRIES, []);
      enquiries.unshift(res.enquiry);
      writeLocal(KEYS.ENQUIRIES, enquiries);
      return res.enquiry;
    }
  } catch (err) {
    console.warn('Error submitting enquiry to API, saved locally:', err);
  }

  const enquiries = readLocal<RepairEnquiry[]>(KEYS.ENQUIRIES, []);
  enquiries.unshift(fallbackEnquiry);
  writeLocal(KEYS.ENQUIRIES, enquiries);
  return fallbackEnquiry;
}

export async function getEnquiries(): Promise<RepairEnquiry[]> {
  try {
    const list = await apiRequest<RepairEnquiry[]>('/enquiries');
    if (Array.isArray(list)) {
      writeLocal(KEYS.ENQUIRIES, list);
      return list;
    }
  } catch (err) {
    console.warn('Error fetching enquiries from API:', err);
  }
  return readLocal<RepairEnquiry[]>(KEYS.ENQUIRIES, []);
}

export async function updateEnquiry(id: string, updates: Partial<RepairEnquiry>): Promise<void> {
  const enquiries = await getEnquiries();
  const idx = enquiries.findIndex(e => e.id === id);
  if (idx !== -1) {
    enquiries[idx] = { ...enquiries[idx], ...updates, updatedAt: new Date().toISOString() };
    writeLocal(KEYS.ENQUIRIES, enquiries);
    try {
      await apiRequest(`/enquiries/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    } catch (err) {
      console.warn('Error updating enquiry via API:', err);
    }
  }
}

// -------------------------------------------------------------
// 5. CUSTOMERS (Fed directly from Neon Database)
// -------------------------------------------------------------
export async function getCustomers(): Promise<Customer[]> {
  try {
    const list = await apiRequest<Customer[]>('/customers?limit=500');
    if (Array.isArray(list) && list.length > 0) {
      writeLocal(KEYS.CUSTOMERS, list);
      return list;
    }
  } catch (err) {
    console.warn('Error fetching customers from API, using fallback:', err);
  }
  return readLocal<Customer[]>(KEYS.CUSTOMERS, []);
}

export async function getCustomerById(id: string): Promise<Customer | null> {
  try {
    const cust = await apiRequest<Customer>(`/customers/${id}`);
    if (cust) return cust;
  } catch {}
  const customers = await getCustomers();
  return customers.find(c => c.id === id) || null;
}

export async function findCustomerByPhone(phone: string): Promise<Customer | null> {
  try {
    const cust = await apiRequest<Customer>(`/customers/by-phone/${encodeURIComponent(phone)}`);
    if (cust) return cust;
  } catch {}
  const normalized = normalizePhoneNumber(phone);
  const customers = await getCustomers();
  return customers.find(c => c.normalizedPhone === normalized || c.phone === phone) || null;
}

export async function createOrUpdateCustomer(data: {
  fullName: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
  createdBy?: string;
}): Promise<Customer> {
  const normalized = normalizePhoneNumber(data.phone);

  try {
    const existing = await findCustomerByPhone(data.phone);
    if (existing) {
      const updated = await apiRequest<Customer>(`/customers/${existing.id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return updated;
    } else {
      const created = await apiRequest<Customer>('/customers', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return created;
    }
  } catch (err) {
    console.warn('API customer operation failed, using local fallback:', err);
  }

  // Local fallback
  const now = new Date().toISOString();
  const existing = await findCustomerByPhone(data.phone);
  if (existing) {
    const updated: Customer = {
      ...existing,
      fullName: data.fullName.trim() || existing.fullName,
      email: data.email?.trim() || existing.email,
      address: data.address?.trim() || existing.address,
      notes: data.notes ? (existing.notes ? `${existing.notes}\n${data.notes}` : data.notes) : existing.notes,
      updatedAt: now,
    };
    const customers = await getCustomers();
    const idx = customers.findIndex(c => c.id === existing.id);
    if (idx !== -1) customers[idx] = updated;
    writeLocal(KEYS.CUSTOMERS, customers);
    return updated;
  }

  const newId = `cust_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const newCustomer: Customer = {
    id: newId,
    fullName: data.fullName.trim(),
    phone: data.phone.trim(),
    normalizedPhone: normalized,
    email: data.email?.trim() || undefined,
    address: data.address?.trim() || undefined,
    notes: data.notes?.trim() || undefined,
    createdAt: now,
    updatedAt: now,
    createdBy: data.createdBy,
  };

  const customers = await getCustomers();
  customers.unshift(newCustomer);
  writeLocal(KEYS.CUSTOMERS, customers);
  return newCustomer;
}

// -------------------------------------------------------------
// 6. REPAIR JOBS & LIFECYCLE
// -------------------------------------------------------------
export async function getRepairJobs(): Promise<RepairJob[]> {
  try {
    const list = await apiRequest<RepairJob[]>('/repairs');
    if (Array.isArray(list)) {
      writeLocal(KEYS.REPAIRS, list);
      return list;
    }
  } catch (err) {
    console.warn('Error fetching repair jobs from API:', err);
  }
  return readLocal<RepairJob[]>(KEYS.REPAIRS, []);
}

export async function getRepairJobById(id: string): Promise<RepairJob | null> {
  try {
    const job = await apiRequest<RepairJob>(`/repairs/${id}`);
    if (job) return job;
  } catch {}
  const jobs = await getRepairJobs();
  return jobs.find(j => j.id === id || j.jobNumber === id) || null;
}

export async function createRepairJob(jobData: {
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deviceType: 'android' | 'iphone' | 'other';
  brand: string;
  model: string;
  imeiOrSerial?: string;
  reportedProblem: string;
  diagnosis?: string;
  inspectionNotes?: string;
  conditionAtIntake?: string;
  accessoriesReceived?: string;
  devicePasscodeOrPattern?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  assignedTechnicianId?: string;
  assignedTechnicianName?: string;
  expectedCompletionAt?: string;
  createdBy: string;
  createdByName: string;
}): Promise<RepairJob> {
  try {
    const created = await apiRequest<RepairJob>('/repairs', {
      method: 'POST',
      body: JSON.stringify(jobData),
    });
    const jobs = await getRepairJobs();
    jobs.unshift(created);
    writeLocal(KEYS.REPAIRS, jobs);
    return created;
  } catch (err) {
    console.warn('Error creating repair job via API, using fallback:', err);
  }

  const id = `job_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const jobNumber = generateJobNumber();
  const trackingToken = generateTrackingToken();
  const now = new Date().toISOString();

  const newJob: RepairJob = {
    id,
    jobNumber,
    trackingToken,
    customerId: jobData.customerId,
    customerName: jobData.customerName,
    customerPhone: jobData.customerPhone,
    customerEmail: jobData.customerEmail,
    deviceType: jobData.deviceType,
    brand: jobData.brand,
    model: jobData.model,
    imeiOrSerial: jobData.imeiOrSerial,
    reportedProblem: jobData.reportedProblem,
    diagnosis: jobData.diagnosis,
    inspectionNotes: jobData.inspectionNotes,
    conditionAtIntake: jobData.conditionAtIntake,
    accessoriesReceived: jobData.accessoriesReceived,
    devicePasscodeOrPattern: jobData.devicePasscodeOrPattern,
    status: 'received',
    priority: jobData.priority,
    assignedTechnicianId: jobData.assignedTechnicianId,
    assignedTechnicianName: jobData.assignedTechnicianName,
    receivedAt: now,
    expectedCompletionAt: jobData.expectedCompletionAt,
    createdBy: jobData.createdBy,
    createdAt: now,
    updatedAt: now,
  };

  const jobs = await getRepairJobs();
  jobs.unshift(newJob);
  writeLocal(KEYS.REPAIRS, jobs);

  await addRepairJobEvent({
    repairJobId: id,
    status: 'received',
    timestamp: now,
    actorId: jobData.createdBy,
    actorName: jobData.createdByName,
    note: `Device received at counter: ${jobData.brand} ${jobData.model}. Condition: ${jobData.conditionAtIntake || 'Standard'}.`,
  });

  return newJob;
}

export async function updateRepairStatus(
  jobId: string,
  newStatus: RepairStatus,
  actor: { id: string; name: string },
  note?: string
): Promise<void> {
  const jobs = await getRepairJobs();
  const idx = jobs.findIndex(j => j.id === jobId);
  if (idx === -1) return;

  const now = new Date().toISOString();
  const updates: Partial<RepairJob> = {
    status: newStatus,
    updatedAt: now,
  };
  if (newStatus === 'completed') {
    updates.completedAt = now;
  }

  jobs[idx] = { ...jobs[idx], ...updates };
  writeLocal(KEYS.REPAIRS, jobs);

  await addRepairJobEvent({
    repairJobId: jobId,
    status: newStatus,
    timestamp: now,
    actorId: actor.id,
    actorName: actor.name,
    note: note || `Status changed to ${newStatus.replace('_', ' ').toUpperCase()}`,
  });

  try {
    await apiRequest(`/repairs/${jobId}`, {
      method: 'PUT',
      body: JSON.stringify({
        status: newStatus,
        statusNote: note,
        actorId: actor.id,
        actorName: actor.name,
      }),
    });
  } catch (err) {
    console.warn('Error updating status in API:', err);
  }
}

export async function updateRepairJob(jobId: string, updates: Partial<RepairJob>): Promise<void> {
  const jobs = await getRepairJobs();
  const idx = jobs.findIndex(j => j.id === jobId);
  if (idx !== -1) {
    jobs[idx] = { ...jobs[idx], ...updates, updatedAt: new Date().toISOString() };
    writeLocal(KEYS.REPAIRS, jobs);
  }

  try {
    await apiRequest(`/repairs/${jobId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  } catch (err) {
    console.warn('Error updating repair job via API:', err);
  }
}

// -------------------------------------------------------------
// 7. REPAIR JOB EVENTS (Audit Trail)
// -------------------------------------------------------------
export async function getRepairJobEvents(jobId: string): Promise<RepairJobEvent[]> {
  try {
    const events = await apiRequest<RepairJobEvent[]>(`/repairs/${jobId}/events`);
    if (Array.isArray(events)) {
      return events;
    }
  } catch (err) {
    console.warn('Error fetching events from API:', err);
  }
  const allEvents = readLocal<RepairJobEvent[]>(KEYS.EVENTS, []);
  return allEvents.filter(e => e.repairJobId === jobId);
}

export async function addRepairJobEvent(event: Omit<RepairJobEvent, 'id'>): Promise<void> {
  const id = `ev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const fullEvent: RepairJobEvent = { id, ...event };
  const allEvents = readLocal<RepairJobEvent[]>(KEYS.EVENTS, []);
  allEvents.push(fullEvent);
  writeLocal(KEYS.EVENTS, allEvents);

  try {
    await apiRequest(`/repairs/${event.repairJobId}/events`, {
      method: 'POST',
      body: JSON.stringify(fullEvent),
    });
  } catch (err) {
    console.warn('Error saving event via API:', err);
  }
}

// -------------------------------------------------------------
// 8. ESTIMATES & APPROVALS
// -------------------------------------------------------------
export async function getEstimates(): Promise<Estimate[]> {
  try {
    const list = await apiRequest<Estimate[]>('/estimates');
    if (Array.isArray(list)) {
      writeLocal(KEYS.ESTIMATES, list);
      return list;
    }
  } catch (err) {
    console.warn('Error fetching estimates from API:', err);
  }
  return readLocal<Estimate[]>(KEYS.ESTIMATES, []);
}

export async function getEstimateById(id: string): Promise<Estimate | null> {
  try {
    const est = await apiRequest<Estimate>(`/estimates/${id}`);
    if (est) return est;
  } catch {}
  const list = await getEstimates();
  return list.find(e => e.id === id || e.approvalToken === id) || null;
}

export async function saveEstimate(estimate: Estimate): Promise<void> {
  const list = await getEstimates();
  const idx = list.findIndex(e => e.id === estimate.id);
  if (idx >= 0) {
    list[idx] = estimate;
  } else {
    list.unshift(estimate);
  }
  writeLocal(KEYS.ESTIMATES, list);

  try {
    await apiRequest('/estimates', {
      method: 'POST',
      body: JSON.stringify(estimate),
    });
  } catch (err) {
    console.warn('Error saving estimate via API:', err);
  }
}

// -------------------------------------------------------------
// 9. INVOICES & PAYMENTS
// -------------------------------------------------------------
export async function getInvoices(): Promise<Invoice[]> {
  try {
    const list = await apiRequest<Invoice[]>('/invoices');
    if (Array.isArray(list)) {
      writeLocal(KEYS.INVOICES, list);
      return list;
    }
  } catch (err) {
    console.warn('Error fetching invoices from API:', err);
  }
  return readLocal<Invoice[]>(KEYS.INVOICES, []);
}

export async function saveInvoice(invoice: Invoice): Promise<void> {
  const list = await getInvoices();
  const idx = list.findIndex(i => i.id === invoice.id);
  if (idx >= 0) {
    list[idx] = invoice;
  } else {
    list.unshift(invoice);
  }
  writeLocal(KEYS.INVOICES, list);

  try {
    await apiRequest('/invoices', {
      method: 'POST',
      body: JSON.stringify(invoice),
    });
  } catch (err) {
    console.warn('Error saving invoice via API:', err);
  }
}

export async function getPayments(): Promise<Payment[]> {
  try {
    const list = await apiRequest<Payment[]>('/payments');
    if (Array.isArray(list)) {
      writeLocal(KEYS.PAYMENTS, list);
      return list;
    }
  } catch (err) {
    console.warn('Error fetching payments from API:', err);
  }
  return readLocal<Payment[]>(KEYS.PAYMENTS, []);
}

export async function recordPayment(payment: Payment): Promise<void> {
  const payments = await getPayments();
  payments.unshift(payment);
  writeLocal(KEYS.PAYMENTS, payments);

  try {
    await apiRequest('/payments', {
      method: 'POST',
      body: JSON.stringify(payment),
    });
  } catch (err) {
    console.warn('Error recording payment via API:', err);
  }
}

// -------------------------------------------------------------
// 10. INVENTORY PRODUCTS & MOVEMENTS
// -------------------------------------------------------------
export async function getInventoryProducts(): Promise<InventoryProduct[]> {
  try {
    const list = await apiRequest<InventoryProduct[]>('/inventory');
    if (Array.isArray(list) && list.length > 0) {
      writeLocal(KEYS.INVENTORY, list);
      return list;
    }
  } catch (err) {
    console.warn('Error fetching inventory from API:', err);
  }
  return readLocal<InventoryProduct[]>(KEYS.INVENTORY, []);
}

export async function saveInventoryProduct(product: InventoryProduct): Promise<void> {
  const list = await getInventoryProducts();
  const idx = list.findIndex(p => p.id === product.id);
  if (idx >= 0) {
    list[idx] = product;
  } else {
    list.unshift(product);
  }
  writeLocal(KEYS.INVENTORY, list);

  try {
    await apiRequest('/inventory', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  } catch (err) {
    console.warn('Error saving inventory product via API:', err);
  }
}

export async function adjustInventoryStock(data: {
  productId: string;
  delta: number;
  type: 'stock_in' | 'stock_out' | 'repair_consumed' | 'adjustment';
  reason?: string;
  referenceId?: string;
  performedBy: string;
}): Promise<void> {
  try {
    await apiRequest('/inventory/movements', {
      method: 'POST',
      body: JSON.stringify({
        productId: data.productId,
        quantityDelta: data.delta,
        type: data.type,
        notes: data.reason,
        referenceId: data.referenceId,
        performedBy: data.performedBy,
      }),
    });
  } catch (err) {
    console.warn('Error adjusting stock via API:', err);
  }
}

export async function getInventoryMovements(): Promise<InventoryMovement[]> {
  try {
    const list = await apiRequest<InventoryMovement[]>('/inventory/movements');
    if (Array.isArray(list)) {
      writeLocal(KEYS.INVENTORY_MOVEMENTS, list);
      return list;
    }
  } catch (err) {
    console.warn('Error fetching movements from API:', err);
  }
  return readLocal<InventoryMovement[]>(KEYS.INVENTORY_MOVEMENTS, []);
}

// -------------------------------------------------------------
// 11. WARRANTIES
// -------------------------------------------------------------
export async function getWarranties(): Promise<Warranty[]> {
  try {
    const list = await apiRequest<Warranty[]>('/warranties');
    if (Array.isArray(list)) {
      writeLocal(KEYS.WARRANTIES, list);
      return list;
    }
  } catch (err) {
    console.warn('Error fetching warranties from API:', err);
  }
  return readLocal<Warranty[]>(KEYS.WARRANTIES, []);
}

export async function saveWarranty(warranty: Warranty): Promise<void> {
  const list = await getWarranties();
  const idx = list.findIndex(w => w.id === warranty.id);
  if (idx >= 0) {
    list[idx] = warranty;
  } else {
    list.unshift(warranty);
  }
  writeLocal(KEYS.WARRANTIES, list);

  try {
    await apiRequest('/warranties', {
      method: 'POST',
      body: JSON.stringify(warranty),
    });
  } catch (err) {
    console.warn('Error saving warranty via API:', err);
  }
}

// -------------------------------------------------------------
// 12. SECURE PUBLIC REPAIR TRACKING
// -------------------------------------------------------------
export async function getPublicRepairStatus(
  jobNumberOrRef: string,
  verificationPhone?: string
): Promise<PublicTrackingResponse> {
  try {
    const queryParam = verificationPhone ? `?phone=${encodeURIComponent(verificationPhone)}` : '';
    const res = await apiRequest<PublicTrackingResponse>(`/public/tracking/${encodeURIComponent(jobNumberOrRef)}${queryParam}`);
    return res;
  } catch (err) {
    console.warn('Public tracking API error, evaluating locally:', err);
  }

  const cleanRef = jobNumberOrRef.trim().toUpperCase();
  const jobs = await getRepairJobs();
  const settings = await getBusinessSettings();

  const foundJob = jobs.find(
    j =>
      j.jobNumber.toUpperCase() === cleanRef ||
      j.id.toUpperCase() === cleanRef ||
      j.trackingToken.toLowerCase() === cleanRef.toLowerCase()
  );

  const shopContact = {
    name: settings.businessName,
    phone: settings.phone,
    whatsapp: settings.whatsapp,
    address: settings.fullAddress,
  };

  if (!foundJob) {
    return { valid: false, shopContact };
  }

  if (verificationPhone) {
    const normInput = normalizePhoneNumber(verificationPhone);
    const normJob = normalizePhoneNumber(foundJob.customerPhone);
    if (normInput && normJob && normInput !== normJob) {
      return { valid: false, shopContact };
    }
  }

  const events = await getRepairJobEvents(foundJob.id);
  const publicTimeline = events.map(e => ({
    status: e.status,
    timestamp: e.timestamp,
    publicNote: getPublicStatusDescription(e.status),
  }));

  const warranties = await getWarranties();
  const warranty = warranties.find(w => w.repairJobId === foundJob.id && w.status === 'active');

  return {
    valid: true,
    jobNumber: foundJob.jobNumber,
    deviceType: foundJob.deviceType,
    brand: foundJob.brand,
    model: foundJob.model,
    status: foundJob.status,
    receivedAt: foundJob.receivedAt,
    expectedCompletionAt: foundJob.expectedCompletionAt,
    completedAt: foundJob.completedAt,
    timeline: publicTimeline,
    customerFacingUpdates: getPublicStatusDescription(foundJob.status),
    warrantyActive: !!warranty,
    warrantyExpiry: warranty?.expiryDate,
    shopContact,
  };
}

function getPublicStatusDescription(status: RepairStatus): string {
  switch (status) {
    case 'received':
      return 'Device received at shop counter and queued for inspection.';
    case 'diagnosing':
      return 'Technician is actively testing and diagnosing the reported issue.';
    case 'estimate_sent':
    case 'awaiting_approval':
      return 'Diagnosis complete. Estimate prepared and awaiting customer approval.';
    case 'approved':
      return 'Estimate approved. Repair work scheduled to begin.';
    case 'in_repair':
      return 'Device is currently on the workbench undergoing repair and testing.';
    case 'ready_for_collection':
      return 'Repair and multi-point testing complete! Your device is ready for collection at Bhajan Complex, Dunlop.';
    case 'completed':
      return 'Device collected and repair closed. Thank you for choosing Mobile Repairing House!';
    case 'on_hold':
      return 'Repair paused pending additional parts or customer communication.';
    case 'unrepairable':
      return 'Assessment concluded. Device could not be safely repaired. Ready for return.';
    case 'cancelled':
      return 'Repair request cancelled.';
    default:
      return 'Status update recorded.';
  }
}

// -------------------------------------------------------------
// 13. STAFF & USER MANAGEMENT (PostgreSQL mrh_users)
// -------------------------------------------------------------
export async function getStaffUsers(): Promise<StaffUser[]> {
  try {
    const list = await apiRequest<StaffUser[]>('/staff');
    if (Array.isArray(list)) {
      return list;
    }
  } catch (err) {
    console.warn('Error fetching staff from API:', err);
  }
  return [];
}

export async function createStaffUser(data: {
  email: string;
  displayName: string;
  role: UserRole;
  phone?: string;
  password?: string;
}): Promise<StaffUser> {
  return await apiRequest<StaffUser>('/staff', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateStaffUser(
  uid: string,
  updates: Partial<StaffUser> & { password?: string }
): Promise<StaffUser> {
  return await apiRequest<StaffUser>(`/staff/${uid}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function deleteStaffUser(uid: string): Promise<void> {
  await apiRequest(`/staff/${uid}`, {
    method: 'DELETE',
  });
}

