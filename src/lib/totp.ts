import jsSHA from 'jssha';
import { TOTPToken } from "./types";

/**
 * Generate a TOTP code
 * @param secret The secret key
 * @param period The period in seconds (default 30)
 * @param digits The number of digits (default 6)
 * @param algorithm The algorithm to use (default SHA1)
 * @returns The TOTP code, seconds remaining, and progress percentage
 */
export async function generateTOTP(
  secret: string,
  period: number = 30,
  digits: number = 6,
  algorithm: 'SHA1' | 'SHA256' | 'SHA512' = 'SHA1'
): Promise<{ token: string; secondsRemaining: number; progress: number }> {
  // Remove spaces and convert to uppercase
  const cleanedSecret = secret.replace(/\s/g, '').toUpperCase();
  
  // Decode base32 secret
  const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '';
  for (let i = 0; i < cleanedSecret.length; i++) {
    const value = base32Chars.indexOf(cleanedSecret[i]);
    if (value < 0) continue; // Skip non-base32 chars
    bits += value.toString(2).padStart(5, '0');
  }
  
  // Convert bits to bytes
  const bytes = new Uint8Array(Math.floor(bits.length / 8));
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(bits.substring(i * 8, i * 8 + 8), 2);
  }
  
  // Get the current time in seconds
  const epoch = Math.floor(Date.now() / 1000);
  const timeStep = Math.floor(epoch / period);
  
  // Calculate seconds remaining and progress
  const secondsElapsed = epoch % period;
  const secondsRemaining = period - secondsElapsed;
  const progress = ((period - secondsRemaining) / period) * 100;
  
  // Convert timeStep to bytes
  const timeBytes = new ArrayBuffer(8);
  const timeView = new DataView(timeBytes);
  let value = timeStep;
  for (let i = 7; i >= 0; i--) {
    timeView.setUint8(i, value & 0xff);
    value = value >> 8;
  }
  
  // Create HMAC
  const shaVariant = algorithm === 'SHA1' ? 'SHA-1' : 
                     algorithm === 'SHA256' ? 'SHA-256' : 'SHA-512';
  const shaObj = new jsSHA(shaVariant, 'ARRAYBUFFER');
  shaObj.setHMACKey(bytes.buffer, 'ARRAYBUFFER');
  shaObj.update(timeBytes);
  const hmac = shaObj.getHMAC('ARRAYBUFFER');
  
  // Get offset and truncate
  const hmacView = new DataView(hmac);
  const offset = hmacView.getUint8(hmac.byteLength - 1) & 0x0f;
  const truncatedHash = hmacView.getUint32(offset) & 0x7fffffff;
  
  // Generate token
  let token = (truncatedHash % Math.pow(10, digits)).toString();
  token = token.padStart(digits, '0');
  
  return {
    token,
    secondsRemaining,
    progress,
  };
}

/**
 * Parse an otpauth URI
 * @param uri The otpauth URI
 * @returns The parsed token data or null if invalid
 */
export function parseOTPAuthURI(uri: string): Partial<TOTPToken> | null {
  try {
    if (!uri.startsWith('otpauth://')) {
      return null;
    }
    
    // Extract the URI parts
    const url = new URL(uri);
    if (url.protocol !== 'otpauth:') {
      return null;
    }
    
    // Check if it's a TOTP token
    if (url.hostname !== 'totp') {
      return null;
    }
    
    // Get the label (user and issuer)
    const label = decodeURIComponent(url.pathname.substring(1));
    let name = label;
    let issuer = '';
    
    // Extract issuer and name from the label
    if (label.includes(':')) {
      const parts = label.split(':');
      issuer = parts[0].trim();
      name = parts[1].trim();
    }
    
    // Get the parameters
    const secret = url.searchParams.get('secret');
    const algorithm = url.searchParams.get('algorithm');
    const digits = url.searchParams.get('digits');
    const period = url.searchParams.get('period');
    const issuerParam = url.searchParams.get('issuer');
    
    // Use the issuer from the parameters if available
    if (issuerParam) {
      issuer = issuerParam;
    }
    
    return {
      name,
      issuer,
      secret: secret || '',
      algorithm: (algorithm?.toUpperCase() as 'SHA1' | 'SHA256' | 'SHA512') || 'SHA1',
      digits: digits ? parseInt(digits, 10) : 6,
      period: period ? parseInt(period, 10) : 30,
    };
  } catch (error) {
    console.error('Failed to parse otpauth URI:', error);
    return null;
  }
}
