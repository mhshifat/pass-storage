import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from "@simplewebauthn/server"
import type {
  GenerateRegistrationOptionsOpts,
  VerifyRegistrationResponseOpts,
  GenerateAuthenticationOptionsOpts,
  VerifyAuthenticationResponseOpts,
} from "@simplewebauthn/server"
import type { AuthenticatorTransportFuture, CredentialDeviceType } from "@simplewebauthn/types"
import prisma from "@/lib/prisma"

let cachedCredentials: { rpId: string; rpName: string; origin: string } | null = null

async function getWebAuthnCredentials() {
  // Return cached credentials if available
  if (cachedCredentials) {
    return cachedCredentials
  }

  // Fetch from database
  const settings = await prisma.settings.findMany({
    where: {
      key: {
        in: ["mfa.webauthn.rp_id", "mfa.webauthn.rp_name", "mfa.webauthn.origin"],
      },
    },
  })

  const config: Record<string, string> = {}
  settings.forEach((setting) => {
    config[setting.key] = setting.value as string
  })

  const rpId = config["mfa.webauthn.rp_id"]
  const rpName = config["mfa.webauthn.rp_name"]
  const origin = config["mfa.webauthn.origin"]

  if (!rpId || !rpName || !origin) {
    // Fallback to environment variables or defaults
    return {
      rpId: process.env.WEBAUTHN_RP_ID || process.env.NEXT_PUBLIC_APP_URL?.replace(/^https?:\/\//, "").split("/")[0] || "localhost",
      rpName: process.env.WEBAUTHN_RP_NAME || "Password Storage",
      origin: process.env.WEBAUTHN_ORIGIN || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    }
  }

  cachedCredentials = { rpId, rpName, origin }
  return cachedCredentials
}

export async function checkWebAuthnCredentials(): Promise<{ configured: boolean; error?: string }> {
  const credentials = await getWebAuthnCredentials()
  // Check if credentials are from database (not fallback)
  const settings = await prisma.settings.findMany({
    where: {
      key: {
        in: ["mfa.webauthn.rp_id", "mfa.webauthn.rp_name", "mfa.webauthn.origin"],
      },
    },
  })

  if (settings.length < 3) {
    return {
      configured: false,
      error: "WebAuthn credentials are not configured. Please configure them in Settings → MFA Credentials.",
    }
  }

  const config: Record<string, string> = {}
  settings.forEach((setting) => {
    config[setting.key] = setting.value as string
  })

  if (!config["mfa.webauthn.rp_id"] || !config["mfa.webauthn.rp_name"] || !config["mfa.webauthn.origin"]) {
    return {
      configured: false,
      error: "WebAuthn credentials are incomplete. Please configure all fields in Settings → MFA Credentials.",
    }
  }

  return { configured: true }
}

// Clear cache when credentials are updated
export function clearWebAuthnCredentialsCache() {
  cachedCredentials = null
}

export interface WebAuthnCredential {
  credentialID: string
  publicKey: string
  counter: number
  deviceType: CredentialDeviceType
  backedUp: boolean
  transports?: AuthenticatorTransportFuture[]
}

/**
 * Generate registration options for a new WebAuthn credential
 */
export async function generateWebAuthnRegistrationOptions(
  userId: string,
  userName: string,
  userDisplayName: string,
  existingCredentials: WebAuthnCredential[]
): Promise<{ options: any; challenge: string }> {
  const credentials = await getWebAuthnCredentials()
  const opts: GenerateRegistrationOptionsOpts = {
    rpName: credentials.rpName,
    rpID: credentials.rpId,
    userID: userId,
    userName: userName,
    userDisplayName: userDisplayName,
    timeout: 60000,
    attestationType: "none",
    excludeCredentials: existingCredentials.map((cred) => ({
      id: cred.credentialID,
      type: "public-key",
      transports: cred.transports,
    })),
    authenticatorSelection: {
      authenticatorAttachment: "cross-platform",
      userVerification: "preferred",
      requireResidentKey: false,
    },
    supportedAlgorithmIDs: [-7, -257], // ES256 and RS256
  }

  const options = await generateRegistrationOptions(opts)

  return {
    options,
    challenge: options.challenge,
  }
}

/**
 * Verify registration response and return credential data
 */
export async function verifyWebAuthnRegistration(
  response: any,
  expectedChallenge: string,
  expectedOrigin?: string,
  expectedRPID?: string
): Promise<{ verified: boolean; credential?: WebAuthnCredential; error?: string }> {
  const credentials = await getWebAuthnCredentials()
  const origin = expectedOrigin || credentials.origin
  const rpId = expectedRPID || credentials.rpId
  try {
    const opts: VerifyRegistrationResponseOpts = {
      response,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpId,
      requireUserVerification: true,
    }

    const verification = await verifyRegistrationResponse(opts)

    if (!verification.verified || !verification.registrationInfo) {
      return { verified: false, error: "Verification failed" }
    }

    const { credentialID, credentialPublicKey, counter, credentialDeviceType, credentialBackedUp } =
      verification.registrationInfo

    const credential: WebAuthnCredential = {
      credentialID: Buffer.from(credentialID).toString("base64url"),
      publicKey: Buffer.from(credentialPublicKey).toString("base64url"),
      counter,
      deviceType: credentialDeviceType,
      backedUp: credentialBackedUp,
      transports: response.response.transports as AuthenticatorTransportFuture[],
    }

    return { verified: true, credential }
  } catch (error) {
    return {
      verified: false,
      error: error instanceof Error ? error.message : "Verification error",
    }
  }
}

/**
 * Generate authentication options for existing credentials
 */
export async function generateWebAuthnAuthenticationOptions(
  credentials: WebAuthnCredential[]
): Promise<{ options: any; challenge: string }> {
  const webauthnCreds = await getWebAuthnCredentials()
  const opts: GenerateAuthenticationOptionsOpts = {
    rpID: webauthnCreds.rpId,
    timeout: 60000,
    allowCredentials: credentials.map((cred) => ({
      id: cred.credentialID,
      type: "public-key",
      transports: cred.transports,
    })),
    userVerification: "preferred",
  }

  const options = await generateAuthenticationOptions(opts)

  return {
    options,
    challenge: options.challenge,
  }
}

/**
 * Verify authentication response
 */
export async function verifyWebAuthnAuthentication(
  response: any,
  expectedChallenge: string,
  credential: WebAuthnCredential,
  expectedOrigin?: string,
  expectedRPID?: string
): Promise<{ verified: boolean; newCounter?: number; error?: string }> {
  const webauthnCreds = await getWebAuthnCredentials()
  const origin = expectedOrigin || webauthnCreds.origin
  const rpId = expectedRPID || webauthnCreds.rpId
  try {
    const opts: VerifyAuthenticationResponseOpts = {
      response,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpId,
      credential: {
        id: credential.credentialID,
        publicKey: credential.publicKey,
        counter: credential.counter,
        deviceType: credential.deviceType,
        backedUp: credential.backedUp,
        transports: credential.transports,
      },
      requireUserVerification: true,
    }

    const verification = await verifyAuthenticationResponse(opts)

    if (!verification.verified) {
      return { verified: false, error: "Authentication verification failed" }
    }

    return {
      verified: true,
      newCounter: verification.authenticationInfo.newCounter,
    }
  } catch (error) {
    return {
      verified: false,
      error: error instanceof Error ? error.message : "Authentication error",
    }
  }
}
