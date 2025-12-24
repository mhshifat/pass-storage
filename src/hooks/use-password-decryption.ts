"use client"

import { useState, useEffect, useCallback } from "react"
import { decryptPasswordClient, isWebCryptoAvailable } from "@/lib/client-crypto"
import { useCurrentUser } from "./use-current-user"

/**
 * Hook to decrypt passwords on the client side
 * 
 * @param encryptedPassword - Encrypted password from API (format: "iv:encrypted_data")
 * @param encryptedTotpSecret - Optional encrypted TOTP secret
 * @returns Object with decrypted password, TOTP secret, loading state, and error
 */
export function usePasswordDecryption(
  encryptedPassword: string | null | undefined,
  encryptedTotpSecret?: string | null | undefined
) {
  const { user } = useCurrentUser()
  const [decryptedPassword, setDecryptedPassword] = useState<string>("")
  const [decryptedTotpSecret, setDecryptedTotpSecret] = useState<string | null>(null)
  const [isDecrypting, setIsDecrypting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const decrypt = useCallback(async () => {
    if (!encryptedPassword || !user?.id) {
      setDecryptedPassword("")
      setDecryptedTotpSecret(null)
      return
    }

    // Check if Web Crypto API is available
    if (!isWebCryptoAvailable()) {
      setError("Web Crypto API is not available in this browser")
      return
    }

    setIsDecrypting(true)
    setError(null)

    try {
      // Decrypt password (now uses user ID only, not session token)
      const password = await decryptPasswordClient(encryptedPassword, user.id)
      setDecryptedPassword(password)

      // Decrypt TOTP secret if provided
      if (encryptedTotpSecret) {
        try {
          const totp = await decryptPasswordClient(encryptedTotpSecret, user.id)
          setDecryptedTotpSecret(totp)
        } catch (totpError) {
          console.error("Failed to decrypt TOTP secret:", totpError)
          setDecryptedTotpSecret(null)
          // Don't set error for TOTP - password decryption succeeded
        }
      } else {
        setDecryptedTotpSecret(null)
      }
    } catch (err) {
      console.error("Failed to decrypt password:", err)
      setError(err instanceof Error ? err.message : "Failed to decrypt password")
      setDecryptedPassword("")
      setDecryptedTotpSecret(null)
    } finally {
      setIsDecrypting(false)
    }
  }, [encryptedPassword, encryptedTotpSecret, user?.id])

  useEffect(() => {
    decrypt()
  }, [decrypt])

  return {
    decryptedPassword,
    decryptedTotpSecret,
    isDecrypting,
    error,
    retry: decrypt,
  }
}

