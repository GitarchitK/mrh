/**
 * WhatsApp click-to-chat helper with prefilled templates for Mobile Repairing House.
 * Phone: +91 97327 89938 (Debasish)
 */

export const SHOP_WHATSAPP_NUMBER = '919732789938';
export const SHOP_CALL_NUMBER = '+919732789938';

export function createWhatsAppUrl(message: string, phoneNumber: string = SHOP_WHATSAPP_NUMBER): string {
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  const encodedMsg = encodeURIComponent(message.trim());
  return `https://wa.me/${cleanPhone}?text=${encodedMsg}`;
}

export const WhatsAppTemplates = {
  generalEnquiry: () =>
    `Hello Debasish, I would like to enquire about mobile phone repair at Mobile Repairing House, Dunlop.`,

  serviceEnquiry: (serviceName: string) =>
    `Hello Debasish, I would like to know more about ${serviceName} for my smartphone at Mobile Repairing House.`,

  androidRepair: (brand?: string, model?: string) => {
    const deviceStr = brand ? ` (${brand} ${model || ''})` : '';
    return `Hello Debasish, I need an assessment for my Android smartphone${deviceStr} at your Dunlop shop.`;
  },

  iphoneRepair: (model?: string) => {
    const deviceStr = model ? ` (iPhone ${model})` : '';
    return `Hello Debasish, I need an assessment for my iPhone${deviceStr} at your Dunlop shop.`;
  },

  accessoryEnquiry: (productName: string) =>
    `Hello Debasish, is "${productName}" currently available in stock at Mobile Repairing House, Dunlop?`,

  trackingQuery: (jobNumber: string) =>
    `Hello Debasish, I am checking the current status of my repair job: ${jobNumber}. Could you please update me?`,

  enquiryFollowUp: (enquiryRef: string, customerName: string) =>
    `Hello ${customerName}, this is Mobile Repairing House Dunlop regarding your repair enquiry ${enquiryRef}. We have received your request and are ready to assist.`,

  estimateReady: (jobNumber: string, customerName: string, totalRupees: string, approvalLink?: string) => {
    let msg = `Hello ${customerName}, your diagnosis for repair job ${jobNumber} at Mobile Repairing House is complete. Estimated cost: ${totalRupees}.`;
    if (approvalLink) {
      msg += ` You can review and approve it here: ${approvalLink}`;
    }
    return msg;
  },

  repairReadyForCollection: (jobNumber: string, customerName: string) =>
    `Hello ${customerName}, good news! Your device under repair job ${jobNumber} is ready for collection at Mobile Repairing House, Bhajan Complex, Dunlop.`,
};
