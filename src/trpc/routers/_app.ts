import { createTRPCRouter } from "../init";
import { authRouter } from "@/modules/auth/server/procedures";
import { usersRouter } from "@/modules/users/server/procedures"
import { settingsRouter } from "@/modules/settings/server/procedures"
import { rolesRouter } from "@/modules/roles/server/procedures"
import { teamsRouter } from "@/modules/teams/server/procedures"
import { foldersRouter } from "@/modules/folders/server/procedures"
import { passwordsRouter } from "@/modules/passwords/server/procedures"

export const appRouter = createTRPCRouter({
  auth: authRouter,
  users: usersRouter,
  settings: settingsRouter,
  roles: rolesRouter,
  teams: teamsRouter,
  folders: foldersRouter,
  passwords: passwordsRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;