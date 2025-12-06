"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import ConnectionCard from "./connection-card";

export default function ConnectionsList() {
    const trpc = useTRPC();
    const { data: connectionsData } = useSuspenseQuery(trpc.connections.findMany.queryOptions({
        page: 1,
        perPage: 10
    }));

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {connectionsData.items.map(connection => (
                <ConnectionCard
                    key={"ConnectionCard" + connection.id}
                    title={connection.name}
                    description={connection.description}
                />
            ))}
        </div>
    )
}