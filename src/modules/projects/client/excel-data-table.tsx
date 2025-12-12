import { Modal } from "@/components/shared/modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import CreateTableGroupForm from "./create-table-group-form";
import { useState } from "react";
import { FileSpreadsheet, TableIcon, AlertCircle, Merge, X, Check } from "lucide-react";
import MergeGroupsForm from "./merge-groups-form";

interface ExcelDataTableProps {
    projectId: number,
    connectionId: number,
    sheetId: string,
    sheetName: string,
}

export default function ExcelDataTable({ projectId, connectionId, sheetId, sheetName }: ExcelDataTableProps) {
    const trpc = useTRPC();
    const { data, isLoading: isLoadingSheet } = useQuery(trpc.google.getSheetData.queryOptions({
        connectionId,
        sheetId,
        sheetName
    }));
    const { data: groupsData, isLoading: isLoadingGroups } = useQuery(trpc.projects.findManyGroupsByProjectId.queryOptions({
        projectId,
        page: 1,
        perPage: 100,
    }));
    const { data: mergeGroupsData, isLoading: isLoadingMergeGroups } = useQuery(trpc.projects.findManyMergeGroupsByProjectId.queryOptions({
        projectId,
        page: 1,
        perPage: 100,
    }));
    const [createGroupModalOpen, setCreateGroupModalOpen] = useState(false);
    const [mergeModalOpen, setMergeModalOpen] = useState(false);
    const [selectedGroupIds, setSelectedGroupIds] = useState<number[]>([]);

    const columns = data?.[0] || [];
    const rows = data?.slice(1) || [];
    const isLoading = isLoadingSheet || isLoadingGroups || isLoadingMergeGroups;

    // Handle group selection
    const toggleGroupSelection = (groupId: number) => {
        setSelectedGroupIds(prev => 
            prev.includes(groupId) 
                ? prev.filter(id => id !== groupId)
                : [...prev, groupId]
        );
    };

    const selectedGroups = groupsData?.items?.filter(item => selectedGroupIds.includes(item.id)) || [];
    const mergedColumns = selectedGroups.flatMap(group => group.columns);
    const uniqueMergedColumns = Array.from(new Set(mergedColumns));

    // Get IDs of groups that are already merged
    const mergedGroupIds = new Set(
        mergeGroupsData?.items?.flatMap(mg => mg.tableGroups.map(tg => tg.tableGroupId)) || []
    );

    // Loading State
    if (isLoading) {
        return (
            <div className="space-y-6">
                <Card className="border-border/40 shadow-sm">
                    <CardHeader className="border-b bg-muted/30">
                        <div className="flex items-center justify-between">
                            <div className="space-y-2 flex-1">
                                <div className="h-6 w-48 bg-muted animate-pulse rounded" />
                                <div className="h-4 w-72 bg-muted animate-pulse rounded" />
                            </div>
                            <div className="h-9 w-40 bg-muted animate-pulse rounded" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <div className="min-w-full">
                                {/* Skeleton Table Header */}
                                <div className="border-b bg-muted/20">
                                    <div className="flex">
                                        {[1, 2, 3, 4, 5, 6].map((col) => (
                                            <div key={col} className="flex-1 p-4 min-w-[150px]">
                                                <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {/* Skeleton Table Rows */}
                                {[1, 2, 3, 4, 5, 6, 7, 8].map((row) => (
                                    <div key={row} className="border-b">
                                        <div className="flex">
                                            {[1, 2, 3, 4, 5, 6].map((col) => (
                                                <div key={col} className="flex-1 p-4 min-w-[150px]">
                                                    <div className="h-4 bg-muted/60 animate-pulse rounded" style={{ animationDelay: `${row * 50 + col * 20}ms` }} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Empty State
    if (!data || columns.length === 0) {
        return (
            <Card className="border-border/40 shadow-sm">
                <CardHeader className="border-b bg-muted/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <FileSpreadsheet className="h-5 w-5 text-primary" />
                                {sheetName}
                            </CardTitle>
                            <CardDescription className="mt-1.5">
                                Excel data from your connected spreadsheet
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="py-24">
                    <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
                        <div className="rounded-full bg-muted p-6 mb-6">
                            <AlertCircle className="h-12 w-12 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">No Data Available</h3>
                        <p className="text-muted-foreground text-sm mb-6">
                            This sheet appears to be empty or doesn&apos;t contain any data. Please check your Excel file and ensure it has data in the selected sheet.
                        </p>
                        <div className="flex gap-3">
                            <Button variant="outline" size="sm">
                                Refresh Data
                            </Button>
                            <Button variant="default" size="sm">
                                Select Different Sheet
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const renderMergedGroups = () => {
        if ((mergeGroupsData?.items?.length || 0) === 0) return null;

        return (
            <div className="space-y-8">
                <div className="flex items-center gap-2 mb-4">
                    <div className="h-px flex-1 bg-linear-to-r from-transparent via-border to-transparent" />
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <Merge className="h-4 w-4" />
                        Merged Groups
                    </div>
                    <div className="h-px flex-1 bg-linear-to-r from-border via-transparent to-transparent" />
                </div>
                {mergeGroupsData?.items?.map((mergedItem) => {
                    // Get columns from all table groups that are part of this merge
                    const mergedGroupColumns = mergedItem.tableGroups
                        .map(tg => groupsData?.items?.find(g => g.id === tg.tableGroupId))
                        .filter(Boolean)
                        .flatMap(g => g!.columns);
                    
                    // Get unique columns
                    const uniqueColumns = Array.from(new Set(mergedGroupColumns));

                    return (
                        <div 
                            key={"MergedTableGroupCard" + mergedItem.id} 
                            className="rounded-lg border-2 border-dashed border-primary/40 overflow-hidden shadow-sm hover:shadow-md transition-all bg-primary/5"
                        >
                            <div className="bg-linear-to-r from-primary/10 to-primary/20 px-6 py-4 border-b border-primary/30">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-md bg-primary/20 p-2 ring-2 ring-primary/30">
                                            <Merge className="h-4 w-4 text-primary" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-lg font-semibold text-foreground">{mergedItem.name}</h3>
                                                <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-medium">
                                                    Merged
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {uniqueColumns.length} columns · {rows.length} rows · {mergedItem.tableGroups.length} groups merged
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-primary/5 hover:bg-primary/10">
                                            {uniqueColumns.map((column, columnIdx) => (
                                                <TableHead 
                                                    key={"MergedTableGroupTableHeader" + mergedItem.id + columnIdx}
                                                    className="font-semibold text-foreground/90 whitespace-nowrap"
                                                >
                                                    {column}
                                                </TableHead>
                                            ))}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {rows.slice(0, 100).map((row, rowIndex) => (
                                            <TableRow 
                                                key={rowIndex}
                                                className="hover:bg-primary/5 transition-colors"
                                            >
                                                {uniqueColumns.map((columnName, cellIndex) => {
                                                    const columnIdx = columns.indexOf(columnName);
                                                    return (
                                                        <TableCell 
                                                            key={cellIndex}
                                                            className="whitespace-nowrap"
                                                        >
                                                            {row[columnIdx] || <span className="text-muted-foreground/50">—</span>}
                                                        </TableCell>
                                                    )
                                                })}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            {rows.length > 100 && (
                                <div className="bg-primary/10 px-6 py-3 border-t border-primary/30 text-center">
                                    <p className="text-sm text-muted-foreground">
                                        Showing first 100 rows of {rows.length} total rows
                                    </p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderTableGroups = () => {
        if ((groupsData?.items?.length || 0) === 0) return null;

        // Filter out groups that are already merged
        const availableGroups = groupsData?.items.filter(item => !mergedGroupIds.has(item.id));

        if (availableGroups?.length === 0) return null;

        return (
            <div className="space-y-8">
                {availableGroups?.map((item) => {
                    const isSelected = selectedGroupIds.includes(item.id);
                    return (
                        <div 
                            key={"ProjectTableGroupCard" + item.id} 
                            className={`rounded-lg border overflow-hidden shadow-sm transition-all ${
                                isSelected 
                                    ? 'border-primary/60 ring-2 ring-primary/20 shadow-md' 
                                    : 'border-border/40 hover:shadow-md'
                            }`}
                        >
                            <div className="bg-linear-to-r from-primary/5 to-primary/10 px-6 py-4 border-b">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => toggleGroupSelection(item.id)}
                                            className={`flex items-center justify-center w-5 h-5 rounded border-2 transition-all ${
                                                isSelected
                                                    ? 'bg-primary border-primary'
                                                    : 'border-muted-foreground/40 hover:border-primary/60'
                                            }`}
                                        >
                                            {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                                        </button>
                                        <div className="rounded-md bg-primary/10 p-2">
                                            <TableIcon className="h-4 w-4 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-foreground">{item.name}</h3>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {item.columns.length} columns · {rows.length} rows
                                            </p>
                                        </div>
                                    </div>
                                    {isSelected && (
                                        <div className="bg-primary/20 text-primary text-xs font-medium px-3 py-1 rounded-full">
                                            Selected
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/30 hover:bg-muted/40">
                                            {item.columns.map((column, columnIdx) => (
                                                <TableHead 
                                                    key={"ProjectTableGroupTableHeader" + item.id + columnIdx}
                                                    className="font-semibold text-foreground/90 whitespace-nowrap"
                                                >
                                                    {column}
                                                </TableHead>
                                            ))}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {rows.slice(0, 100).map((row, rowIndex) => (
                                            <TableRow 
                                                key={rowIndex}
                                                className="hover:bg-muted/20 transition-colors"
                                            >
                                                {item.columns.map((columnName, cellIndex) => {
                                                    const columnIdx = columns.indexOf(columnName);
                                                    return (
                                                        <TableCell 
                                                            key={cellIndex}
                                                            className="whitespace-nowrap"
                                                        >
                                                            {row[columnIdx] || <span className="text-muted-foreground/50">—</span>}
                                                        </TableCell>
                                                    )
                                                })}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            {rows.length > 100 && (
                                <div className="bg-muted/20 px-6 py-3 border-t text-center">
                                    <p className="text-sm text-muted-foreground">
                                        Showing first 100 rows of {rows.length} total rows
                                    </p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderAllData = () => {
        return (
            <div className="rounded-lg border border-border/40 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/30 hover:bg-muted/40">
                                {columns.map((column, columnIdx) => (
                                    <TableHead 
                                        key={"ExcelDataTableTableHeader" + columnIdx}
                                        className="font-semibold text-foreground/90 whitespace-nowrap"
                                    >
                                        {column}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rows.slice(0, 100).map((row, rowIndex) => (
                                <TableRow 
                                    key={rowIndex}
                                    className="hover:bg-muted/20 transition-colors"
                                >
                                    {row.map((cell, cellIndex) => (
                                        <TableCell 
                                            key={cellIndex}
                                            className="whitespace-nowrap"
                                        >
                                            {cell || <span className="text-muted-foreground/50">—</span>}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                {rows.length > 100 && (
                    <div className="bg-muted/20 px-6 py-3 border-t text-center">
                        <p className="text-sm text-muted-foreground">
                            Showing first 100 rows of {rows.length} total rows
                        </p>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Floating Merge Action Bar */}
            {selectedGroupIds.length >= 2 && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5">
                    <Card className="shadow-lg border-primary/20 bg-card">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="bg-primary/10 rounded-full p-2">
                                        <Merge className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold">
                                            {selectedGroupIds.length} groups selected
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {uniqueMergedColumns.length} unique columns will be merged
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 ml-4">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setSelectedGroupIds([])}
                                    >
                                        <X className="h-4 w-4 mr-1" />
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="default"
                                        size="sm"
                                        onClick={() => setMergeModalOpen(true)}
                                    >
                                        <Merge className="h-4 w-4 mr-1" />
                                        Merge Groups
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Merge Confirmation Modal */}
            <Modal
                open={mergeModalOpen}
                onOpenChange={setMergeModalOpen}
                title="Merge Table Groups"
                description="Combine selected groups into a single table group with all columns."
                as="div"
                trigger={null}
            >
                <MergeGroupsForm
                    projectId={projectId}
                    selectedGroups={selectedGroups}
                    uniqueMergedColumns={uniqueMergedColumns}
                    onCancel={() => {
                        setMergeModalOpen(false);
                    }}
                    afterSubmit={() => {
                        setMergeModalOpen(false);
                    }}
                />
            </Modal>

            <Card className="border-border/40 shadow-sm">
                <CardHeader className="border-b bg-linear-to-r from-muted/30 to-muted/50">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <FileSpreadsheet className="h-5 w-5 text-primary" />
                                {sheetName}
                            </CardTitle>
                            <CardDescription className="mt-1.5">
                                {columns.length} columns · {rows.length} rows of data
                            </CardDescription>
                        </div>
                        <Modal
                            open={createGroupModalOpen}
                            onOpenChange={setCreateGroupModalOpen}
                            title="Table Groups"
                            description="Organize your data by creating custom table groups with selected columns."
                            trigger={
                                <Button variant="default" size="sm" className="shadow-sm">
                                    <TableIcon className="h-4 w-4 mr-2" />
                                    Manage Groups
                                </Button>
                            }
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
                <CardContent className="p-6">
                    <div className="space-y-8">
                        {/* Render Merged Groups First */}
                        {renderMergedGroups()}
                        
                        {/* Render Regular Groups or All Data */}
                        {(groupsData?.items?.length || 0) > 0 ? renderTableGroups() : renderAllData()}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}