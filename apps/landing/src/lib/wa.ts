/** Default KASIRSOLO WhatsApp number (international format) */
const DEFAULT_WA_NUMBER = '628816566935';

/** WhatsApp number from environment or fallback to default */
export function getWaNumber(): string {
  return process.env.NEXT_PUBLIC_WA_NUMBER || DEFAULT_WA_NUMBER;
}

/** Build a WhatsApp click-to-chat URL with optional pre-filled message */
export function waLink(message?: string): string {
  const num = getWaNumber();
  const base = `https://wa.me/${num}`;

  if (!message) return base;

  const encoded = encodeURIComponent(message);
  return `${base}?text=${encoded}`;
}
