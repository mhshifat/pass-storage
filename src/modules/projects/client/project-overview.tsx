"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import ExcelDataTable from "./excel-data-table";

interface ProjectOverviewProps {
    projectId: number;
}

export default function ProjectOverview({ projectId }: ProjectOverviewProps) {
    const trpc = useTRPC();
    const { data } = useSuspenseQuery(trpc.projects.findById.queryOptions({
        id: projectId
    }));

    if (data?.connection?.type === 'EXCEL') {
        return <ExcelDataTable
            projectId={projectId}
            connectionId={data.connection.id}
            sheetId={(data.metadata as { sheetId: string })?.sheetId as string}
            sheetName={(data.metadata as { sheetTabName: string })?.sheetTabName as string}
        />;
    }

    return null;
}