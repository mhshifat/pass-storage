/**
 * Test script to verify audit logs are being created
 * Run this in a tRPC procedure or directly in the database
 */

import prisma from "@/lib/prisma"

export async function testAuditLogs() {
  // Count all audit logs
  const total = await prisma.auditLog.count()
  
  // Get recent logs
  const recent = await prisma.auditLog.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  })

  return {
    total,
    recent: recent.map(log => ({
      id: log.id,
      action: log.action,
      resource: log.resource,
      user: log.user?.name || "Unknown",
      status: log.status,
      createdAt: log.createdAt,
    })),
  }
}
