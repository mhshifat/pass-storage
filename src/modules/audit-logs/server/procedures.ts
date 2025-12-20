import prisma from "@/lib/prisma"
import { createTRPCRouter, protectedProcedure } from "@/trpc/init"
import z from "zod"
import { TRPCError } from "@trpc/server"

export const auditLogsRouter = createTRPCRouter({
  list: protectedProcedure("audit.view")
    .input(
      z.object({
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).max(100).default(20),
        search: z.string().optional(),
        action: z.string().optional(),
        status: z.enum(["SUCCESS", "FAILED", "WARNING", "BLOCKED"]).optional(),
        userId: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      })
    )
    .query(async ({ input }) => {
      const { page, pageSize, search, action, status, userId, startDate, endDate } = input

      // Build where clause
      const where: any = {}

      if (search) {
        where.OR = [
          { action: { contains: search, mode: "insensitive" } },
          { resource: { contains: search, mode: "insensitive" } },
          { ipAddress: { contains: search, mode: "insensitive" } },
          { user: { name: { contains: search, mode: "insensitive" } } },
          { user: { email: { contains: search, mode: "insensitive" } } },
        ]
      }

      if (action) {
        where.action = action
      }

      if (status) {
        where.status = status
      }

      if (userId) {
        where.userId = userId
      }

      if (startDate || endDate) {
        where.createdAt = {}
        if (startDate) {
          where.createdAt.gte = startDate
        }
        if (endDate) {
          where.createdAt.lte = endDate
        }
      }

      // Get total count for pagination
      const total = await prisma.auditLog.count({ where })

      // Get paginated logs with user info
      const logs = await prisma.auditLog.findMany({
        where,
        take: pageSize,
        skip: (page - 1) * pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })

      // Format logs for client
      const formattedLogs = logs.map((log) => {
        // Map status enum to lowercase string
        let status: "success" | "failed" | "warning" | "blocked" = "success"
        switch (log.status) {
          case "SUCCESS":
            status = "success"
            break
          case "FAILED":
            status = "failed"
            break
          case "WARNING":
            status = "warning"
            break
          case "BLOCKED":
            status = "blocked"
            break
        }

        return {
          id: log.id,
          user: log.user?.name || "Unknown",
          userEmail: log.user?.email || "N/A",
          action: log.action,
          resource: log.resource,
          ipAddress: log.ipAddress || "N/A",
          timestamp: log.createdAt.toISOString(),
          status,
          avatar: null as string | null,
          details: log.details as Record<string, unknown> | undefined,
        }
      })

      return {
        logs: formattedLogs,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      }
    }),

  stats: protectedProcedure("audit.view")
    .input(
      z.object({
        days: z.number().min(1).max(365).default(30),
      }).optional()
    )
    .query(async ({ input }) => {
      const days = input?.days || 30
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const [
        totalEvents,
        failedLogins,
        passwordChanges,
        securityAlerts,
      ] = await Promise.all([
        // Total events
        prisma.auditLog.count({
          where: {
            createdAt: { gte: startDate },
          },
        }),

        // Failed logins
        prisma.auditLog.count({
          where: {
            action: "LOGIN_FAILED",
            createdAt: { gte: startDate },
          },
        }),

        // Password changes (created, updated, deleted)
        prisma.auditLog.count({
          where: {
            action: { in: ["PASSWORD_CREATED", "PASSWORD_UPDATED", "PASSWORD_DELETED"] },
            createdAt: { gte: startDate },
          },
        }),

        // Security alerts (failed, blocked, warning status)
        prisma.auditLog.count({
          where: {
            status: { in: ["FAILED", "BLOCKED", "WARNING"] },
            createdAt: { gte: startDate },
          },
        }),
      ])

      // Calculate previous period for comparison
      const previousStartDate = new Date(startDate)
      previousStartDate.setDate(previousStartDate.getDate() - days)

      const [previousFailedLogins, previousSecurityAlerts] = await Promise.all([
        prisma.auditLog.count({
          where: {
            action: "LOGIN_FAILED",
            createdAt: {
              gte: previousStartDate,
              lt: startDate,
            },
          },
        }),
        prisma.auditLog.count({
          where: {
            status: { in: ["FAILED", "BLOCKED", "WARNING"] },
            createdAt: {
              gte: previousStartDate,
              lt: startDate,
            },
          },
        }),
      ])

      // Calculate percentage changes
      const failedLoginsChange = previousFailedLogins > 0
        ? `${((failedLogins - previousFailedLogins) / previousFailedLogins * 100).toFixed(0)}%`
        : "0%"
      const securityAlertsChange = previousSecurityAlerts > 0
        ? `${((securityAlerts - previousSecurityAlerts) / previousSecurityAlerts * 100).toFixed(0)}%`
        : "0%"

      return {
        totalEvents: {
          value: totalEvents,
          labelKey: "audit.lastDays",
          labelParams: { days },
        },
        failedLogins: {
          value: failedLogins,
          change: failedLoginsChange,
          changeType: failedLogins > previousFailedLogins ? "negative" : "positive" as const,
        },
        passwordChanges: {
          value: passwordChanges,
          labelKey: "audit.lastDays",
          labelParams: { days },
        },
        securityAlerts: {
          value: securityAlerts,
          change: securityAlertsChange,
          changeType: securityAlerts > previousSecurityAlerts ? "negative" : "positive" as const,
        },
      }
    }),

  getActionTypes: protectedProcedure("audit.view")
    .query(async () => {
      const actions = await prisma.auditLog.findMany({
        select: { action: true },
        distinct: ["action"],
        orderBy: { action: "asc" },
      })

      // Return action keys for client-side translation
      return actions.map((a) => a.action)
    }),

  getUsers: protectedProcedure("audit.view")
    .query(async () => {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
        },
        orderBy: { name: "asc" },
      })

      return users
    }),

  // Test endpoint to verify audit logs are working
  test: protectedProcedure("audit.view")
    .query(async () => {
      const total = await prisma.auditLog.count()
      
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
          createdAt: log.createdAt.toISOString(),
        })),
      }
    }),
})
