/**
 * Password Breach Detection using Have I Been Pwned API
 * Uses k-anonymity model: only sends first 5 chars of SHA-1 hash
 */

import crypto from "crypto"

const HIBP_API_URL = "https://api.pwnedpasswords.com/range"

/**
 * Check if a password has been breached using Have I Been Pwned API
 * Uses k-anonymity model for privacy (only sends first 5 chars of hash)
 * 
 * @param password - The plain text password to check
 * @returns Object with isBreached flag and breachCount (number of times found)
 */
export async function checkPasswordBreach(password: string): Promise<{
  isBreached: boolean
  breachCount: number
  hashPrefix: string
}> {
  // Generate SHA-1 hash of the password
  const hash = crypto.createHash("sha1").update(password).digest("hex").toUpperCase()
  
  // Get first 5 characters (k-anonymity)
  const hashPrefix = hash.substring(0, 5)
  const hashSuffix = hash.substring(5)

  try {
    // Fetch from Have I Been Pwned API
    const response = await fetch(`${HIBP_API_URL}/${hashPrefix}`, {
      headers: {
        "User-Agent": "PassBangla-Breach-Checker/1.0",
      },
    })

    if (!response.ok) {
      // If API is unavailable, don't fail - just return not breached
      console.error(`HIBP API error: ${response.status} ${response.statusText}`)
      return {
        isBreached: false,
        breachCount: 0,
        hashPrefix,
      }
    }

    const text = await response.text()
    const lines = text.split("\n")

    // Search for matching hash suffix in the response
    for (const line of lines) {
      const [suffix, count] = line.split(":")
      if (suffix.trim() === hashSuffix) {
        const breachCount = parseInt(count.trim(), 10) || 0
        return {
          isBreached: breachCount > 0,
          breachCount,
          hashPrefix,
        }
      }
    }

    // Hash suffix not found in breach database
    return {
      isBreached: false,
      breachCount: 0,
      hashPrefix,
    }
  } catch (error) {
    // Network error or API unavailable
    console.error("Error checking password breach:", error)
    return {
      isBreached: false,
      breachCount: 0,
      hashPrefix,
    }
  }
}

/**
 * Check multiple passwords for breaches
 * @param passwords - Array of plain text passwords to check
 * @returns Array of breach results
 */
export async function checkMultiplePasswords(
  passwords: string[]
): Promise<Array<{
  password: string
  isBreached: boolean
  breachCount: number
  hashPrefix: string
}>> {
  // Check passwords with a small delay to respect API rate limits
  const results = []
  for (const password of passwords) {
    const result = await checkPasswordBreach(password)
    results.push({
      password,
      ...result,
    })
    
    // Small delay to avoid rate limiting (HIBP allows ~1.5 requests/second)
    await new Promise((resolve) => setTimeout(resolve, 700))
  }
  
  return results
}
