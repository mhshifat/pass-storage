import { initTRPC, TRPCError } from '@trpc/server';
import { cache } from 'react';
import superjson from 'superjson';
import { headers } from 'next/headers';
import { getSession } from "@/lib/session";
import { getUserPermissions, getUserRoleName } from "@/lib/permissions";

export type Context = { 
  userId: string;
  userRole: string | null;
  permissions: string[];
  subdomain: string | null;
};

export const createTRPCContext = cache(async (): Promise<Context> => {
  /**
   * @see: https://trpc.io/docs/server/context
   */
  const headersList = await headers();
  const subdomain = headersList.get("x-subdomain") || null;
  
  const session = await getSession();
  const userId = session.userId;
  
  // If no session or no userId, return empty context
  if (!session?.isLoggedIn || !userId) {
    return {
      userId: "",
      userRole: null,
      permissions: [],
      subdomain,
    };
  }
  
  // Get user role and permissions
  // If user doesn't exist in database, these will return null/empty
  const [userRole, permissions] = await Promise.all([
    getUserRoleName(userId).catch(() => null),
    getUserPermissions(userId).catch(() => []),
  ]);
  
  return { 
    userId,
    userRole,
    permissions,
    subdomain,
  };
});
// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.context<Context>().create({
  /**
   * @see https://trpc.io/docs/server/data-transformers
   */
  transformer: superjson,
});
// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;

/**
 * Middleware to check if user has required permission(s)
 */
export const requirePermission = (permissionKey: string | string[]) => {
  return t.middleware(async ({ ctx, next }) => {
    const requiredPermissions = Array.isArray(permissionKey) 
      ? permissionKey 
      : [permissionKey];
    
    const hasPermission = requiredPermissions.some(key => 
      ctx.permissions.includes(key)
    );
    
    if (!hasPermission) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `You do not have permission to perform this action. Required: ${requiredPermissions.join(" or ")}`,
      });
    }
    
    return next({ ctx });
  });
};

/**
 * Procedure that requires a specific permission
 */
export const protectedProcedure = (permissionKey: string | string[]) => {
  return baseProcedure.use(requirePermission(permissionKey));
};