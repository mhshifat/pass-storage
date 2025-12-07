import { projectsRouter } from "@/modules/projects/server/procedures";
import { createTRPCRouter } from "../init";
import { connectionsRouter } from "@/modules/connections/server/procedures";
import { googlesRouter } from "@/modules/google/server/procedures";

export const appRouter = createTRPCRouter({
    projects: projectsRouter,
    connections: connectionsRouter,
    google: googlesRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;