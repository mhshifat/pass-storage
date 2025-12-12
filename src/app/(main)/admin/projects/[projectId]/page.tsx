import ProjectOverview from "@/modules/projects/client/project-overview";
import { getQueryClient, trpc } from "@/trpc/server"
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";

export default async function AdminProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
    const { projectId } = await params;
    
    const queryClient = getQueryClient();
    void queryClient.prefetchQuery(trpc.projects.findById.queryOptions({
        id: +projectId
    }));

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <Suspense fallback={<div>Loading project...</div>}>
                <ProjectOverview projectId={+projectId} />
            </Suspense>
        </HydrationBoundary>
    )
}