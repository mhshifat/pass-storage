import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useTRPC } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { AlertCircleIcon, MergeIcon } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import z from "zod";

const mergeGroupsFormSchema = z.object({
    mergedGroupName: z.string().min(2, "Merged group name must be at least 2 characters").max(50, "Merged group name must be at most 50 characters"),
    selectedGroupIds: z.array(z.number().positive()).min(2, "At least two groups must be selected for merging"),
});

type MergeGroupsFormData = z.infer<typeof mergeGroupsFormSchema>;

interface MergeGroupsFormProps {
    projectId: number;
    selectedGroups: {
        id: number;
        name: string;
        columns: string[];
    }[];
    uniqueMergedColumns: string[];
    onCancel: () => void;
    afterSubmit?: () => void;
}

export default function MergeGroupsForm({ projectId, selectedGroups, uniqueMergedColumns, onCancel, afterSubmit }: MergeGroupsFormProps) {
    const trpc = useTRPC();
    const mergeTableGroupsMutation = useMutation(trpc.projects.mergeTableGroups.mutationOptions({
        onSuccess: () => {
            if (afterSubmit) {
                afterSubmit();
            }
        }
    }));
    const form = useForm<MergeGroupsFormData>({
        defaultValues: {
            mergedGroupName: "",
            selectedGroupIds: selectedGroups.map(group => group.id),
        },
        resolver: zodResolver(mergeGroupsFormSchema),
    });
    const watchValues = useWatch({
        control: form.control,
    })

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => {
                mergeTableGroupsMutation.mutateAsync({
                    mergedGroupName: values.mergedGroupName,
                    selectedGroupIds: values.selectedGroupIds,
                    projectId
                });
            })}>
                <div className="space-y-6">
                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="mergedGroupName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Merged Group Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter name for merged group"
                                            value={field.value}
                                            onChange={field.onChange}
                                            className="mt-2"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="rounded-lg border border-border/40 p-4 bg-muted/30">
                            <h4 className="text-sm font-semibold mb-3">Groups to be merged:</h4>
                            <ul className="space-y-2">
                                {selectedGroups.map((group) => (
                                    <li key={group.id} className="flex items-center gap-2 text-sm">
                                        <div className="h-2 w-2 rounded-full bg-primary" />
                                        <span className="font-medium">{group.name}</span>
                                        <span className="text-muted-foreground">
                                            ({group.columns.length} columns)
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="rounded-lg border border-border/40 p-4 bg-muted/30">
                            <h4 className="text-sm font-semibold mb-3">
                                Resulting columns ({uniqueMergedColumns.length}):
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {uniqueMergedColumns.map((col, idx) => (
                                    <span
                                        key={idx}
                                        className="inline-flex items-center px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium"
                                    >
                                        {col}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-lg p-3">
                            <div className="flex gap-2">
                                <AlertCircleIcon className="h-4 w-4 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                                <div className="text-xs text-amber-800 dark:text-amber-300">
                                    <p className="font-medium mb-1">Note:</p>
                                    <p>The selected groups will be merged into one. This action cannot be undone. All columns from selected groups will be included in the merged group.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button
                            variant="outline"
                            onClick={onCancel}
                            disabled={mergeTableGroupsMutation.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="default"
                            type="submit"
                            loading={mergeTableGroupsMutation.isPending}
                            disabled={!watchValues.mergedGroupName?.trim() || mergeTableGroupsMutation.isPending}
                        >
                            <MergeIcon className="h-4 w-4 mr-2" />
                            Merge {selectedGroups?.length} Groups
                        </Button>
                    </div>
                </div>
            </form>
        </Form>
    )
}