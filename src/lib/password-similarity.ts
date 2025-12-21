/**
 * Password similarity detection utilities
 * Uses Levenshtein distance and character similarity to detect similar passwords
 */

/**
 * Calculate Levenshtein distance between two strings
 */
export function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length
  const n = str2.length
  const dp: number[][] = []

  // Initialize DP table
  for (let i = 0; i <= m; i++) {
    dp[i] = [i]
  }
  for (let j = 0; j <= n; j++) {
    dp[0][j] = j
  }

  // Fill DP table
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1]
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1, // deletion
          dp[i][j - 1] + 1, // insertion
          dp[i - 1][j - 1] + 1 // substitution
        )
      }
    }
  }

  return dp[m][n]
}

/**
 * Calculate similarity percentage between two passwords
 * Returns a value between 0 (completely different) and 1 (identical)
 */
export function calculateSimilarity(password1: string, password2: string): number {
  if (password1 === password2) return 1.0

  const maxLength = Math.max(password1.length, password2.length)
  if (maxLength === 0) return 1.0

  const distance = levenshteinDistance(password1, password2)
  const similarity = 1 - distance / maxLength

  return Math.max(0, similarity)
}

/**
 * Check if two passwords are similar based on a threshold
 * @param password1 First password
 * @param password2 Second password
 * @param threshold Similarity threshold (0-1), default 0.8 (80% similar)
 */
export function arePasswordsSimilar(
  password1: string,
  password2: string,
  threshold: number = 0.8
): boolean {
  if (password1 === password2) return true
  return calculateSimilarity(password1, password2) >= threshold
}

/**
 * Check if passwords share common patterns
 * - Same base with minor variations (e.g., "Password1", "Password2")
 * - Same structure with different numbers
 */
export function hasCommonPattern(password1: string, password2: string): boolean {
  // Remove trailing numbers and compare base
  const base1 = password1.replace(/\d+$/, "")
  const base2 = password2.replace(/\d+$/, "")
  
  if (base1.length >= 4 && base2.length >= 4 && base1 === base2) {
    return true
  }

  // Check if they're similar enough
  return arePasswordsSimilar(password1, password2, 0.75)
}
