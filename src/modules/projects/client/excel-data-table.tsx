import { Modal } from "@/components/shared/modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import CreateTableGroupForm from "./create-table-group-form";
import { useState } from "react";

interface ExcelDataTableProps {
    projectId: number,
    connectionId: number,
    sheetId: string,
    sheetName: string,
}

export default function ExcelDataTable({ projectId, connectionId, sheetId, sheetName }: ExcelDataTableProps) {
    const trpc = useTRPC();
    const { data } = useQuery(trpc.google.getSheetData.queryOptions({
        connectionId,
        sheetId,
        sheetName
    }));
    const { data: groupsData } = useQuery(trpc.projects.findManyGroupsByProjectId.queryOptions({
        projectId,
        page: 1,
        perPage: 100,
    }));
    const [createGroupModalOpen, setCreateGroupModalOpen] = useState(false);

    const columns = data?.[0] || [];
    const rows = data?.slice(1) || [];

    const renderContent = () => {
        if (columns.length === 0) {
            return <p>No data available in this sheet.</p>;
        }
        if ((groupsData?.items?.length || 0) > 0) {
            return (
                <Card>
                    <CardContent>
                        {groupsData?.items?.map(item => (
                            <div key={"ProjectTableGroupCard" + item.id} className="mb-6">
                                <h3 className="mb-2 text-lg font-medium">{item.name}</h3>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            {item.columns.map((column, columnIdx) => (
                                                <TableHead key={"ProjectTableGroupTableHeader" + item.id + columnIdx}>{column}</TableHead>
                                            ))}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {rows.map((row, rowIndex) => (
                                            <TableRow key={rowIndex}>
                                                {item.columns.map((columnName, cellIndex) => {
                                                    const columnIdx = columns.indexOf(columnName);
                                                    return (
                                                        <TableCell key={cellIndex}>{row[columnIdx]}</TableCell>
                                                    )
                                                })}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )
        }
        return (
            <Table>
                <TableHeader>
                    <TableRow>
                        {columns.map((column, columnIdx) => (
                            <TableHead key={"ExcelDataTableTableHeader" + columnIdx}>{column}</TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.map((row, rowIndex) => (
                        <TableRow key={rowIndex}>
                            {row.map((cell, cellIndex) => (
                                <TableCell key={cellIndex}>{cell}</TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        )
    }
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-end gap-4">
                    <Modal
                        open={createGroupModalOpen}
                        onOpenChange={setCreateGroupModalOpen}
                        title="Create/Update Project Table Groups"
                        description="Create or update project table groups from this Excel sheet."
                        trigger={<Button variant="outline" size="sm">Create/Update Groups</Button>}
                        as="div"
                    >
                        <CreateTableGroupForm
                            projectId={projectId}
                            defaultValues={{
                                groups: groupsData?.items || []
                            }}
                            columns={columns}
                            afterSubmit={() => setCreateGroupModalOpen(false)}
                        />
                    </Modal>
                </div>
            </CardHeader>
            <CardContent>
                {renderContent()}
            </CardContent>
        </Card>
    )
}