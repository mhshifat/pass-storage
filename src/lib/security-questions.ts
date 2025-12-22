import prisma from "@/lib/prisma"
import { hashPassword, verifyPassword } from "./auth"

/**
 * Pre-defined security questions
 */
export const SECURITY_QUESTIONS = [
  "What was the name of your first pet?",
  "What city were you born in?",
  "What was your mother's maiden name?",
  "What was the name of your elementary school?",
  "What was your childhood nickname?",
  "What is the name of your favorite teacher?",
  "What was the make of your first car?",
  "What is your favorite movie?",
  "What is the name of the street you grew up on?",
  "What was your favorite food as a child?",
] as const

/**
 * Hash a security question answer
 */
export async function hashSecurityAnswer(answer: string): Promise<string> {
  // Normalize answer: lowercase and trim
  const normalized = answer.toLowerCase().trim()
  return hashPassword(normalized)
}

/**
 * Verify a security question answer
 */
export async function verifySecurityAnswer(hashedAnswer: string, providedAnswer: string): Promise<boolean> {
  // Normalize provided answer: lowercase and trim
  const normalized = providedAnswer.toLowerCase().trim()
  return verifyPassword(normalized, hashedAnswer)
}

/**
 * Create or update security questions for a user
 */
export async function setSecurityQuestions(
  userId: string,
  questions: Array<{ question: string; answer: string }>
): Promise<void> {
  // Validate questions
  if (questions.length < 2) {
    throw new Error("At least 2 security questions are required")
  }

  if (questions.length > 5) {
    throw new Error("Maximum 5 security questions allowed")
  }

  // Delete existing questions
  await prisma.securityQuestion.deleteMany({
    where: { userId },
  })

  // Create new questions with hashed answers
  await Promise.all(
    questions.map(async ({ question, answer }) => {
      const answerHash = await hashSecurityAnswer(answer)
      return prisma.securityQuestion.create({
        data: {
          userId,
          question,
          answerHash,
        },
      })
    })
  )
}

/**
 * Verify security questions for account recovery
 */
export async function verifySecurityQuestions(
  userId: string,
  answers: Array<{ question: string; answer: string }>
): Promise<{ valid: boolean; correctCount: number; totalCount: number }> {
  const userQuestions = await prisma.securityQuestion.findMany({
    where: { userId },
  })

  if (userQuestions.length === 0) {
    return { valid: false, correctCount: 0, totalCount: 0 }
  }

  // Create a map of questions for quick lookup
  const questionMap = new Map(
    userQuestions.map((q) => [q.question, q.answerHash])
  )

  let correctCount = 0
  const totalCount = userQuestions.length

  // Verify each provided answer
  for (const { question, answer } of answers) {
    const answerHash = questionMap.get(question)
    if (answerHash) {
      const isValid = await verifySecurityAnswer(answerHash, answer)
      if (isValid) {
        correctCount++
      }
    }
  }

  // Require at least 70% of questions to be correct
  const requiredCorrect = Math.ceil(totalCount * 0.7)
  const valid = correctCount >= requiredCorrect

  return { valid, correctCount, totalCount }
}

/**
 * Get security questions for a user (without answers)
 */
export async function getUserSecurityQuestions(userId: string): Promise<Array<{ id: string; question: string }>> {
  const questions = await prisma.securityQuestion.findMany({
    where: { userId },
    select: {
      id: true,
      question: true,
    },
  })

  return questions
}

/**
 * Check if user has security questions set up
 */
export async function hasSecurityQuestions(userId: string): Promise<boolean> {
  const count = await prisma.securityQuestion.count({
    where: { userId },
  })

  return count > 0
}
