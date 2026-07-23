/**
 * Generate a device fingerprint based on browser/environment properties.
 * This creates a semi-unique identifier for device binding.
 *
 * Note: This is a best-effort fingerprint. For production use,
 * consider augmenting with a persistent localStorage token.
 */
export async function generateFingerprint(): Promise<string> {
  const components: string[] = [];

  // User Agent
  if (typeof navigator !== "undefined") {
    components.push(navigator.userAgent);
    components.push(navigator.language);
    components.push(String(navigator.hardwareConcurrency ?? "unknown"));
    components.push(String(navigator.maxTouchPoints ?? 0));
  }

  // Screen properties
  if (typeof screen !== "undefined") {
    components.push(`${screen.width}x${screen.height}`);
    components.push(`${screen.colorDepth}`);
    components.push(`${screen.pixelDepth}`);
  }

  // Timezone
  try {
    components.push(Intl.DateTimeFormat().resolvedOptions().timeZone);
  } catch {
    components.push("unknown-tz");
  }

  // Canvas fingerprint
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (ctx) {
      canvas.width = 200;
      canvas.height = 50;
      ctx.textBaseline = "top";
      ctx.font = "14px Arial";
      ctx.fillStyle = "#FF5F1F";
      ctx.fillRect(0, 0, 200, 50);
      ctx.fillStyle = "#0D0D0D";
      ctx.fillText("KASIRSOLO-FP", 10, 15);
      components.push(canvas.toDataURL().slice(-50));
    }
  } catch {
    components.push("no-canvas");
  }

  // WebGL renderer
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl");
    if (gl) {
      const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
      if (debugInfo) {
        components.push(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL));
        components.push(gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL));
      }
    }
  } catch {
    components.push("no-webgl");
  }

  // Generate hash from components
  const raw = components.join("|");
  const hash = await hashString(raw);

  return `KSP-DEV-${hash}`;
}

/**
 * Hash a string using SHA-256 and return a hex string.
 * Falls back to a simple hash for environments without SubtleCrypto.
 */
async function hashString(input: string): Promise<string> {
  if (typeof globalThis.crypto !== "undefined" && globalThis.crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await globalThis.crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 32);
  }

  // Simple fallback hash (djb2)
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 33) ^ input.charCodeAt(i);
  }
  return Math.abs(hash).toString(16).padStart(8, "0").slice(0, 32);
}

/**
 * Get or create a persistent device ID stored in localStorage.
 * This augments the fingerprint with a stable localStorage-based ID.
 */
export function getDeviceId(): string {
  const STORAGE_KEY = "kasirsolo_device_id";

  if (typeof localStorage === "undefined") {
    return `KSP-DEV-${Date.now().toString(36)}`;
  }

  let deviceId = localStorage.getItem(STORAGE_KEY);
  if (!deviceId) {
    const random = new Uint8Array(16);
    if (typeof globalThis.crypto !== "undefined" && globalThis.crypto.getRandomValues) {
      globalThis.crypto.getRandomValues(random);
    } else {
      for (let i = 0; i < 16; i++) {
        random[i] = Math.floor(Math.random() * 256);
      }
    }
    deviceId = `KSP-DEV-${Array.from(random).map((b) => b.toString(16).padStart(2, "0")).join("")}`;
    localStorage.setItem(STORAGE_KEY, deviceId);
  }

  return deviceId;
}
