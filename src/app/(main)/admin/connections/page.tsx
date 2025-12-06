import ConnectionsContainer from "@/modules/connections/client/connections-container";
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";

export default async function AdminConnectionsPage() {
    const queryClient = getQueryClient();
    void queryClient.prefetchQuery(trpc.connections.findMany.queryOptions({
        page: 1,
        perPage: 10
    }));

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <Suspense fallback={<p>Fetching Connections</p>}>
                <ConnectionsContainer />
            </Suspense>
        </HydrationBoundary>
    )
}