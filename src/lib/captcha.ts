/**
 * Simple CAPTCHA implementation
 * Generates and verifies math-based CAPTCHA challenges
 */

export interface CaptchaChallenge {
  question: string
  answer: number
  token: string
}

/**
 * Generate a simple math CAPTCHA challenge
 */
export function generateCaptchaChallenge(): CaptchaChallenge {
  const num1 = Math.floor(Math.random() * 10) + 1
  const num2 = Math.floor(Math.random() * 10) + 1
  const operation = Math.random() > 0.5 ? "+" : "-"
  
  let question: string
  let answer: number
  
  if (operation === "+") {
    question = `${num1} + ${num2}`
    answer = num1 + num2
  } else {
    // Ensure positive result for subtraction
    const max = Math.max(num1, num2)
    const min = Math.min(num1, num2)
    question = `${max} - ${min}`
    answer = max - min
  }
  
  // Generate a simple token (in production, use a more secure method)
  const token = Buffer.from(`${question}:${answer}:${Date.now()}`).toString("base64")
  
  return {
    question,
    answer,
    token,
  }
}

/**
 * Verify CAPTCHA answer
 */
export function verifyCaptchaAnswer(token: string, userAnswer: number): boolean {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8")
    const parts = decoded.split(":")
    if (parts.length < 2) return false
    
    const expectedAnswer = parseInt(parts[1], 10)
    
    // Check if token is not too old (5 minutes)
    const timestamp = parseInt(parts[2] || "0", 10)
    const now = Date.now()
    if (now - timestamp > 5 * 60 * 1000) {
      return false // Token expired
    }
    
    return userAnswer === expectedAnswer
  } catch {
    return false
  }
}

/**
 * Store CAPTCHA challenge in session (for server-side verification)
 * In a real implementation, you'd store this in Redis or session storage
 */
const captchaStore = new Map<string, { answer: number; expires: number }>()

export function storeCaptchaChallenge(token: string, answer: number): void {
  captchaStore.set(token, {
    answer,
    expires: Date.now() + 5 * 60 * 1000, // 5 minutes
  })
  
  // Clean up expired challenges
  setTimeout(() => {
    captchaStore.delete(token)
  }, 5 * 60 * 1000)
}

export function getCaptchaChallenge(token: string): { answer: number } | null {
  const challenge = captchaStore.get(token)
  if (!challenge) return null
  
  if (Date.now() > challenge.expires) {
    captchaStore.delete(token)
    return null
  }
  
  return { answer: challenge.answer }
}

export function verifyCaptchaFromStore(token: string, userAnswer: number): boolean {
  const challenge = getCaptchaChallenge(token)
  if (!challenge) return false
  
  const isValid = challenge.answer === userAnswer
  
  // Remove challenge after verification (one-time use)
  if (isValid) {
    captchaStore.delete(token)
  }
  
  return isValid
}
