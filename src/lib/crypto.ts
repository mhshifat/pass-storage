import crypto from "crypto"


const RAW_KEY = process.env.EMAIL_ENCRYPTION_KEY || "default_dev_key_32bytes_long!!"
if (RAW_KEY.length !== 32) {
  throw new Error(
    `EMAIL_ENCRYPTION_KEY must be exactly 32 characters (got ${RAW_KEY.length}). Set it in your .env file. Example: EMAIL_ENCRYPTION_KEY=12345678901234567890123456789012`
  )
}
const ENCRYPTION_KEY = RAW_KEY
const IV_LENGTH = 16 // AES block size

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), iv)
  let encrypted = cipher.update(text)
  encrypted = Buffer.concat([encrypted, cipher.final()])
  return iv.toString("hex") + ":" + encrypted.toString("hex")
}

export function decrypt(text: string): string {
  const textParts = text.split(":")
  const iv = Buffer.from(textParts.shift()!, "hex")
  const encryptedText = Buffer.from(textParts.join(":"), "hex")
  const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), iv)
  let decrypted = decipher.update(encryptedText)
  decrypted = Buffer.concat([decrypted, decipher.final()])
  return decrypted.toString()
}
