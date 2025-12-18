import { createTRPCRouter } from "../init";
import { authRouter } from "@/modules/auth/server/procedures";
import { usersRouter } from "@/modules/users/server/procedures"
import { settingsRouter } from "@/modules/settings/server/procedures"
import { rolesRouter } from "@/modules/roles/server/procedures"

export const appRouter = createTRPCRouter({
  auth: authRouter,
  users: usersRouter,
  settings: settingsRouter,
  roles: rolesRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;