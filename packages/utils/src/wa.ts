import { WA_NUMBER } from "./constants";

/**
 * Build a WhatsApp click-to-chat link.
 *
 * @param message - Pre-filled message text
 * @param phone - Phone number in international format (without +). Defaults to KASIRSOLO support number.
 * @returns WhatsApp URL string
 *
 * @example
 * waLink("Halo, saya ingin bertanya tentang KASIRSOLO")
 * // => "https://wa.me/628816566935?text=Halo%2C%20saya%20ingin%20bertanya%20tentang%20KASIRSOLO"
 */
export function waLink(message?: string, phone?: string): string {
  const num = phone ?? WA_NUMBER;
  const base = `https://wa.me/${num}`;

  if (!message) return base;

  const encoded = encodeURIComponent(message);
  return `${base}?text=${encoded}`;
}

/**
 * Build a WhatsApp support link with a pre-filled message template.
 *
 * @param subject - Subject of the inquiry
 * @param clientName - Name of the client
 * @param appCode - Application code (if applicable)
 * @returns WhatsApp URL string
 */
export function waSupportLink(
  subject: string,
  clientName?: string,
  appCode?: string
): string {
  const parts = [
    `Halo KASIRSOLO,`,
    ``,
    `Saya ${clientName ?? "(nama)"}${appCode ? ` [${appCode}]` : ""}.`,
    ``,
    `Perihal: ${subject}`,
    ``,
    `(silakan jelaskan detail pertanyaan Anda di sini)`,
  ];

  return waLink(parts.join("\n"));
}

/**
 * Build a WhatsApp order inquiry link.
 *
 * @param appName - Name of the application being inquired about
 * @param planType - Plan type being considered
 * @returns WhatsApp URL string
 */
export function waOrderLink(appName: string, planType?: string): string {
  const parts = [
    `Halo KASIRSOLO,`,
    ``,
    `Saya tertarik dengan aplikasi *${appName}*${planType ? ` paket *${planType}*` : ""}.`,
    ``,
    `Mohon informasi lebih lanjut mengenai harga dan fitur.`,
    ``,
    `Terima kasih.`,
  ];

  return waLink(parts.join("\n"));
}
