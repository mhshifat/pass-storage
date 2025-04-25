import CryptoJS from "crypto-js";

export function deriveKey(password: string, salt: string) {
  return CryptoJS.PBKDF2(password, salt, {
    keySize: 256 / 32,
    iterations: 100000,
    hasher: CryptoJS.algo.SHA256,
  });
}

export function generateVaultKey() {
  return CryptoJS.lib.WordArray.random(32).toString(CryptoJS.enc.Hex);
}

export function encryptVaultKey(vaultKey: string, password: string) {
  const salt = CryptoJS.lib.WordArray.random(16);
  const iv = CryptoJS.lib.WordArray.random(16);

  const key = CryptoJS.PBKDF2(password, salt, {
    keySize: 256 / 32,
    iterations: 100000,
    hasher: CryptoJS.algo.SHA256,
  });

  const encrypted = CryptoJS.AES.encrypt(vaultKey, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return {
    encryptedVaultKey: encrypted.toString(),
    salt: salt.toString(CryptoJS.enc.Hex),
    iv: iv.toString(CryptoJS.enc.Hex),
  };
}

export function decryptVaultKey(
  encryptedVaultKey: string,
  password: string,
  saltHex: string,
  ivHex: string
) {
  const salt = CryptoJS.enc.Hex.parse(saltHex);
  const iv = CryptoJS.enc.Hex.parse(ivHex);

  const key = CryptoJS.PBKDF2(password, salt, {
    keySize: 256 / 32,
    iterations: 100000,
    hasher: CryptoJS.algo.SHA256,
  });

  const decrypted = CryptoJS.AES.decrypt(encryptedVaultKey, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return decrypted.toString(CryptoJS.enc.Utf8);
}

export function getOrCreateDeviceKey() {
  let deviceKey = localStorage.getItem("deviceKey");
  if (!deviceKey) {
    deviceKey = CryptoJS.lib.WordArray.random(32).toString(); // 256-bit
    localStorage.setItem("deviceKey", deviceKey);
  }
  return deviceKey;
}

export function getDecryptedPassword(encrypted: string): string | null {
  if (!encrypted) return null;
  const deviceKey = localStorage.getItem("deviceKey");
  if (!encrypted || !deviceKey) return null;

  try {
    const decrypted = CryptoJS.AES.decrypt(encrypted, deviceKey);
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (e) {
    console.error("Decryption failed", e);
    return null;
  }
}

export function encryptEntry(entry: string, vaultKey: string) {
  const iv = CryptoJS.lib.WordArray.random(16);

  const encrypted = CryptoJS.AES.encrypt(entry, vaultKey, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return {
    encryptedEntry: encrypted.toString(),
    iv: iv.toString(CryptoJS.enc.Hex),
  };
}

export function decryptEntry(
  encryptedEntry: string,
  vaultKey: string,
  ivHex: string
) {
  const iv = CryptoJS.enc.Hex.parse(ivHex);

  const decrypted = CryptoJS.AES.decrypt(encryptedEntry, vaultKey, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return decrypted.toString(CryptoJS.enc.Utf8);
}
