"use server"

import { serverTrpc } from "@/trpc/server-caller"

export async function findCompanySubdomain(companyName: string): Promise<string | null> {
  try {
    const trpc = await serverTrpc()
    const result = await trpc.auth.findCompanyBySubdomain({ companyName })
    return result?.subdomain || null
  } catch (error) {
    return null
  }
}
