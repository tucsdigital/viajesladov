import { WHATSAPP_NUMBER, WHATSAPP_MESSAGE_DEFAULT } from '@/lib/constants';

export function getWhatsAppLink(message?: string): string {
  const encodedMessage = encodeURIComponent(message || WHATSAPP_MESSAGE_DEFAULT);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
}

export function getWhatsAppLinkForPackage(packageTitle: string): string {
  const message = `${WHATSAPP_MESSAGE_DEFAULT}${packageTitle}`;
  return getWhatsAppLink(message);
}

