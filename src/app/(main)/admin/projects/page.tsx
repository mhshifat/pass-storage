import ProjectsContainer from "@/modules/projects/client/projects-container";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";

export default function AdminProjectsPage() {
    const queryClient = getQueryClient();
    void queryClient.prefetchQuery(trpc.projects.findMany.queryOptions({
        page: 1,
        perPage: 10
    }));

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <Suspense fallback={<p>Fetching Projects</p>}>
                <ProjectsContainer />
            </Suspense>
        </HydrationBoundary>
    )
}