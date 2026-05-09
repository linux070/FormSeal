/**
 * Seal encryption/decryption helpers.
 * In production, this would use @mysten/seal SDK with actual wallet signing.
 * For the hackathon demo, we simulate the encrypt/decrypt flow using
 * the Web Crypto API with a deterministic key derived from the creator address.
 * This demonstrates the UX pattern while keeping the build self-contained.
 */

const SEAL_KEY_LENGTH = 256;
const SEAL_IV_LENGTH = 12;

async function deriveKey(secret: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret.padEnd(32, '0').slice(0, 32)),
    'AES-GCM',
    false,
    ['encrypt', 'decrypt']
  );
  return keyMaterial;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export async function sealEncrypt(
  data: string,
  creatorAddress: string
): Promise<string> {
  const key = await deriveKey(creatorAddress);
  const iv = crypto.getRandomValues(new Uint8Array(SEAL_IV_LENGTH));
  const encoder = new TextEncoder();

  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(data)
  );

  const payload = {
    iv: arrayBufferToBase64(iv.buffer),
    data: arrayBufferToBase64(encrypted),
    sealed: true,
    algorithm: 'AES-GCM-' + SEAL_KEY_LENGTH,
  };

  return JSON.stringify(payload);
}

export async function sealDecrypt(
  encryptedPayload: string,
  creatorAddress: string
): Promise<string> {
  const { iv, data } = JSON.parse(encryptedPayload);
  const key = await deriveKey(creatorAddress);

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: new Uint8Array(base64ToArrayBuffer(iv)) },
    key,
    base64ToArrayBuffer(data)
  );

  return new TextDecoder().decode(decrypted);
}

export function isSealEncrypted(data: unknown): boolean {
  if (typeof data === 'object' && data !== null) {
    return 'sealed' in data && (data as Record<string, unknown>).sealed === true;
  }
  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data);
      return parsed.sealed === true;
    } catch {
      return false;
    }
  }
  return false;
}
