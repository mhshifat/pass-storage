import twilio from "twilio"
import prisma from "@/lib/prisma"
import { decrypt } from "@/lib/crypto"

let twilioClient: twilio.Twilio | null = null
let cachedCredentials: { accountSid: string; authToken: string; phoneNumber: string } | null = null

async function getTwilioCredentials() {
  // Return cached credentials if available
  if (cachedCredentials) {
    return cachedCredentials
  }

  // Fetch from database
  const settings = await prisma.settings.findMany({
    where: {
      key: {
        in: ["mfa.sms.account_sid", "mfa.sms.auth_token", "mfa.sms.phone_number"],
      },
    },
  })

  const config: Record<string, string> = {}
  settings.forEach((setting) => {
    config[setting.key] = decrypt(setting.value as string)
  })

  const accountSid = config["mfa.sms.account_sid"]
  const authToken = config["mfa.sms.auth_token"]
  const phoneNumber = config["mfa.sms.phone_number"]

  if (!accountSid || !authToken || !phoneNumber) {
    return null
  }

  cachedCredentials = { accountSid, authToken, phoneNumber }
  return cachedCredentials
}

async function getTwilioClient() {
  if (twilioClient) {
    return twilioClient
  }

  const credentials = await getTwilioCredentials()
  if (!credentials) {
    return null
  }

  twilioClient = twilio(credentials.accountSid, credentials.authToken)
  return twilioClient
}

export async function checkSmsCredentials(): Promise<{ configured: boolean; error?: string }> {
  const credentials = await getTwilioCredentials()
  if (!credentials) {
    return {
      configured: false,
      error: "SMS credentials are not configured. Please configure them in Settings → MFA Credentials.",
    }
  }
  return { configured: true }
}

export async function sendSmsCode(phoneNumber: string, code: string): Promise<{ success: boolean; error?: string }> {
  try {
    const credentials = await checkSmsCredentials()
    if (!credentials.configured) {
      return {
        success: false,
        error: credentials.error || "SMS is not configured.",
      }
    }

    const client = await getTwilioClient()
    if (!client) {
      return {
        success: false,
        error: "Failed to initialize Twilio client.",
      }
    }

    const creds = await getTwilioCredentials()
    if (!creds) {
      return {
        success: false,
        error: "SMS credentials not found.",
      }
    }

    await client.messages.create({
      body: `Your Password Storage verification code is: ${code}. This code will expire in 10 minutes.`,
      from: creds.phoneNumber,
      to: phoneNumber,
    })

    return { success: true }
  } catch (error) {
    console.error("Failed to send SMS:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send SMS",
    }
  }
}

// Clear cache when credentials are updated
export function clearSmsCredentialsCache() {
  cachedCredentials = null
  twilioClient = null
}
